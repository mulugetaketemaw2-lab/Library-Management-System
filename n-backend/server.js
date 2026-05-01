const express = require('express');
const cors    = require('cors');
require('./db'); // connect to MongoDB Atlas (dotenv is loaded inside db.js)

const authRoutes    = require('./routes/auth');
const bookRoutes    = require('./routes/books');
const borrowRoutes  = require('./routes/borrow');
const adminRoutes   = require('./routes/admin');
const reserveRoutes = require('./routes/reservation');
const reviewRoutes  = require('./routes/reviews');
require('./services/notificationService'); // Initialize cron jobs

const multer = require('multer');
const path   = require('path');

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',        authRoutes);
app.use('/api/books',       bookRoutes);
app.use('/api/borrow',      borrowRoutes);
app.use('/api/admin',       adminRoutes);
app.use('/api/reservation', reserveRoutes);
app.use('/api/reviews',     reviewRoutes);

// Upload Endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const protocol = req.protocol;
  const host = req.get('host');
  res.json({ url: `${protocol}://${host}/uploads/${req.file.filename}` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
