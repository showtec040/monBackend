const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
    message: { type: String, required: true },
    type: { type: String, default: "text" },
    fileName: { type: String },
    date: { type: Date, default: Date.now },
    lu: { type: Boolean, default: false }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = { Message };