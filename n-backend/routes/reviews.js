const express = require('express');
const router  = express.Router();
const Review  = require('../models/Review');
const { authMiddleware } = require('../middleware/auth');

// Get reviews for a book
router.get('/:bookId', async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId })
      .populate('user', 'name')
      .sort('-createdAt');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// Add a review
router.post('/', authMiddleware, async (req, res) => {
  const { book_id, rating, comment } = req.body;
  if (!book_id || !rating || !comment) return res.status(400).json({ message: 'Missing fields' });

  try {
    const review = await Review.create({
      user: req.user.id,
      book: book_id,
      rating,
      comment
    });
    res.json(review);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'You already reviewed this book' });
    res.status(500).json({ message: 'Error adding review' });
  }
});

// Delete a review
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    
    // Only owner or admin can delete
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting review' });
  }
});

module.exports = router;
