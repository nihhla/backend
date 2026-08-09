const {
  verifyToken,
} = require('../utils/jwt');

const {
  getUserById,
} = require('../services/auth.service');

const { errorResponse } = require('../utils/response');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith('Bearer ')
    ) {
      return errorResponse(
        res,
        'Authentication required',
        401
      );
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return errorResponse(
        res,
        'Authentication token missing',
        401
      );
    }

    const decoded = verifyToken(token);

    const user = await getUserById(decoded.userId);

    req.user = user;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(
        res,
        'Invalid authentication token',
        401
      );
    }

    if (error.name === 'TokenExpiredError') {
      return errorResponse(
        res,
        'Authentication token expired',
        401
      );
    }

    return next(error);
  }
};

const requireStudent = (req, res, next) => {
  if (!req.user) {
    return errorResponse(
      res,
      'Authentication required',
      401
    );
  }

  if (req.user.role !== 'student') {
    return errorResponse(
      res,
      'Student access required',
      403
    );
  }

  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return errorResponse(
      res,
      'Authentication required',
      401
    );
  }

  if (req.user.role !== 'admin') {
    return errorResponse(
      res,
      'Admin access required',
      403
    );
  }

  next();
};

module.exports = {
  authenticate,
  requireStudent,
  requireAdmin,
};