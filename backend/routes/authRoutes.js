const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/auth/send-otp
// @desc    Send OTP to phone number
// @access  Public
// Removed legacy OTP route

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and login
// @access  Public
// Removed legacy OTP route

// @route   POST /api/auth/register
// @desc    Register new user with OTP verification
// @access  Public
// Removed legacy register with OTP route

// @route   POST /api/auth/check-phone
// @desc    Check if phone number exists
// @access  Public
// Removed legacy check-phone route

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticateToken, authController.getProfile);

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', authenticateToken, authController.updateProfile);

// Firebase auth token exchange
// @route   POST /api/auth/login-with-firebase
// @desc    Verify Firebase ID token and return API JWT
// @access  Public
router.post('/login-with-firebase', authController.loginWithFirebase);

module.exports = router;
