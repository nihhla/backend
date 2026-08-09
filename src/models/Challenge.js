const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            enum: [
                'books_completed',
                'pages_read',
                'categories_read'
            ],
            required: true
        },

        target: {
            type: Number,
            required: true,
            min: 1
        },

        reward: {
            type: Number,
            required: true,
            min: 0
        },

        startDate: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: [
                'draft',
                'active',
                'completed',
                'expired'
            ],
            default: 'draft'
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    'Challenge',
    challengeSchema
);