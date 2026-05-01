const express    = require('express');
const router     = express.Router();
const IssuedBook = require('../models/IssuedBook');
const Book       = require('../models/Book');
const User       = require('../models/User');
const Settings   = require('../models/Settings');
const { authMiddleware, librarianOnly } = require('../middleware/auth');

// GET all records (Librarians only)
router.get('/', authMiddleware, librarianOnly, async (req, res) => {
  const settings = await Settings.findOne() || { fineRate: 5 };
  const records = await IssuedBook.find()
    .populate('book_id',    'title isbn price')
    .populate('student_id', 'name username')
    .sort({ _id: -1 });

  res.json(records.map(r => {
    let estFine = 0;
    if (r.status === 'issued') {
      const today = new Date();
      const due = new Date(r.due_date);
      const diffDays = Math.max(0, Math.ceil((today - due) / (1000 * 60 * 60 * 24)));
      estFine = diffDays * settings.fineRate;
    }

    return {
      id:           r._id,
      title:        r.book_id?.title,
      isbn:         r.book_id?.isbn,
      book_price:   r.book_id?.price,
      student_name: r.student_id?.name,
      username:     r.student_id?.username,
      issue_date:   r.issue_date,
      due_date:     r.due_date,
      return_date:  r.return_date,
      fine:         r.status === 'returned' ? r.fine : estFine,
      damage_fine:  r.damage_fine,
      real_book_id: r.book_id?._id,
      status:       r.status,
    };
  }));
});

// GET only logged-in user's records (Members) with estimated fines
router.get('/my', authMiddleware, async (req, res) => {
  const settings = await Settings.findOne() || { fineRate: 5 };
  const records = await IssuedBook.find({ student_id: req.user.id })
    .populate('book_id', 'title isbn price')
    .sort({ _id: -1 });

  res.json(records.map(r => {
    let estFine = 0;
    if (r.status === 'issued') {
      const today = new Date();
      const due = new Date(r.due_date);
      const diffDays = Math.max(0, Math.ceil((today - due) / (1000 * 60 * 60 * 24)));
      estFine = diffDays * settings.fineRate;
    }

    return {
      id:           r._id,
      title:        r.book_id?.title,
      isbn:         r.book_id?.isbn,
      book_price:   r.book_id?.price,
      issue_date:   r.issue_date,
      due_date:     r.due_date,
      return_date:  r.return_date,
      fine:         r.status === 'returned' ? r.fine : estFine,
      damage_fine:  r.damage_fine,
      real_book_id: r.book_id?._id,
      status:       r.status,
    };
  }));
});

router.post('/issue', authMiddleware, librarianOnly, async (req, res) => {
  const { book_id, student_id, due_date, isbn, username } = req.body;
  
  let bId = book_id;
  let sId = student_id;

  if (isbn) {
    const b = await Book.findOne({ isbn });
    if (!b) return res.status(404).json({ message: 'Book with this ISBN not found' });
    bId = b._id;
  }

  if (username) {
    const u = await User.findOne({ username });
    if (!u) return res.status(404).json({ message: 'Member with this username not found' });
    sId = u._id;
  }

  if (!bId || !sId || !due_date) return res.status(400).json({ message: 'All fields required' });

  const book = await Book.findById(bId);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  if (book.available_copies < 1) return res.status(400).json({ message: 'No copies available' });

  await IssuedBook.create({ book_id: bId, student_id: sId, due_date, issue_date: new Date() });
  await Book.findByIdAndUpdate(bId, { $inc: { available_copies: -1 } });
  res.json({ message: 'Book issued successfully' });
});

router.put('/return/:id', authMiddleware, librarianOnly, async (req, res) => {
  const { damage_fine = 0 } = req.body;
  const record = await IssuedBook.findOne({ _id: req.params.id, status: 'issued' });
  if (!record) return res.status(404).json({ message: 'Record not found' });

  const today    = new Date();
  const due      = new Date(record.due_date);
  const diffDays = Math.max(0, Math.ceil((today - due) / (1000 * 60 * 60 * 24)));
  
  const settings = await Settings.findOne() || { fineRate: 5 };
  const lateFine = diffDays * settings.fineRate;
  const totalFine = lateFine + Number(damage_fine);

  record.return_date = today;
  record.fine        = totalFine;
  record.damage_fine = Number(damage_fine);
  record.status      = 'returned';
  await record.save();
  
  await Book.findByIdAndUpdate(record.book_id, { $inc: { available_copies: 1 } });
  res.json({ message: 'Book returned', fine: totalFine });
});

module.exports = router;
