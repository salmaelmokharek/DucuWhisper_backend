const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Register
router.post('/register', async (req, res) => {
    try {
        console.log('Registration request received:', req.body);
        const { email, password, name } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Create new user
        console.log('Creating new user...');
        const user = new User({ email, password, name });
        console.log('User object created:', user);
        
        await user.save();
        console.log('User saved successfully:', user._id);

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        res.status(201).json({ user, token });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ message: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        res.json({ user, token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                  Please click on the following link, or paste this into your browser to complete the process:\n\n
                  ${process.env.FRONTEND_URL}/reset-password/${resetToken}\n\n
                  If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Reset password
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password has been reset' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    res.json(req.user);
});

module.exports = router; 