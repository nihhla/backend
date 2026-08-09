const asyncHandler = require('../utils/asyncHandler');

const {
  completeBook,
} = require('../services/completion.service');

const {
  successResponse,
} = require('../utils/response');

const completeReading = asyncHandler(
  async (req, res) => {
    const result = await completeBook(
      req.user._id,
      req.params.id,
      req.body.answers
    );

    if (!result.passed) {
      return successResponse(
        res,
        result,
        'Quiz completed but book completion was not verified'
      );
    }

    return successResponse(
      res,
      result,
      'Book completed successfully'
    );
  }
);

module.exports = {
  completeReading,
};