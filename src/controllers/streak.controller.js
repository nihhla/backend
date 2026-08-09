const asyncHandler = require('../utils/asyncHandler');

const {
  updateStreak,
  getStreakStats,
} = require('../services/streak.service');

const {
  successResponse,
} = require('../utils/response');

const updateMyStreak = asyncHandler(
  async (req, res) => {
    const result = await updateStreak(
      req.user._id
    );

    return successResponse(
      res,
      { streak: result },
      'Reading streak updated successfully'
    );
  }
);

const getMyStreak = asyncHandler(
  async (req, res) => {
    const streak = await getStreakStats(
      req.user._id
    );

    return successResponse(
      res,
      { streak },
      'Reading streak fetched successfully'
    );
  }
);

module.exports = {
  updateMyStreak,
  getMyStreak,
};