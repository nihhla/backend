const express = require('express');

const {
    getStudentDashboard,
    getAdminDashboard,
    getActivity,
    getLeaderboard
} = require('../controllers/analytics.controller');

const {
    authenticate,
    requireStudent,
    requireAdmin
} = require('../middleware/auth.middleware');

const router = express.Router();

router.get(
    '/student',
    authenticate,
    requireStudent,
    getStudentDashboard
);

router.get(
    '/student/activity',
    authenticate,
    requireStudent,
    getActivity
);

router.get(
    '/admin',
    authenticate,
    requireAdmin,
    getAdminDashboard
);

router.get(
    '/leaderboard',
    authenticate,
    getLeaderboard
);

module.exports = router;