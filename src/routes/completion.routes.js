const express = require('express');

const {
  completeReading,
} = require('../controllers/completion.controller');

const {
  authenticate,
  requireStudent,
} = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate, requireStudent);

router.post('/:id/complete', completeReading);

module.exports = router;