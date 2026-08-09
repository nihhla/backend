const Review = require('../models/Review');
const Book = require('../models/Book');
const ReadingProgress = require('../models/ReadingProgress');

const createReview = async (
    userId,
    bookId,
    rating,
    comment
) => {
    if (!bookId || rating === undefined || !comment) {
        const error = new Error(
            'Book, rating and comment are required'
        );

        error.statusCode = 400;
        throw error;
    }

    const book = await Book.findById(bookId);

    if (!book) {
        const error = new Error('Book not found');

        error.statusCode = 404;
        throw error;
    }

    const completedReading =
        await ReadingProgress.findOne({
            userId,
            bookId,
            status: 'completed'
        });

    if (!completedReading) {
        const error = new Error(
            'You can review a book only after completing it'
        );

        error.statusCode = 403;
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

        error.statusCode = 400;
        throw error;
    }

    const review = await Review.create({
        userId,
        bookId,
        rating,
        comment
    });

    await updateBookRating(bookId);

    return Review.findById(review._id)
        .populate(
            'userId',
            'name studentId'
        )
        .populate(
            'bookId',
            'title author cover'
        );
};

const updateReview = async (
    userId,
    reviewId,
    rating,
    comment
) => {
    const review = await Review.findOne({
        _id: reviewId,
        userId
    });

    if (!review) {
        const error = new Error(
            'Review not found'
        );

        error.statusCode = 404;
        throw error;
    }

    if (rating !== undefined) {
        review.rating = rating;
    }

    if (comment !== undefined) {
        review.comment = comment;
    }

    await review.save();

    await updateBookRating(
        review.bookId
    );

    return Review.findById(review._id)
        .populate(
            'userId',
            'name studentId'
        )
        .populate(
            'bookId',
            'title author cover'
        );
};

const deleteReview = async (
    userId,
    reviewId
) => {
    const review = await Review.findOne({
        _id: reviewId,
        userId
    });

    if (!review) {
        const error = new Error(
            'Review not found'
        );

        error.statusCode = 404;
        throw error;
    }

    const bookId = review.bookId;

    await Review.deleteOne({
        _id: reviewId
    });

    await updateBookRating(bookId);

    return true;
};

const getBookReviews = async (
    bookId
) => {
    const book = await Book.findById(bookId)
        .select('_id title');

    if (!book) {
        const error = new Error(
            'Book not found'
        );

        error.statusCode = 404;
        throw error;
    }

    return Review.find({
        bookId
    })
        .populate(
            'userId',
            'name studentId'
        )
        .sort({
            createdAt: -1
        })
        .lean();
};

const getMyReview = async (
    userId,
    bookId
) => {
    return Review.findOne({
        userId,
        bookId
    })
        .populate(
            'bookId',
            'title author cover'
        )
        .lean();
};

const updateBookRating = async (
    bookId
) => {
    const result = await Review.aggregate([
        {
            $match: {
                bookId
            }
        },
        {
            $group: {
                _id: '$bookId',
                averageRating: {
                    $avg: '$rating'
                },
                reviewCount: {
                    $sum: 1
                }
            }
        }
    ]);

    const averageRating =
        result.length > 0
            ? Number(
                  result[0].averageRating.toFixed(1)
              )
            : 0;

    const reviewCount =
        result.length > 0
            ? result[0].reviewCount
            : 0;

    await Book.findByIdAndUpdate(
        bookId,
        {
            averageRating,
            reviewCount
        }
    );

    return {
        averageRating,
        reviewCount
    };
};

module.exports = {
    createReview,
    updateReview,
    deleteReview,
    getBookReviews,
    getMyReview,
    updateBookRating
};