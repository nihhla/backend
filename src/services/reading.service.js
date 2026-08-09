const ReadingProgress = require('../models/ReadingProgress');
const ReadingSession = require('../models/ReadingSession');
const Book = require('../models/Book');

const getMyReading = async (userId, status) => {
  const filter = { userId };

  if (status) {
    filter.status = status;
  }

  return ReadingProgress.find(filter)
    .populate(
      'bookId',
      'title author cover category pages xpReward difficulty'
    )
    .sort({ updatedAt: -1 })
    .lean();
};

const getReadingById = async (readingId, userId) => {
  const reading = await ReadingProgress.findOne({
    _id: readingId,
    userId,
  })
    .populate(
      'bookId',
      'title author cover category pages xpReward difficulty estimatedReadingTime'
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

const startReading = async (userId, bookId) => {
  const book = await Book.findById(bookId);

  if (!book) {
    const error = new Error('Book not found');
    error.statusCode = 404;
    throw error;
  }

  let reading = await ReadingProgress.findOne({
    userId,
    bookId,
  });

  if (reading) {
    if (reading.status === 'completed') {
      return reading;
    }

    if (!reading.startedAt) {
      reading.startedAt = new Date();
    }

    reading.status = 'reading';

    await reading.save();

    return reading;
  }

  reading = await ReadingProgress.create({
    userId,
    bookId,
    status: 'reading',
    progress: 0,
    pagesRead: 0,
    startedAt: new Date(),
  });

  return reading;
};

const updateProgress = async (
  readingId,
  userId,
  pagesRead
) => {
  const reading = await ReadingProgress.findOne({
    _id: readingId,
    userId,
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
      'This book has already been completed'
    );
    error.statusCode = 400;
    throw error;
  }

  const book = await Book.findById(reading.bookId);

  if (!book) {
    const error = new Error('Book not found');
    error.statusCode = 404;
    throw error;
  }

  const newPagesRead = Number(pagesRead);

  if (
    !Number.isInteger(newPagesRead) ||
    newPagesRead < 0
  ) {
    const error = new Error(
      'Pages read must be a valid positive number'
    );
    error.statusCode = 400;
    throw error;
  }

  if (newPagesRead > book.pages) {
    const error = new Error(
      `Pages read cannot exceed ${book.pages}`
    );
    error.statusCode = 400;
    throw error;
  }

  reading.pagesRead = newPagesRead;

  reading.progress = Math.round(
    (newPagesRead / book.pages) * 100
  );

  if (reading.progress > 0 && !reading.startedAt) {
    reading.startedAt = new Date();
  }

  if (reading.progress > 0) {
    reading.status = 'reading';
  }

  await reading.save();

  return reading;
};

const createReadingSession = async (
  userId,
  readingId
) => {
  const reading = await ReadingProgress.findOne({
    _id: readingId,
    userId,
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
      'Cannot create a session for a completed book'
    );
    error.statusCode = 400;
    throw error;
  }

  const session = await ReadingSession.create({
    userId,
    bookId: reading.bookId,
    startedAt: new Date(),
  });

  return session;
};

const endReadingSession = async (
  sessionId,
  userId,
  pagesRead = 0
) => {
  const session = await ReadingSession.findOne({
    _id: sessionId,
    userId,
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

  const durationMinutes = Math.max(
    0,
    Math.round(
      (endedAt.getTime() - session.startedAt.getTime()) /
        60000
    )
  );

  session.endedAt = endedAt;
  session.durationMinutes = durationMinutes;
  session.pagesRead = Number(pagesRead) || 0;

  await session.save();

  return session;
};

const getBookQuiz = async (
  readingId,
  userId
) => {
  const reading = await ReadingProgress.findOne({
    _id: readingId,
    userId,
  });

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

  if (reading.status === 'completed') {
    const error = new Error(
      'This book has already been completed'
    );
    error.statusCode = 400;
    throw error;
  }

  const book = await Book.findById(
    reading.bookId
  ).select('title quiz');

  if (!book) {
    const error = new Error('Book not found');
    error.statusCode = 404;
    throw error;
  }

  const questions = book.quiz.map((question) => ({
    id: question._id,
    question: question.question,
    options: question.options,
  }));

  return {
    bookId: book._id,
    title: book.title,
    questions,
  };
};

module.exports = {
  getMyReading,
  getReadingById,
  startReading,
  updateProgress,
  createReadingSession,
  endReadingSession,
  getBookQuiz,
};