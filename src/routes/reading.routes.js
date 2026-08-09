const express = require('express');

const {
  getReading,
  getSingleReading,
  startBook,
  updateBookProgress,
  startSession,
  endSession,
  getQuiz,
} = require('../controllers/reading.controller');

const {
  authenticate,
  requireStudent,
} = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate, requireStudent);

router.get('/', getReading);

router.post('/start', startBook);

router.get('/:id', getSingleReading);

router.put('/:id/progress', updateBookProgress);

router.post('/:id/session/start', startSession);

router.post(
  '/:id/session/:sessionId/end',
  endSession
);

router.get('/:id/quiz', getQuiz);

module.exports = router;