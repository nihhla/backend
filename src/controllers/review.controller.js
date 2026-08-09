const asyncHandler = require('../utils/asyncHandler');

const {
    createReview,
    updateReview,
    deleteReview,
    getBookReviews,
    getMyReview
} = require('../services/review.service');

const {
    successResponse
} = require('../utils/response');

const create = asyncHandler(
    async (req, res) => {
        const review =
            await createReview(
                req.user._id,
                req.body.bookId,
                req.body.rating,
                req.body.comment
            );

        return successResponse(
            res,
            { review },
            'Review created successfully',
            201
        );
    }
);

const update = asyncHandler(
    async (req, res) => {
        const review =
            await updateReview(
                req.user._id,
                req.params.id,
                req.body.rating,
                req.body.comment
            );

        return successResponse(
            res,
            { review },
            'Review updated successfully'
        );
    }
);

const remove = asyncHandler(
    async (req, res) => {
        await deleteReview(
            req.user._id,
            req.params.id
        );

        return successResponse(
            res,
            null,
            'Review deleted successfully'
        );
    }
);

const getForBook = asyncHandler(
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

const getMine = asyncHandler(
    async (req, res) => {
        const review =
            await getMyReview(
                req.user._id,
                req.params.bookId
            );

        return successResponse(
            res,
            { review },
            'Review fetched successfully'
        );
    }
);

module.exports = {
    create,
    update,
    remove,
    getForBook,
    getMine
};