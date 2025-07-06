const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: String,
  file: String,
  fileName: String,
  date: { type: Date, default: Date.now }
  lu: { type: Boolean, default: false } // Ajout du champ "lu"
});
module.exports = mongoose.model('Message', MessageSchema);
