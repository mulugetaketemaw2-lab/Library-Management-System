const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title:            { type: String, required: true },
  author:           { type: String, required: true },
  isbn:             { type: String, required: true, unique: true },
  category:         { type: String, default: '' },
  total_copies:     { type: Number, default: 1 },
  available_copies: { type: Number, default: 1 },
  price:            { type: Number, default: 0 },
  image_url:        { type: String, default: null },
  pub_year:         { type: Number },
  edition:          { type: String },
  pages:            { type: Number },
  shelf:            { type: String },
  floor:            { type: String },
  condition:        { type: String },
  tags:             { type: String },
  description:      { type: String },
  pdf_url:          { type: String, default: null },
  last_added_at:    { type: Date, default: Date.now },
});

module.exports = mongoose.model('Book', bookSchema);
