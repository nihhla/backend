const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
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

    requirementType: {
      type: String,
      enum: [
        'books_completed',
        'xp',
        'streak',
        'challenge_completed',
        'consecutive_months',
      ],
      required: true,
    },

    requirementValue: {
      type: Number,
      default: 1,
      min: 1,
    },

    xpReward: {
      type: Number,
      default: 0,
      min: 0,
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

module.exports = mongoose.model('Badge', badgeSchema);