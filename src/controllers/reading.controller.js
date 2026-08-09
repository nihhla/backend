const asyncHandler = require('../utils/asyncHandler');

const {
  getMyReading,
  getReadingById,
  startReading,
  updateProgress,
  createReadingSession,
  endReadingSession,
  getBookQuiz,
} = require('../services/reading.service');

const { successResponse } = require('../utils/response');

const getReading = asyncHandler(async (req, res) => {
  const readings = await getMyReading(
    req.user._id,
    req.query.status
  );

  return successResponse(
    res,
    { readings },
    'Reading progress fetched successfully'
  );
});

const getSingleReading = asyncHandler(
  async (req, res) => {
    const reading = await getReadingById(
      req.params.id,
      req.user._id
    );

    return successResponse(
      res,
      { reading },
      'Reading progress fetched successfully'
    );
  }
);

const startBook = asyncHandler(async (req, res) => {
  const { bookId } = req.body;

  const reading = await startReading(
    req.user._id,
    bookId
  );

  return successResponse(
    res,
    { reading },
    'Reading started successfully',
    201
  );
});

const updateBookProgress = asyncHandler(
  async (req, res) => {
    const { pagesRead } = req.body;

    const reading = await updateProgress(
      req.params.id,
      req.user._id,
      pagesRead
    );

    return successResponse(
      res,
      { reading },
      'Reading progress updated successfully'
    );
  }
);

const startSession = asyncHandler(
  async (req, res) => {
    const session = await createReadingSession(
      req.user._id,
      req.params.id
    );

    return successResponse(
      res,
      { session },
      'Reading session started successfully',
      201
    );
  }
);

const endSession = asyncHandler(
  async (req, res) => {
    const { pagesRead } = req.body;

    const session = await endReadingSession(
      req.params.sessionId,
      req.user._id,
      pagesRead
    );

    return successResponse(
      res,
      { session },
      'Reading session ended successfully'
    );
  }
);

const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await getBookQuiz(
    req.params.id,
    req.user._id
  );

  return successResponse(
    res,
    { quiz },
    'Quiz fetched successfully'
  );
});

module.exports = {
  getReading,
  getSingleReading,
  startBook,
  updateBookProgress,
  startSession,
  endSession,
  getQuiz,
};