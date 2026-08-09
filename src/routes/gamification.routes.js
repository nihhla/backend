const express = require('express');

const {
  getStats,
  getTransactions,
} = require('../controllers/gamification.controller');

const {
  authenticate,
  requireStudent,
} = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate, requireStudent);

router.get('/stats', getStats);

router.get('/transactions', getTransactions);

module.exports = router;