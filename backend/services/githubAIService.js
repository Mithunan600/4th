const fs = require("fs");
const path = require("path");

// Use built-in fetch in Node.js 18+, else fallback to node-fetch
let fetchFn;
if (typeof fetch === "function") {
  fetchFn = fetch;
  console.log("✅ Using built-in fetch");
} else {
  console.log("⚠️ Using node-fetch (install with: npm install node-fetch@2)");
  fetchFn = require("node-fetch");
}

class GithubAIService {
  constructor() {
    // GitHub Models endpoint
    this.apiUrl = "https://models.inference.ai.azure.com/chat/completions";
    // GPT-4o and GPT-4o-mini both support vision
    this.model = "gpt-4o-mini";
    this.token = process.env.GITHUB_TOKEN;

    if (!this.token) {
      throw new Error("❌ GitHub token not configured. Set GITHUB_TOKEN in .env");
    }
  }

  // Analyze plant disease using image + text
  async analyzeImage(imagePath, symptoms) {
    try {
      console.log("➡️ analyzeImage called with:", { imagePath, symptoms });

      // 1. Validate file existence
      if (!fs.existsSync(imagePath)) {
        throw new Error(`❌ Image file not found: ${imagePath}`);
      }

      // 2. Convert image to base64
      const imageBuffer = fs.readFileSync(imagePath);
      const mimeType = this.getMimeType(imagePath);
      const base64Image = imageBuffer.toString("base64");

      // 3. Build request body with both text + image
      const body = {
        model: this.model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this plant image. Symptoms reported: ${symptoms}. 
                       First identify the plant species/name, then identify possible diseases. 
                       Suggest actionable remedies and also list recommended pesticides/insecticides if applicable.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
      };

      console.log("📤 Sending request to GitHub Models API...");

      // 4. Send request
      const response = await fetchFn(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      console.log("📥 Response status:", response.status);

      const text = await response.text();
      console.log("Raw response text:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`❌ Failed to parse JSON: ${e.message}\nRaw: ${text}`);
      }

      console.log(
        "✅ Parsed GitHub API response:",
        JSON.stringify(data, null, 2)
      );

      // 5. Extract model’s answer
      let answer = "No analysis returned";
      const choice = data.choices?.[0];

      if (choice?.message?.content) {
        // Sometimes content is string, sometimes an array
        if (typeof choice.message.content === "string") {
          answer = choice.message.content;
        } else if (Array.isArray(choice.message.content)) {
          answer = choice.message.content
            .map((c) => c.text || "")
            .join("\n")
            .trim();
        }
      }

      return { answer, raw: data };
    } catch (error) {
      console.error("💥 Error in analyzeImage:", error.message);
      throw error;
    }
  }

  // Take the freeform model answer and ask the model again to structure it as strict JSON
  async structureAnalysisToJson(freeformAnswer) {
    try {
      if (!freeformAnswer || typeof freeformAnswer !== "string") {
        throw new Error("Invalid freeform answer to structure");
      }

      const body = {
        model: this.model,
        messages: [
          {
            role: "system",
            content: [
              {
                type: "text",
                text:
                  "You are a data formatter. Given an agricultural disease analysis, extract and return STRICT JSON only with keys: plantName (string), disease (string), causes (string[]), remedies (string[]), pesticides (string[]). No prose. No markdown. Ensure valid JSON. If unknown, use empty array or empty string.",
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze and convert to JSON as per schema: ${freeformAnswer}`,
              },
            ],
          },
        ],
        temperature: 0,
      };

      const response = await fetchFn(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Failed to parse JSON from structuring call: ${e.message}\nRaw: ${text}`);
      }

      const choice = data.choices?.[0];
      let structuredText = "";
      if (choice?.message?.content) {
        if (typeof choice.message.content === "string") {
          structuredText = choice.message.content;
        } else if (Array.isArray(choice.message.content)) {
          structuredText = choice.message.content
            .map((c) => c.text || "")
            .join("\n")
            .trim();
        }
      }

      // The model may still wrap content; try to parse JSON substring
      let parsed;
      try {
        parsed = JSON.parse(structuredText);
      } catch (_) {
        // attempt to extract JSON block
        const match = structuredText.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        } else {
          throw new Error("Model did not return valid JSON structure");
        }
      }

      // Normalize shape
      return {
        plantName: typeof parsed.plantName === "string" ? parsed.plantName : "",
        disease: typeof parsed.disease === "string" ? parsed.disease : "",
        causes: Array.isArray(parsed.causes) ? parsed.causes : [],
        remedies: Array.isArray(parsed.remedies) ? parsed.remedies : [],
        pesticides: Array.isArray(parsed.pesticides) ? parsed.pesticides : [],
        rawStructured: structuredText,
      };
    } catch (error) {
      console.error("💥 Error in structureAnalysisToJson:", error.message);
      throw error;
    }
  }

  // Guess MIME type by extension
  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case ".jpg":
      case ".jpeg":
        return "image/jpeg";
      case ".png":
        return "image/png";
      case ".webp":
        return "image/webp";
      default:
        throw new Error(`Unsupported image type: ${ext}`);
    }
  }
}

module.exports = new GithubAIService();
