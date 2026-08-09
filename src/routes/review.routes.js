const express = require('express');

const {
    createBookReview,
    getReviews
} = require('../controllers/review.controller');

const {
    authenticate,
    requireStudent
} = require('../middleware/auth.middleware');

const router = express.Router();

router.use(
    authenticate,
    requireStudent
);

router.get(
    '/book/:bookId',
    getReviews
);

router.post(
    '/',
    createBookReview
);

module.exports = router;