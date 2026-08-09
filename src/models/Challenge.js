const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ['books', 'pages', 'categories', 'streak'],
      required: true,
    },

    target: {
      type: Number,
      required: true,
      min: 1,
    },

    reward: {
      type: Number,
      required: true,
      min: 0,
    },

    startDate: {
      type: Date,
      required: true,
    },

    deadline: {
      type: Date,
      required: true,
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

challengeSchema.index({
  isActive: 1,
  deadline: 1,
});

module.exports = mongoose.model(
  'Challenge',
  challengeSchema
);