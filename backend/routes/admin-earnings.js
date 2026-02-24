const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Admin = require('../models/Admin');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Middleware to ensure user is admin
const adminAuth = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        next();
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Admin Wallet Balance and Stats
router.get('/balance', auth, adminAuth, async (req, res) => {
    try {
        // Find admin document for this user, or create one if it doesn't exist (lazy initialization)
        let admin = await Admin.findOne({ user: req.user.id });

        if (!admin) {
            // Check if user is actually admin
            const user = await User.findById(req.user.id);
            if (user && user.role === 'admin') {
                admin = new Admin({ user: req.user.id });
                await admin.save();
            } else {
                return res.status(404).json({ message: 'Admin profile not found' });
            }
        }

        res.json({
            availableBalance: admin.availableBalance,
            totalEarnings: admin.totalEarnings
        });
    } catch (err) {
        console.error('Error fetching admin balance:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Admin Transaction History
router.get('/transactions', auth, adminAuth, async (req, res) => {
    try {
        // We need to fetch transactions where the admin was involved.
        // However, the Transaction model might not have an 'admin' field yet.
        // For now, checks if we add an 'admin' field to Transaction or just rely on the 'type' and context.
        // IF we are strictly following the plan, we should update Transaction model or just query by type if it's unique enough.
        // BUT, the plan says "Create 'debit' Transaction for Admin".
        // Let's assume we will add an 'admin' field to Transaction or use a specific convention.
        // For this implementation, I will assume we query by `admin: adminId` (need to add this field to Transaction schema or use a workaround).

        // Workaround: Find transactions that are NOT owner/deliveryBoy specific OR explicitly add admin field.
        // Better Approach: Modify Transaction model to include `admin`.

        // For now, let's look for an Admin document first.
        let admin = await Admin.findOne({ user: req.user.id });
        if (!admin) {
            return res.json([]);
        }

        const transactions = await Transaction.find({ admin: admin._id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(transactions);
    } catch (err) {
        console.error('Error fetching admin transactions:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
