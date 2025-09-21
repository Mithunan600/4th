const express = require('express');
const plantDiseaseController = require('../controllers/plantDiseaseController');
const { upload, handleUploadError } = require('../middleware/uploadMiddleware');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');
const historyController = require('../controllers/historyController');

const router = express.Router();

// @route   POST /api/detect-disease
// @desc    Detect plant disease from image and symptoms
// @access  Public
router.post('/detect-disease', 
  optionalAuth,
  upload.single('image'),
  handleUploadError,
  plantDiseaseController.detectDisease
);

// @route   GET /api/health
// @desc    Check service health
// @access  Public
router.get('/health', plantDiseaseController.healthCheck);

// @route   GET /api/history
// @desc    Get user analysis history
// @access  Private
router.get('/history', authenticateToken, historyController.list);

// @route   GET /api/formats
// @desc    Get supported file formats
// @access  Public
router.get('/formats', plantDiseaseController.getSupportedFormats);

// @route   GET /api/history
// @desc    Get analysis history (placeholder)
// @access  Public
router.get('/history', plantDiseaseController.getAnalysisHistory);

module.exports = router;