const express = require('express');

const {
    register,
    login,
    getMe,
    getAllStudents,
    deleteStudentController
} = require('../controllers/auth.controller');

const {
    authenticate,
    requireAdmin
} = require('../middleware/auth.middleware');

const router = express.Router();

router.post(
    '/register',
    register
);

router.post(
    '/login',
    login
);

router.get(
    '/me',
    authenticate,
    getMe
);

router.get(
    '/students',
    authenticate,
    requireAdmin,
    getAllStudents
);
router.delete(
    '/students/:id',
    authenticate,
    requireAdmin,
    deleteStudentController
);

module.exports = router;