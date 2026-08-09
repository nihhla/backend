const Review = require('../models/Review');
const ReadingProgress = require('../models/ReadingProgress');

const createReview = async (
    userId,
    bookId,
    rating,
    comment
) => {
    const reading =
        await ReadingProgress.findOne({
            userId,
            bookId
        });

    if (!reading) {
        const error = new Error(
            'Start and complete this book before reviewing it'
        );

        error.statusCode = 400;
        throw error;
    }

    if (
        reading.status !== 'completed' ||
        reading.progress < 100 ||
        !reading.quizPassed
    ) {
        const error = new Error(
            'You must complete the book and pass the quiz before reviewing it'
        );

        error.statusCode = 400;
        throw error;
    }

    const numericRating = Number(rating);

    if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
    ) {
        const error = new Error(
            'Rating must be between 1 and 5'
        );

        error.statusCode = 400;
        throw error;
    }

    if (
        !comment ||
        !comment.trim()
    ) {
        const error = new Error(
            'Review comment is required'
        );

        error.statusCode = 400;
        throw error;
    }

    const existingReview =
        await Review.findOne({
            userId,
            bookId
        });

    if (existingReview) {
        const error = new Error(
            'You have already reviewed this book'
        );

        error.statusCode = 409;
        throw error;
    }

    const review =
        await Review.create({
            userId,
            bookId,
            rating: numericRating,
            comment: comment.trim()
        });

    return review;
};

const getBookReviews = async (
    bookId
) => {
    return Review.find({
        bookId
    })
        .populate(
            'userId',
            'name'
        )
        .sort({
            createdAt: -1
        })
        .lean();
};

module.exports = {
    createReview,
    getBookReviews
};