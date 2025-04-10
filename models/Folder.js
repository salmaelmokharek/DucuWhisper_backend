const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null
    },
    path: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
folderSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for getting nested folders
folderSchema.virtual('subfolders', {
    ref: 'Folder',
    localField: '_id',
    foreignField: 'parent'
});

// Virtual for getting files in the folder
folderSchema.virtual('files', {
    ref: 'File',
    localField: '_id',
    foreignField: 'folder'
});

// Enable virtuals in JSON
folderSchema.set('toJSON', { virtuals: true });
folderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Folder', folderSchema); 