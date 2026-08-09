const mongoose = require('mongoose');

const xpTransactionSchema =
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      amount: {
        type: Number,
        required: true,
        min: 1,
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
    },
    {
      timestamps: true,
    }
  );

xpTransactionSchema.index(
  {
    userId: 1,
    reason: 1,
    referenceId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      referenceId: {
        $type: 'objectId',
      },
    },
  }
);

module.exports = mongoose.model(
  'XPTransaction',
  xpTransactionSchema
);