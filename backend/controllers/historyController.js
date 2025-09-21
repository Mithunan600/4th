const historyRepo = require('../services/historyRepository');

module.exports = {
  async list(req, res) {
    try {
      const userId = req.user && req.user.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const q = (req.query.q || '').toString();
      const items = await historyRepo.listEntries(userId, q);
      res.status(200).json({ success: true, data: items });
    } catch (e) {
      console.error('Error fetching history:', e);
      res.status(500).json({ success: false, message: 'Failed to fetch history' });
    }
  }
};


