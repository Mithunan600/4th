import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, FileText, Loader2, AlertCircle, CheckCircle, Leaf, Shield, Droplets, Sun } from 'lucide-react';
import { detectPlantDisease } from '../services/plantDiseaseAPI';
import './PlantDiseaseDetector.css';

const PlantDiseaseDetector = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // backend structured + answer
  const [error, setError] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let stream;
    async function openCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (e) {
        setError('Unable to access camera');
        setCameraOpen(false);
      }
    }
    if (cameraOpen) openCamera();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [cameraOpen]);

  // Restore last analysis on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lastAnalysis');
      if (saved) {
        const obj = JSON.parse(saved);
        if (obj && obj.result) {
          setResult(obj.result);
          if (obj.imagePreview) setImagePreview(obj.imagePreview);
          if (obj.symptoms) setSymptoms(obj.symptoms);
        }
      }
    } catch (_) {}
  }, []);

  // Function to parse and format AI response without losing information
  const parseAIResponse = (response) => {
    if (!response) return null;

    const sections = {
      disease: '',
      description: '',
      treatment: '',
      prevention: '',
      confidence: '',
      additional: '',
      raw: response // Always keep the full raw response
    };

    // Get the first paragraph as disease information
    const paragraphs = response.split('\n\n').filter(p => p.trim());
    if (paragraphs.length > 0) {
      sections.disease = paragraphs[0].trim();
    }

    // Split response into lines and process
    const lines = response.split('\n').map(line => line.trim()).filter(line => line);
    
    let currentSection = 'additional';
    let currentContent = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for section headers - be more flexible and preserve content
      if (line.toLowerCase().includes('description') && (line.includes(':') || line.includes('-'))) {
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = 'description';
        currentContent = [line]; // Keep the full line including the header
      } else if (line.toLowerCase().includes('treatment') && (line.includes(':') || line.includes('-'))) {
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = 'treatment';
        currentContent = [line]; // Keep the full line including the header
      } else if (line.toLowerCase().includes('prevention') && (line.includes(':') || line.includes('-'))) {
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = 'prevention';
        currentContent = [line]; // Keep the full line including the header
      } else if (line.toLowerCase().includes('confidence') && (line.includes(':') || line.includes('-'))) {
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = 'confidence';
        currentContent = [line]; // Keep the full line including the header
      } else if (line.match(/^[A-Z][A-Z\s]+$/) && line.length > 3) {
        // Likely a header (all caps with spaces)
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = 'additional';
        currentContent = [line];
      } else {
        currentContent.push(line);
      }
    }

    // Add remaining content
    if (currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n');
    }

    return sections;
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image || !symptoms.trim()) {
      setError('Please upload an image and describe the symptoms');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await detectPlantDisease(image, symptoms);
      setResult(data); // contains answer and possibly structured
      // Persist last analysis so navigating away retains it
      try {
        const payload = { result: data, imagePreview, symptoms, savedAt: Date.now() };
        localStorage.setItem('lastAnalysis', JSON.stringify(payload));
      } catch (_) {}
      // Emit event so History page refreshes if logged in
      try {
        const evt = new CustomEvent('analysis:completed');
        window.dispatchEvent(evt);
      } catch (_) {}
    } catch (err) {
      setError(err.message || 'An error occurred while detecting the disease');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setImage(null);
    setImagePreview(null);
    setSymptoms('');
    setResult(null);
    setError(null);
    try { localStorage.removeItem('lastAnalysis'); } catch (_) {}
  };

  const loadJsPDF = async () => {
    if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
    await new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-jspdf]');
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
      s.async = true;
      s.setAttribute('data-jspdf', '1');
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
    return window.jspdf.jsPDF;
  };

  const handleDownloadPdf = async () => {
    try {
      const jsPDF = await loadJsPDF();
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });

      const margin = 40;
      const maxWidth = 515; // a4 width 595 - margins
      let y = margin;

      const title = (result?.structured?.plantName || 'Plant Analysis');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(title, margin, y);
      y += 22;

      if (result?.structured?.disease) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text(`Disease: ${result.structured.disease}`, margin, y);
        y += 18;
      }

      const subtitle = 'Complete Analysis';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(subtitle, margin, y);
      y += 16;

      const text = (result?.answer || '').trim();
      doc.setFont('courier', 'normal');
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(text, maxWidth);
      for (let i = 0; i < lines.length; i++) {
        if (y > 800 - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(lines[i], margin, y);
        y += 14;
      }

      const fileName = `${(result?.structured?.plantName || 'plant-analysis').replace(/[^a-z0-9\-]/gi,'_')}-${Date.now()}.pdf`;
      doc.save(fileName);
    } catch (e) {
      setError('Failed to generate PDF');
    }
  };

  return (
    <div className="plant-detector-container">
      <div className="detector-card">
        <h2>Plant Disease Detection</h2>

        <form onSubmit={handleSubmit} className="detection-form">
          {/* Image Upload Section */}
          <div className="upload-section">
            <label className="upload-label">
              <div className="upload-area">
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Plant preview" />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <Camera size={48} />
                    <p>Click to upload plant image</p>
                    <span>Supports JPG, PNG, WebP</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="file-input"
                />
                <div className="camera-actions">
                  {!cameraOpen ? (
                    <button type="button" className="camera-btn" onClick={() => setCameraOpen(true)}>
                      <Camera size={18} /> Use Camera
                    </button>
                  ) : (
                    <button type="button" className="camera-btn" onClick={() => setCameraOpen(false)}>
                      ✕ Close Camera
                    </button>
                  )}
                </div>
              </div>
            </label>
          </div>

          {cameraOpen && (
            <div className="camera-panel">
              <video ref={videoRef} autoPlay playsInline className="camera-video" />
              <canvas ref={canvasRef} className="camera-canvas" style={{ display: 'none' }} />
              <button
                type="button"
                className="camera-capture-btn"
                onClick={() => {
                  try {
                    const video = videoRef.current;
                    const canvas = canvasRef.current;
                    if (!video || !canvas) return;
                    const w = video.videoWidth || 640;
                    const h = video.videoHeight || 480;
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0, w, h);
                    canvas.toBlob((blob) => {
                      if (!blob) return;
                      const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
                      setImage(file);
                      const reader = new FileReader();
                      reader.onload = (e) => setImagePreview(e.target.result);
                      reader.readAsDataURL(file);
                      setCameraOpen(false);
                      setError(null);
                    }, 'image/jpeg', 0.92);
                  } catch (e) {
                    setError('Failed to capture image');
                  }
                }}
              >
                📸 Capture
              </button>
            </div>
          )}

          {/* Symptoms Input Section */}
          <div className="symptoms-section">
            <label htmlFor="symptoms" className="symptoms-label">
              <FileText size={20} />
              Describe the symptoms you observe:
            </label>
            <textarea
              id="symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., Yellow spots on leaves, wilting, brown patches, unusual growth patterns..."
              className="symptoms-input"
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !image || !symptoms.trim()}
            className="submit-button"
          >
            {loading ? (
              <>
                <Loader2 className="spinner" />
                Analyzing...
              </>
            ) : (
              <>
                <Upload size={20} />
                Detect Disease
              </>
            )}
          </button>
        </form>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="result-section">
            <h3>🌱 Plant Disease Analysis Results</h3>
            <div className="result-card">
              <div className="result-header">
                <CheckCircle className="success-icon" />
                <span className="analysis-complete">Analysis Complete</span>
              </div>
              
              {(() => {
                const parsedResponse = parseAIResponse(result.answer || "");
                const structured = result.structured;
                return (
                  <div className="formatted-response">
                    {/* If structured JSON available, show plant name, disease, causes, and remedies */}
                    {structured && (
                      <>
                        {/* Plant Name Section */}
                        {structured.plantName && (
                          <div className="response-section plant-name-section">
                            <div className="section-header">
                              <Leaf className="section-icon" />
                              <h4>Plant Name</h4>
                            </div>
                            <div className="section-content">
                              <div className="plant-name">{structured.plantName}</div>
                            </div>
                          </div>
                        )}

                        {/* Disease Section */}
                        {structured.disease && (
                          <div className="response-section disease-section">
                            <div className="section-header">
                              <Shield className="section-icon" />
                              <h4>Disease</h4>
                            </div>
                            <div className="section-content">
                              <div className="disease-summary">{structured.disease}</div>
                            </div>
                          </div>
                        )}

                        {/* Causes Section */}
                        {Array.isArray(structured.causes) && structured.causes.length > 0 && (
                          <div className="response-section causes-section">
                            <div className="section-header">
                              <FileText className="section-icon" />
                              <h4>Causes</h4>
                            </div>
                            <div className="section-content">
                              <details>
                                <summary>Show Causes</summary>
                                <ul>
                                  {structured.causes.map((item, idx) => (
                                    <li key={`cause-${idx}`}>{item}</li>
                                  ))}
                                </ul>
                              </details>
                            </div>
                          </div>
                        )}

                        {/* Remedies Section */}
                        {Array.isArray(structured.remedies) && structured.remedies.length > 0 && (
                          <div className="response-section remedies-section">
                            <div className="section-header">
                              <Droplets className="section-icon" />
                              <h4>Remedies</h4>
                            </div>
                            <div className="section-content">
                              <details>
                                <summary>Show Remedies</summary>
                                <ul>
                                  {structured.remedies.map((item, idx) => (
                                    <li key={`remedy-${idx}`}>{item}</li>
                                  ))}
                                </ul>
                              </details>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {/* Disease Information removed per request */}

                    {/* Confidence Level */}
                    {parsedResponse.confidence && (
                      <div className="response-section confidence-section">
                        <div className="section-header">
                          <Shield className="section-icon" />
                          <h4>Confidence & Analysis</h4>
                        </div>
                        <div className="section-content">
                          <pre className="preserved-content">{parsedResponse.confidence}</pre>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {parsedResponse.description && (
                      <div className="response-section description-section">
                        <div className="section-header">
                          <FileText className="section-icon" />
                          <h4>Description & Details</h4>
                        </div>
                        <div className="section-content">
                          <pre className="preserved-content">{parsedResponse.description}</pre>
                        </div>
                      </div>
                    )}

                    {/* Pesticides / Insecticides collapsible using structured data */}
                    {structured && Array.isArray(structured.pesticides) && structured.pesticides.length > 0 && (
                      <div className="response-section remedies-section">
                        <div className="section-header">
                          <Droplets className="section-icon" />
                          <h4>Pesticides / Insecticides</h4>
                        </div>
                        <div className="section-content">
                          <details>
                            <summary>Show Pesticides / Insecticides</summary>
                            <ul>
                              {structured.pesticides.map((item, idx) => (
                                <li key={`pesticide-${idx}`}>{item}</li>
                              ))}
                            </ul>
                          </details>
                        </div>
                      </div>
                    )}

                    {/* Prevention */}
                    {parsedResponse.prevention && (
                      <div className="response-section prevention-section">
                        <div className="section-header">
                          <Sun className="section-icon" />
                          <h4>Prevention & Management</h4>
                        </div>
                        <div className="section-content">
                          <pre className="preserved-content">{parsedResponse.prevention}</pre>
                        </div>
                      </div>
                    )}


                    {/* Complete Analysis collapsible */}
                    <div className="response-section complete-response-section">
                      <div className="section-header">
                        <FileText className="section-icon" />
                        <h4>Complete Analysis</h4>
                      </div>
                      <div className="section-content">
                        <details>
                          <summary>Show Complete Analysis</summary>
                          <pre className="complete-response">{parsedResponse.raw}</pre>
                        </details>
                        <div className="download-actions">
                          <button type="button" className="download-pdf-btn" onClick={handleDownloadPdf}>
                            ⬇️ Download PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <button onClick={resetForm} className="reset-button">
              🔄 Analyze Another Plant
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantDiseaseDetector;
