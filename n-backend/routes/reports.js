const express    = require('express');
const router     = express.Router();
const Book       = require('../models/Book');
const User       = require('../models/User');
const IssuedBook = require('../models/IssuedBook');
const Settings   = require('../models/Settings');
const { authMiddleware, librarianOnly } = require('../middleware/auth');

router.get('/summary', authMiddleware, async (req, res) => {
  const today = new Date();
  const [total_books, total_members, issued_books, returned_books, fines, overdue_books] = await Promise.all([
    Book.countDocuments(),
    User.countDocuments({ role: 'student', approved: true }),
    IssuedBook.countDocuments({ status: 'issued' }),
    IssuedBook.countDocuments({ status: 'returned' }),
    IssuedBook.aggregate([{ $group: { _id: null, total: { $sum: '$fine' } } }]),
    IssuedBook.countDocuments({ status: 'issued', due_date: { $lt: today } })
  ]);
  
  const booksData = await Book.aggregate([{ $group: { _id: null, total_copies: { $sum: '$total_copies' }, available: { $sum: '$available_copies' } } }]);
  const total_copies = booksData[0]?.total_copies || 0;
  const available_copies = booksData[0]?.available || 0;

  res.json({
    total_books,
    total_members,
    issued_books,
    returned_books,
    total_fines: fines[0]?.total || 0,
    overdue_books,
    total_copies,
    available_copies
  });
});

router.get('/overdue', authMiddleware, librarianOnly, async (req, res) => {
  const today   = new Date();
  const settings = await Settings.findOne() || { fineRate: 5 };
  
  const records = await IssuedBook.find({ status: 'issued', due_date: { $lt: today } })
    .populate('book_id',    'title')
    .populate('student_id', 'name username');

  res.json(records.map(r => {
    const days = Math.max(0, Math.ceil((today - new Date(r.due_date)) / (1000 * 60 * 60 * 24)));
    return {
      id:           r._id,
      title:        r.book_id?.title,
      student_name: r.student_id?.name,
      username:     r.student_id?.username,
      issue_date:   r.issue_date,
      due_date:     r.due_date,
      days_overdue: days,
      estimated_fine: days * settings.fineRate,
    };
  }));
});

router.get('/stats', authMiddleware, librarianOnly, async (req, res) => {
  try {
    // 1. Popular Books (Top 5)
    const popularBooks = await IssuedBook.aggregate([
      { $group: { _id: '$book_id', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'book' } },
      { $unwind: '$book' },
      { $project: { title: '$book.title', count: 1 } }
    ]);

    // 2. Daily Activity (Last 14 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const dailyActivity = await IssuedBook.aggregate([
      { $match: { issue_date: { $gte: fourteenDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$issue_date" } },
          count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    res.json({ popularBooks, dailyActivity });
  } catch (err) {
    res.status(500).json({ message: 'Error generating stats' });
  }
});

module.exports = router;
