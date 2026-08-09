const asyncHandler = require('../utils/asyncHandler');

const {
  getAllBadges,
  getMyBadges,
  createBadge,
} = require('../services/badge.service');

const {
  successResponse,
} = require('../utils/response');

const getBadges = asyncHandler(async (req, res) => {
  const badges = await getAllBadges();

  return successResponse(
    res,
    { badges },
    'Badges fetched successfully'
  );
});

const getMyBadgesController = asyncHandler(
  async (req, res) => {
    const badges = await getMyBadges(
      req.user._id
    );

    return successResponse(
      res,
      { badges },
      'My badges fetched successfully'
    );
  }
);

const createBadgeController = asyncHandler(
  async (req, res) => {
    const badge = await createBadge(req.body);

    return successResponse(
      res,
      { badge },
      'Badge created successfully',
      201
    );
  }
);

module.exports = {
  getBadges,
  getMyBadgesController,
  createBadgeController,
};