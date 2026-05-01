const mongoose = require('mongoose');

const issuedBookSchema = new mongoose.Schema({
  book_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'Book',  required: true },
  student_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
  issue_date:  { type: Date, default: Date.now },
  due_date:    { type: Date, required: true },
  return_date: { type: Date, default: null },
  fine:        { type: Number, default: 0 },
  damage_fine: { type: Number, default: 0 },
  status:      { type: String, enum: ['issued', 'returned'], default: 'issued' },
});

module.exports = mongoose.model('IssuedBook', issuedBookSchema);
