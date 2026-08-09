const express = require('express');

const {
  updateMyStreak,
  getMyStreak,
} = require('../controllers/streak.controller');

const {
  authenticate,
  requireStudent,
} = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate, requireStudent);

router.get('/', getMyStreak);

router.post('/update', updateMyStreak);

module.exports = router;