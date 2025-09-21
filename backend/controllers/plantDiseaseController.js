const githubAIService = require("../services/githubAIService");
const historyRepo = require('../services/historyRepository');
const fs = require("fs");
const path = require('path');
const os = require('os');
const { getStorageBucket } = require('../services/firebaseAdmin');
const logger = require('../services/logger');

class PlantDiseaseController {
  // Detect plant disease from image and symptoms
  async detectDisease(req, res, next) {
    try {
      console.log("🌱 detectDisease called");
      console.log("📩 Request body:", req.body);
      console.log("📂 Uploaded file:", req.file);

      const { symptoms } = req.body;
      const imageFile = req.file;

      // Validate input
      if (!imageFile) {
        console.warn("⚠️ No image file provided");
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      if (!symptoms || symptoms.trim().length === 0) {
        console.warn("⚠️ Symptoms description missing");
        return res.status(400).json({
          success: false,
          message: "Symptoms description is required",
        });
      }

      // Write in-memory buffer to a temp file for analysis
      const tempFilePath = path.join(os.tmpdir(), `upload-${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(imageFile.originalname) || '.jpg'}`);
      fs.writeFileSync(tempFilePath, imageFile.buffer);

      console.log("🔎 Calling GitHub AI Service with:", {
        path: tempFilePath,
        symptoms: symptoms.trim(),
      });

      // Analyze image with GitHub AI
      const analysisResult = await githubAIService.analyzeImage(
        tempFilePath,
        symptoms.trim()
      );

      console.log("✅ Analysis result:", analysisResult);

      // Second pass: Structure the AI answer into JSON (disease, causes, remedies)
      let structured = null;
      try {
        structured = await githubAIService.structureAnalysisToJson(analysisResult.answer);
      } catch (e) {
        console.warn('⚠️ Failed to structure AI response to JSON:', e.message);
      }

      // Upload to Firebase Storage (optional archival)
      try {
        const bucket = getStorageBucket();
        if (bucket) {
          const destFileName = `uploads/${Date.now()}-${path.basename(tempFilePath)}`;
          const [uploaded] = await bucket.upload(tempFilePath, {
            destination: destFileName,
            metadata: {
              contentType: imageFile.mimetype,
            },
          });
          try {
            // Try to make the file public and use HTTPS URL for frontend display
            await uploaded.makePublic();
            analysisResult.uploadedUrl = `https://storage.googleapis.com/${bucket.name}/${destFileName}`;
          } catch (e) {
            // Fallback: use gs:// URL
            analysisResult.uploadedUrl = `gs://${bucket.name}/${destFileName}`;
          }
        }
      } catch (e) {
        console.warn('⚠️ Failed to upload to Firebase Storage:', e.message);
      }

      // Clean up temp file
      PlantDiseaseController.cleanupFile(tempFilePath);

      // Return successful response
      await logger.logAnalysisEvent('analysis_success', { mimetype: imageFile.mimetype, size: imageFile.size || null });

      const responsePayload = {
        answer: analysisResult.answer,
        raw: analysisResult.raw,
        structured: structured, // may be null if structuring failed
        uploadedUrl: analysisResult.uploadedUrl || null,
      };

      // If user is authenticated, persist history entry
      try {
        const userId = req.user && req.user.userId;
        if (userId) {
          // Only use the model-structured plant name; avoid generic headings
          const plantName = (structured && typeof structured.plantName === 'string' && structured.plantName.trim())
            ? structured.plantName.trim().slice(0, 120)
            : 'Unknown Plant';
          await historyRepo.addEntry(userId, {
            plantName,
            symptoms: symptoms.trim(),
            answer: analysisResult.answer,
            structured,
            uploadedUrl: analysisResult.uploadedUrl || null,
          });
        }
      } catch (e) {
        console.warn('⚠️ Failed to persist history entry:', e.message);
      }

      res.status(200).json({
        success: true,
        data: responsePayload,
        message: "Plant disease analysis completed successfully",
      });
    } catch (error) {
      console.error("💥 Error in detectDisease:", error.message);

      // Clean up file in case of error
      if (req.file) {
        try {
          if (typeof tempFilePath === 'string') {
            PlantDiseaseController.cleanupFile(tempFilePath);
          }
        } catch (_) {}
      }

      await logger.logAnalysisEvent('analysis_error', { error: error.message });
      res.status(500).json({
        success: false,
        message: "Failed to detect plant disease",
        error: error.message,
      });
    }
  }

  // Get analysis history (placeholder)
  async getAnalysisHistory(req, res, next) {
    try {
      console.log("📜 getAnalysisHistory called");
      res.status(200).json({
        success: true,
        data: [],
        message: "Analysis history retrieved successfully",
      });
    } catch (error) {
      console.error("💥 Error in getAnalysisHistory:", error.message);
      next(error);
    }
  }

  // Get supported file types
  async getSupportedFormats(req, res, next) {
    try {
      console.log("📑 getSupportedFormats called");
      res.status(200).json({
        success: true,
        data: {
          supportedFormats: ["JPEG", "PNG", "WebP"],
          maxFileSize: "10MB",
          allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
        },
        message: "Supported file formats retrieved successfully",
      });
    } catch (error) {
      console.error("💥 Error in getSupportedFormats:", error.message);
      next(error);
    }
  }

  // Health check
  async healthCheck(req, res, next) {
    try {
      console.log("❤️ healthCheck called");

      const githubAIStatus = process.env.GITHUB_TOKEN
        ? "configured"
        : "not configured";

      res.status(200).json({
        success: true,
        data: {
          service: "Plant Disease Detection API",
          status: "healthy",
          githubAI: githubAIStatus,
          timestamp: new Date().toISOString(),
        },
        message: "Service is healthy",
      });
    } catch (error) {
      console.error("💥 Error in healthCheck:", error.message);
      next(error);
    }
  }

  // Clean up uploaded files
  static cleanupFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🧹 Cleaned up file: ${filePath}`);
      }
    } catch (error) {
      console.error(`💥 Failed to cleanup file ${filePath}:`, error.message);
    }
  }

  // Validate image file
  validateImageFile(file) {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!file) {
      throw new Error("No file provided");
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(
        "Invalid file type. Only JPEG, PNG, and WebP images are allowed."
      );
    }

    if (file.size > maxSize) {
      throw new Error("File too large. Maximum size is 10MB.");
    }

    return true;
  }
}

module.exports = new PlantDiseaseController();
