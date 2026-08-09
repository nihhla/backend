const asyncHandler = require('../utils/asyncHandler');

const {
    createReview,
    getBookReviews
} = require('../services/review.service');

const {
    successResponse
} = require('../utils/response');

const createBookReview =
    asyncHandler(
        async (req, res) => {
            const {
                bookId,
                rating,
                comment
            } = req.body;

            const review =
                await createReview(
                    req.user._id,
                    bookId,
                    rating,
                    comment
                );

            return successResponse(
                res,
                { review },
                'Review submitted successfully',
                201
            );
        }
    );

const getReviews =
    asyncHandler(
        async (req, res) => {
            const reviews =
                await getBookReviews(
                    req.params.bookId
                );

            return successResponse(
                res,
                { reviews },
                'Reviews fetched successfully'
            );
        }
    );

module.exports = {
    createBookReview,
    getReviews
};