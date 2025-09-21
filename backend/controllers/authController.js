const jwt = require('jsonwebtoken');
const userRepo = require('../services/userRepository');
const { initializeFirebaseAdmin } = require('../services/firebaseAdmin');
const logger = require('../services/logger');

class AuthController {

  // Update user profile
  async updateProfile(req, res) {
    try {
      const { name, email } = req.body;
      const userId = req.user.userId;

      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: 'Name and email are required'
        });
      }

      // Check if email is already taken by another user
      const emailExists = await userRepo.findByEmail(email);
      if (emailExists && emailExists.id !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered by another user'
        });
      }

      const user = await userRepo.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update user details
      const updated = await userRepo.updateProfile(userId, name, email);

      await logger.logAuthEvent('profile_updated', { userId: updated.id });
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: updated
      });

    } catch (error) {
      console.error('Error in updateProfile:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get user profile
  async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const user = await userRepo.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        user
      });

    } catch (error) {
      console.error('Error in getProfile:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

// Export individual methods
module.exports = {
  getProfile: async (req, res) => {
    const controller = new AuthController();
    await controller.getProfile(req, res);
  },
  updateProfile: async (req, res) => {
    const controller = new AuthController();
    await controller.updateProfile(req, res);
  },
  // Verify Firebase ID token and mint API JWT
  loginWithFirebase: async (req, res) => {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ success: false, message: 'idToken is required' });
      }

      const admin = initializeFirebaseAdmin();
      if (!admin) {
        return res.status(500).json({ success: false, message: 'Firebase not configured on server' });
      }

      const decoded = await admin.auth().verifyIdToken(idToken);
      const user = await userRepo.upsertFromFirebaseClaims(decoded);

      const token = jwt.sign(
        { userId: user.id, phone: user.phone },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.status(200).json({ success: true, token, user });
    } catch (error) {
      console.error('Error in loginWithFirebase:', error);
      return res.status(401).json({ success: false, message: 'Invalid Firebase token' });
    }
  }
};
