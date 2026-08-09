const express = require('express');

const {
    create,
    getAll,
    getSingle,
    join,
    getMyProgress,
    update,
    remove
} = require('../controllers/challenge.controller');

const {
    authenticate,
    requireStudent,
    requireAdmin
} = require('../middleware/auth.middleware');

const router = express.Router();

router.get(
    '/',
    authenticate,
    getAll
);

router.get(
    '/my',
    authenticate,
    requireStudent,
    getMyProgress
);

router.get(
    '/:id',
    authenticate,
    getSingle
);

router.post(
    '/:id/join',
    authenticate,
    requireStudent,
    join
);

router.post(
    '/',
    authenticate,
    requireAdmin,
    create
);

router.put(
    '/:id',
    authenticate,
    requireAdmin,
    update
);

router.delete(
    '/:id',
    authenticate,
    requireAdmin,
    remove
);

module.exports = router;