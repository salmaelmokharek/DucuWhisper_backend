const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../config/multer');
const File = require('../models/File');
const fs = require('fs').promises;
const path = require('path');

// Upload file
router.post('/upload', auth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const file = new File({
            name: req.body.name || req.file.originalname,
            originalName: req.file.originalname,
            path: req.file.path,
            size: req.file.size,
            mimeType: req.file.mimetype,
            owner: req.user._id,
            folder: req.body.folderId || null
        });

        await file.save();
        res.status(201).json(file);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all files
router.get('/', auth, async (req, res) => {
    try {
        const files = await File.find({ 
            owner: req.user._id,
            isDeleted: false
        }).populate('folder');
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get file by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const file = await File.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.json(file);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update file
router.patch('/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'folder', 'isFavorite'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ message: 'Invalid updates' });
    }

    try {
        const file = await File.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        updates.forEach(update => file[update] = req.body[update]);
        await file.save();
        res.json(file);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete file (soft delete)
router.delete('/:id', auth, async (req, res) => {
    try {
        const file = await File.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        file.isDeleted = true;
        file.deletedAt = Date.now();
        await file.save();
        res.json(file);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Restore file from trash
router.post('/:id/restore', auth, async (req, res) => {
    try {
        const file = await File.findOne({
            _id: req.params.id,
            owner: req.user._id,
            isDeleted: true
        });

        if (!file) {
            return res.status(404).json({ message: 'File not found in trash' });
        }

        file.isDeleted = false;
        file.deletedAt = null;
        await file.save();
        res.json(file);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Generate share link
router.post('/:id/share', auth, async (req, res) => {
    try {
        const file = await File.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        const shareToken = crypto.randomBytes(20).toString('hex');
        file.shareLink = shareToken;
        file.shareExpiresAt = req.body.expiresAt || null;
        await file.save();

        res.json({ shareLink: `${process.env.FRONTEND_URL}/shared/${shareToken}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Download file
router.get('/:id/download', auth, async (req, res) => {
    try {
        const file = await File.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.download(file.path, file.originalName);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 