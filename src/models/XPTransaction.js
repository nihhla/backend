const mongoose = require('mongoose');

const xpTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    referenceType: {
      type: String,
      enum: [
        'book',
        'quiz',
        'review',
        'challenge',
        'streak',
        'badge',
        'other',
      ],
      default: 'other',
    },

    uniqueKey: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

xpTransactionSchema.index({
  userId: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  'XPTransaction',
  xpTransactionSchema
);