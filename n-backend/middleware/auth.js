const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

function librarianOnly(req, res, next) {
  if (req.user.role !== 'librarian' && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Librarians only' });
  next();
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Admins only' });
  next();
}

module.exports = { authMiddleware, librarianOnly, adminOnly };
