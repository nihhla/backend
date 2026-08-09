const express = require('express');

const {
    getReading,
    getSingleReading,
    startBook,
    updateBookProgress,
    startSession,
    endSession,
    getReadingSessions,
    getQuiz
} = require('../controllers/reading.controller');

const {
    authenticate,
    requireStudent
} = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.use(requireStudent);

router.get(
    '/',
    getReading
);

router.get(
    '/session',
    getReadingSessions
);

router.get(
    '/sessions',
    getReadingSessions
);

router.post(
    '/start',
    startBook
);

router.post(
    '/session/:id',
    startSession
);

router.patch(
    '/session/:sessionId/end',
    endSession
);

router.patch(
    '/:id/progress',
    updateBookProgress
);

router.get(
    '/:id/quiz',
    getQuiz
);

router.get(
    '/:id',
    getSingleReading
);

module.exports = router;