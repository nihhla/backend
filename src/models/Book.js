const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (value) {
          return value.length >= 2;
        },
        message: 'A quiz question must have at least 2 options',
      },
    },

    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: true,
  }
);

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    author: {
      type: String,
      required: true,
      trim: true,
    },

    isbn: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    description: {
      type: String,
      default: '',
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    pages: {
      type: Number,
      required: true,
      min: 1,
    },

    cover: {
      type: String,
      default: '',
    },

    availableCopies: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalCopies: {
      type: Number,
      default: 1,
      min: 1,
    },

    xpReward: {
      type: Number,
      default: 50,
      min: 0,
    },

    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },

    estimatedReadingTime: {
      type: Number,
      default: 0,
      min: 0,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ['available', 'unavailable'],
      default: 'available',
    },

    quiz: {
      type: [quizQuestionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

bookSchema.index({
  title: 'text',
  author: 'text',
  category: 'text',
});

bookSchema.index({ category: 1 });
bookSchema.index({ author: 1 });
bookSchema.index({ featured: 1 });

module.exports = mongoose.model('Book', bookSchema);