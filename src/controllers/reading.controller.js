const asyncHandler = require('../utils/asyncHandler');

const {
    getReadingProgress,
    getSingleReading,
    startReading,
    updateReadingProgress,
    startSession: createReadingSession,
    endSession: endReadingSession,
    getSessions,
    getQuiz: getBookQuiz
} = require('../services/reading.service');

const {
    successResponse
} = require('../utils/response');

const getReading = asyncHandler(
    async (req, res) => {
        const readings =
            await getReadingProgress(
                req.user._id
            );

        return successResponse(
            res,
            { readings },
            'Reading progress fetched successfully'
        );
    }
);

const getSingleReadingController =
    asyncHandler(
        async (req, res) => {
            const reading =
                await getSingleReading(
                    req.user._id,
                    req.params.id
                );

            return successResponse(
                res,
                { reading },
                'Reading progress fetched successfully'
            );
        }
    );

const startBook = asyncHandler(
    async (req, res) => {
        const {
            bookId
        } = req.body;

        const reading =
            await startReading(
                req.user._id,
                bookId
            );

        return successResponse(
            res,
            { reading },
            'Reading started successfully',
            201
        );
    }
);

const updateBookProgress =
    asyncHandler(
        async (req, res) => {
            const {
                pagesRead
            } = req.body;

            const result =
                await updateReadingProgress(
                    req.user._id,
                    req.params.id,
                    pagesRead
                );

            return successResponse(
                res,
                result,
                'Reading progress updated successfully'
            );
        }
    );

const startSession = asyncHandler(
    async (req, res) => {
        const session =
            await createReadingSession(
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
        const {
            pagesRead
        } = req.body;

        const session =
            await endReadingSession(
                req.user._id,
                req.params.sessionId,
                pagesRead
            );

        return successResponse(
            res,
            { session },
            'Reading session ended successfully'
        );
    }
);

const getReadingSessions =
    asyncHandler(
        async (req, res) => {
            const sessions =
                await getSessions(
                    req.user._id
                );

            return successResponse(
                res,
                { sessions },
                'Reading sessions fetched successfully'
            );
        }
    );

const getQuiz = asyncHandler(
    async (req, res) => {
        const quiz =
            await getBookQuiz(
                req.user._id,
                req.params.id
            );

        return successResponse(
            res,
            { quiz },
            'Quiz fetched successfully'
        );
    }
);

module.exports = {
    getReading,
    getSingleReading:
        getSingleReadingController,
    startBook,
    updateBookProgress,
    startSession,
    endSession,
    getReadingSessions,
    getQuiz
};