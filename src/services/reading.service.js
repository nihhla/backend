const ReadingProgress = require('../models/ReadingProgress');
const ReadingSession = require('../models/ReadingSession');
const Book = require('../models/Book');

const {
    updateStreak
} = require('./streak.service');

const startReading = async (
    userId,
    bookId
) => {
    const book = await Book.findById(bookId);

    if (!book) {
        const error = new Error('Book not found');
        error.statusCode = 404;
        throw error;
    }

    let reading =
        await ReadingProgress.findOne({
            userId,
            bookId
        });

    if (reading) {
    if (reading.status === 'want_to_read') {
        reading.status = 'reading';
        reading.startedAt = reading.startedAt || new Date();
        await reading.save();
    }

    return reading;
}

    reading = await ReadingProgress.create({
        userId,
        bookId,
        status: 'reading',
        progress: 0,
        pagesRead: 0,
        startedAt: new Date()
    });

    return reading;
};

const getReadingProgress = async (
    userId
) => {
    return ReadingProgress.find({
        userId
    })
        .populate(
            'bookId',
            'title author cover category pages xpReward'
        )
        .sort({
            updatedAt: -1
        })
        .lean();
};

const getSingleReading = async (
    userId,
    readingId
) => {
    const reading =
        await ReadingProgress.findOne({
            _id: readingId,
            userId
        })
            .populate(
                'bookId',
                'title author cover category pages xpReward quiz'
            )
            .lean();

    if (!reading) {
        const error = new Error(
            'Reading progress not found'
        );

        error.statusCode = 404;
        throw error;
    }

    return reading;
};

const updateReadingProgress = async (
    userId,
    readingId,
    pagesRead
) => {
    const reading =
        await ReadingProgress.findOne({
            _id: readingId,
            userId
        });

    if (!reading) {
        const error = new Error(
            'Reading progress not found'
        );

        error.statusCode = 404;
        throw error;
    }

    if (reading.status === 'completed') {
        const error = new Error(
            'Book is already completed'
        );

        error.statusCode = 400;
        throw error;
    }

    const book =
        await Book.findById(
            reading.bookId
        );

    if (!book) {
        const error = new Error(
            'Book not found'
        );

        error.statusCode = 404;
        throw error;
    }

    const numericPagesRead =
        Number(pagesRead);

    if (
        !Number.isFinite(
            numericPagesRead
        )
    ) {
        const error = new Error(
            'pagesRead must be a valid number'
        );

        error.statusCode = 400;
        throw error;
    }

    if (numericPagesRead < 0) {
        const error = new Error(
            'pagesRead cannot be negative'
        );

        error.statusCode = 400;
        throw error;
    }

    if (
        numericPagesRead >
        book.pages
    ) {
        const error = new Error(
            'pagesRead cannot exceed total book pages'
        );

        error.statusCode = 400;
        throw error;
    }

    reading.pagesRead =
        numericPagesRead;

    reading.progress =
        Math.min(
            100,
            Math.round(
                (
                    numericPagesRead /
                    book.pages
                ) * 100
            )
        );

    if (
        numericPagesRead > 0 &&
        !reading.startedAt
    ) {
        reading.startedAt =
            new Date();
    }

    reading.status = 'reading';

    await reading.save();

    let streak = null;

    if (numericPagesRead > 0) {
        streak =
            await updateStreak(
                userId
            );
    }

    return {
        reading,
        streak
    };
};

const startSession = async (
    userId,
    bookId
) => {
    const reading =
        await ReadingProgress.findOne({
            userId,
            bookId
        });

    if (!reading) {
        const error = new Error(
            'Start reading this book before starting a session'
        );

        error.statusCode = 404;
        throw error;
    }

    const session =
        await ReadingSession.create({
            userId,
            bookId,
            startedAt: new Date(),
            pagesRead: 0
        });

    return session;
};

const endSession = async (
    userId,
    sessionId,
    pagesRead
) => {
    const session =
        await ReadingSession.findOne({
            _id: sessionId,
            userId
        });

    if (!session) {
        const error = new Error(
            'Reading session not found'
        );

        error.statusCode = 404;
        throw error;
    }

    if (session.endedAt) {
        const error = new Error(
            'Reading session has already ended'
        );

        error.statusCode = 400;
        throw error;
    }

    const endedAt = new Date();

    const durationMinutes =
        Math.max(
            0,
            Math.floor(
                (
                    endedAt -
                    session.startedAt
                ) / 60000
            )
        );

    session.endedAt = endedAt;

    session.durationMinutes =
        durationMinutes;

    if (
        pagesRead !== undefined
    ) {
        const numericPagesRead =
            Number(pagesRead);

        if (
            !Number.isFinite(
                numericPagesRead
            ) ||
            numericPagesRead < 0
        ) {
            const error = new Error(
                'pagesRead must be a valid number'
            );

            error.statusCode = 400;
            throw error;
        }

        session.pagesRead =
            numericPagesRead;
    }

    await session.save();

    return session;
};

const getSessions = async (
    userId
) => {
    return ReadingSession.find({
        userId
    })
        .populate(
            'bookId',
            'title author cover'
        )
        .sort({
            startedAt: -1
        })
        .lean();
};

const getQuiz = async (
    userId,
    readingId
) => {
    const reading =
        await ReadingProgress.findOne({
            _id: readingId,
            userId
        }).populate(
            'bookId',
            'title quiz'
        );

    if (!reading) {
        const error = new Error(
            'Reading progress not found'
        );

        error.statusCode = 404;
        throw error;
    }

    if (reading.progress < 100) {
        const error = new Error(
            'Complete the book before taking the quiz'
        );

        error.statusCode = 400;
        throw error;
    }

    const quiz =
        reading.bookId.quiz.map(
            (question) => ({
                id: question._id,
                question:
                    question.question,
                options:
                    question.options
            })
        );

    return {
        bookId:
            reading.bookId._id,
        title:
            reading.bookId.title,
        questions: quiz
    };
};

module.exports = {
    startReading,
    getReadingProgress,
    getSingleReading,
    updateReadingProgress,
    startSession,
    endSession,
    getSessions,
    getQuiz
};