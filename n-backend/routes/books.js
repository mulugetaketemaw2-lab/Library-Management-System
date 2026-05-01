const express = require('express');
const router  = express.Router();
const Book    = require('../models/Book');
const { authMiddleware, librarianOnly } = require('../middleware/auth');
const multer  = require('multer');
const path    = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDFs allowed'), false);
  }
});

// Public route for searching books
router.get('/', async (req, res) => {
  const s = req.query.search || '';
  const query = s ? { $or: [
    { title: new RegExp(s, 'i') },
    { isbn:  new RegExp(s, 'i') },
    { category: new RegExp(s, 'i') },
    { author: new RegExp(s, 'i') },
  ]} : {};
  const books = await Book.find(query);
  res.json(books.map(b => ({
    id: b._id, title: b.title, author: b.author, isbn: b.isbn,
    category: b.category, total_copies: b.total_copies,
    available_copies: b.available_copies, price: b.price,
    image_url: b.image_url, pdf_url: b.pdf_url,
    pub_year: b.pub_year, edition: b.edition, pages: b.pages,
    shelf: b.shelf, floor: b.floor, condition: b.condition,
    tags: b.tags, description: b.description,
    last_added_at: b.last_added_at,
    status: b.available_copies > 0 ? 'available' : 'borrowed'
  })));
});

// Get single book by ID
router.get('/:id', async (req, res) => {
  try {
    const b = await Book.findById(req.params.id);
    if (!b) return res.status(404).json({ message: 'Book not found' });
    res.json({
      id: b._id, title: b.title, author: b.author, isbn: b.isbn,
      category: b.category, total_copies: b.total_copies,
      available_copies: b.available_copies, price: b.price,
      image_url: b.image_url, pdf_url: b.pdf_url,
      pub_year: b.pub_year, edition: b.edition, pages: b.pages,
      shelf: b.shelf, floor: b.floor, condition: b.condition,
      tags: b.tags, description: b.description,
      last_added_at: b.last_added_at,
      status: b.available_copies > 0 ? 'available' : 'borrowed'
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching book' });
  }
});

router.post('/', authMiddleware, librarianOnly, upload.single('pdf'), async (req, res) => {
  const { title, author, isbn, category, total_copies, price, image_url, pub_year, edition, pages, shelf, floor, condition, tags, description } = req.body;
  if (!title || !author || !isbn) return res.status(400).json({ message: 'Title, Author and ISBN required' });
  try {
    const copiesToAdd = parseInt(total_copies) || 1;
    const pdf_url = req.file ? `/uploads/${req.file.filename}` : null;

    // Check if book with same ISBN exists
    const existingBook = await Book.findOne({ isbn });

    if (existingBook) {
      // Update existing book
      existingBook.total_copies += copiesToAdd;
      existingBook.available_copies += copiesToAdd;
      existingBook.last_added_at = Date.now();
      // If a new PDF is provided, update it
      if (pdf_url) existingBook.pdf_url = pdf_url;
      await existingBook.save();
      return res.json({ message: 'Additional copies added to existing book record' });
    }

    // Create new book if it doesn't exist
    await Book.create({ 
      title, author, isbn, category: category || 'Uncategorized', 
      total_copies: copiesToAdd, available_copies: copiesToAdd, 
      price: price || 0, image_url, pdf_url, pub_year, edition, 
      pages, shelf, floor, condition, tags, description 
    });
    res.json({ message: 'New book added' });
  } catch (err) { 
    console.error(err);
    res.status(500).json({ message: 'Error processing book registration' }); 
  }
});

router.put('/:id', authMiddleware, librarianOnly, upload.single('pdf'), async (req, res) => {
  const { title, author, isbn, category, total_copies, price, image_url, pub_year, edition, pages, shelf, floor, condition, tags, description } = req.body;
  try {
    const updateData = { title, author, isbn, category, total_copies, price, image_url, pub_year, edition, pages, shelf, floor, condition, tags, description };
    if (req.file) updateData.pdf_url = `/uploads/${req.file.filename}`;
    await Book.findByIdAndUpdate(req.params.id, updateData);
    res.json({ message: 'Book updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating book' });
  }
});

router.delete('/:id', authMiddleware, librarianOnly, async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.json({ message: 'Book deleted' });
});

module.exports = router;
