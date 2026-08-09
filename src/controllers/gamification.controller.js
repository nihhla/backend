const asyncHandler = require('../utils/asyncHandler');

const {
  getMyStats,
  getXPTransactions,
} = require('../services/gamification.service');

const {
  successResponse,
} = require('../utils/response');

const getStats = asyncHandler(async (req, res) => {
  const stats = await getMyStats(req.user._id);

  return successResponse(
    res,
    { stats },
    'Gamification stats fetched successfully'
  );
});

const getTransactions = asyncHandler(
  async (req, res) => {
    const transactions =
      await getXPTransactions(req.user._id);

    return successResponse(
      res,
      { transactions },
      'XP transactions fetched successfully'
    );
  }
);

module.exports = {
  getStats,
  getTransactions,
};