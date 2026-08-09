const express = require('express');

const {
    create,
    update,
    remove,
    getForBook,
    getMine
} = require('../controllers/review.controller');

const {
    authenticate,
    requireStudent
} = require('../middleware/auth.middleware');

const router = express.Router();

router.get(
    '/book/:bookId',
    getForBook
);

router.get(
    '/book/:bookId/my',
    authenticate,
    requireStudent,
    getMine
);

router.post(
    '/',
    authenticate,
    requireStudent,
    create
);

router.put(
    '/:id',
    authenticate,
    requireStudent,
    update
);

router.delete(
    '/:id',
    authenticate,
    requireStudent,
    remove
);

module.exports = router;