const mongoose = require('mongoose');

const documentArchiveSchema = new mongoose.Schema({
    numeroDoc: String,
    titre: String,
    type: { type: String, enum: ['document', 'media'] },
    filename: String,
    originalname: String,
    departement: String,
    uploadedBy: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DocumentArchive', documentArchiveSchema);