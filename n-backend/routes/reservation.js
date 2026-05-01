const express     = require('express');
const router      = express.Router();
const Reservation = require('../models/Reservation');
const Book        = require('../models/Book');
const { authMiddleware, librarianOnly } = require('../middleware/auth');

// Reserve a book (Members)
router.post('/', authMiddleware, async (req, res) => {
  const { book_id } = req.body;
  const book = await Book.findById(book_id);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  
  // Optional: check if book is actually out. 
  // User said "If a book is currently out", so we check available_copies.
  if (book.available_copies > 0) 
    return res.status(400).json({ message: 'Book is currently available on shelf' });

  const existing = await Reservation.findOne({ book_id, student_id: req.user.id, status: 'pending' });
  if (existing) return res.status(400).json({ message: 'You already reserved this book' });

  await Reservation.create({ book_id, student_id: req.user.id });
  res.json({ message: 'Reservation successful' });
});

// My reservations (Member)
router.get('/my', authMiddleware, async (req, res) => {
  const list = await Reservation.find({ student_id: req.user.id, status: 'pending' })
    .populate('book_id', 'title author isbn')
    .sort({ reserve_date: -1 });
  res.json(list);
});

// All reservations (Librarian)
router.get('/', authMiddleware, librarianOnly, async (req, res) => {
  const list = await Reservation.find({ status: 'pending' })
    .populate('book_id', 'title isbn')
    .populate('student_id', 'name username')
    .sort({ reserve_date: 1 }); // Oldest first (FIFO)
  res.json(list);
});

// Cancel reservation
router.delete('/:id', authMiddleware, async (req, res) => {
  await Reservation.findByIdAndDelete(req.params.id);
  res.json({ message: 'Reservation removed' });
});

module.exports = router;
