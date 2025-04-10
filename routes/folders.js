const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Folder = require('../models/Folder');
const File = require('../models/File');

// Create folder
router.post('/', auth, async (req, res) => {
    try {
        const folder = new Folder({
            name: req.body.name,
            owner: req.user._id,
            parent: req.body.parentId || null,
            path: req.body.parentId ? 
                `${req.body.parentPath}/${req.body.name}` : 
                req.body.name
        });

        await folder.save();
        res.status(201).json(folder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all folders
router.get('/', auth, async (req, res) => {
    try {
        const folders = await Folder.find({
            owner: req.user._id,
            isDeleted: false
        }).populate('parent');
        res.json(folders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get folder by ID with contents
router.get('/:id', auth, async (req, res) => {
    try {
        const folder = await Folder.findOne({
            _id: req.params.id,
            owner: req.user._id
        }).populate('parent');

        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        // Get subfolders
        const subfolders = await Folder.find({
            parent: folder._id,
            isDeleted: false
        });

        // Get files in folder
        const files = await File.find({
            folder: folder._id,
            isDeleted: false
        });

        res.json({
            folder,
            contents: {
                subfolders,
                files
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update folder
router.patch('/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ message: 'Invalid updates' });
    }

    try {
        const folder = await Folder.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        updates.forEach(update => folder[update] = req.body[update]);
        await folder.save();
        res.json(folder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete folder (soft delete)
router.delete('/:id', auth, async (req, res) => {
    try {
        const folder = await Folder.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        // Soft delete folder
        folder.isDeleted = true;
        folder.deletedAt = Date.now();
        await folder.save();

        // Soft delete all files in folder
        await File.updateMany(
            { folder: folder._id },
            { 
                isDeleted: true,
                deletedAt: Date.now()
            }
        );

        // Soft delete all subfolders
        await Folder.updateMany(
            { parent: folder._id },
            {
                isDeleted: true,
                deletedAt: Date.now()
            }
        );

        res.json(folder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Restore folder from trash
router.post('/:id/restore', auth, async (req, res) => {
    try {
        const folder = await Folder.findOne({
            _id: req.params.id,
            owner: req.user._id,
            isDeleted: true
        });

        if (!folder) {
            return res.status(404).json({ message: 'Folder not found in trash' });
        }

        // Restore folder
        folder.isDeleted = false;
        folder.deletedAt = null;
        await folder.save();

        // Restore all files in folder
        await File.updateMany(
            { folder: folder._id },
            { 
                isDeleted: false,
                deletedAt: null
            }
        );

        // Restore all subfolders
        await Folder.updateMany(
            { parent: folder._id },
            {
                isDeleted: false,
                deletedAt: null
            }
        );

        res.json(folder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 