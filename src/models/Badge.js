const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      default: '🏆',
    },
    requirement: {
      type: {
        type: String,
        enum: [
          'books_completed',
          'streak',
          'xp',
          'challenge_completed',
        ],
        required: true,
      },
      value: {
        type: Number,
        default: 1,
      },
    },
    xpReward: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'Badge',
  badgeSchema
);