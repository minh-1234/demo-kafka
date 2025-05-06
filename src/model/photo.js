// models/user.js
const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
  albumId: {
    type: Number,
    required: true
  },
  id: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Photo', PhotoSchema);