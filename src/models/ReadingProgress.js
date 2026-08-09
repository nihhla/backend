const mongoose = require('mongoose');

const readingProgressSchema = new mongoose.Schema(
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

    status: {
      type: String,
      enum: ['want_to_read', 'reading', 'completed'],
      default: 'want_to_read',
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    pagesRead: {
      type: Number,
      default: 0,
      min: 0,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    quizScore: {
      type: Number,
      default: null,
      min: 0,
    },

    quizPassed: {
      type: Boolean,
      default: false,
    },

    completionRewarded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

readingProgressSchema.index(
  { userId: 1, bookId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  'ReadingProgress',
  readingProgressSchema
);