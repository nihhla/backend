const mongoose = require('mongoose');

const challengeProgressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        challengeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Challenge',
            required: true
        },

        progress: {
            type: Number,
            default: 0,
            min: 0
        },

        target: {
            type: Number,
            required: true
        },

        completed: {
            type: Boolean,
            default: false
        },

        completedAt: {
            type: Date,
            default: null
        },

        rewardClaimed: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

challengeProgressSchema.index(
    {
        userId: 1,
        challengeId: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model(
    'ChallengeProgress',
    challengeProgressSchema
);