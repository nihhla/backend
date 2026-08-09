const mongoose = require('mongoose');

const readingSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },

    startedAt: {
      type: Date,
      required: true,
    },

    endedAt: {
      type: Date,
      default: null,
    },

    durationMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    pagesRead: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

readingSessionSchema.index({
  userId: 1,
  bookId: 1,
});

module.exports = mongoose.model(
  'ReadingSession',
  readingSessionSchema
);