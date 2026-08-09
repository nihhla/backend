const express = require('express');

const {
  getBadges,
  getMyBadgesController,
  createBadgeController,
} = require('../controllers/badge.controller');

const {
  authenticate,
  requireStudent,
  requireAdmin,
} = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', getBadges);

router.get(
  '/my',
  authenticate,
  requireStudent,
  getMyBadgesController
);

router.post(
  '/',
  authenticate,
  requireAdmin,
  createBadgeController
);

module.exports = router;