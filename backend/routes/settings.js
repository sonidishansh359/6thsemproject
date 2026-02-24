const express = require('express');
const router = express.Router();
const SystemSettings = require('../models/SystemSettings');
const auth = require('../middleware/auth');

// Middleware to check if user is admin
const adminAuth = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        next();
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get current settings
router.get('/', async (req, res) => {
    try {
        const settings = await SystemSettings.getSettings();
        res.json(settings);
    } catch (err) {
        console.error('Error fetching settings:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update settings (Admin only)
router.put('/', auth, adminAuth, async (req, res) => {
    try {
        const { commissionRate } = req.body;

        // Validate input
        if (commissionRate === undefined || commissionRate < 0 || commissionRate > 100) {
            return res.status(400).json({ message: 'Invalid commission rate. Must be between 0 and 100.' });
        }

        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = new SystemSettings({ commissionRate });
        } else {
            settings.commissionRate = commissionRate;
            settings.updatedAt = Date.now();
        }

        await settings.save();
        console.log(`⚙️ System Settings Updated: Commission Rate = ${commissionRate}%`);

        res.json(settings);
    } catch (err) {
        console.error('Error updating settings:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
