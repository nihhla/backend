const asyncHandler = require('../utils/asyncHandler');

const {
  registerStudent,
  loginUser,
  getCurrentUser,
} = require('../services/auth.service');

const { successResponse } = require('../utils/response');

const register = asyncHandler(async (req, res) => {
  const result = await registerStudent(req.body);

  return successResponse(
    res,
    result,
    'Registration successful',
    201
  );
});

const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);

  return successResponse(
    res,
    result,
    'Login successful'
  );
});

const getMe = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user._id);

  return successResponse(
    res,
    { user },
    'Current user fetched successfully'
  );
});

module.exports = {
  register,
  login,
  getMe,
};