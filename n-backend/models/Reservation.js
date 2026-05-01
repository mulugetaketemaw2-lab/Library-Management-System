const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  book_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  student_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reserve_date: { type: Date, default: Date.now },
  status:      { type: String, enum: ['pending', 'notified', 'completed', 'cancelled'], default: 'pending' },
});

module.exports = mongoose.model('Reservation', reservationSchema);
