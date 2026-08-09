const ReadingProgress = require('../models/ReadingProgress');
const Book = require('../models/Book');

const {
  awardXP,
  XP_REWARDS,
} = require('./gamification.service');

const PASS_PERCENTAGE = 70;

const completeBook = async (userId, readingId, answers) => {
  if (!Array.isArray(answers)) {
    const error = new Error('Answers must be an array');
    error.statusCode = 400;
    throw error;
  }

  const reading = await ReadingProgress.findOne({
    _id: readingId,
    userId,
  });

  if (!reading) {
    const error = new Error('Reading progress not found');
    error.statusCode = 404;
    throw error;
  }

  if (reading.status === 'completed') {
    const error = new Error('Book already completed');
    error.statusCode = 400;
    throw error;
  }

  if (reading.progress < 100) {
    const error = new Error(
      'Complete 100% of the book before submitting the quiz'
    );
    error.statusCode = 400;
    throw error;
  }

  const book = await Book.findById(reading.bookId).select(
    'title quiz xpReward'
  );

  if (!book) {
    const error = new Error('Book not found');
    error.statusCode = 404;
    throw error;
  }

  if (!book.quiz || book.quiz.length === 0) {
    const error = new Error(
      'This book does not have a completion quiz'
    );
    error.statusCode = 400;
    throw error;
  }

  const answerMap = new Map();

  answers.forEach((item) => {
    if (item.questionId !== undefined) {
      answerMap.set(
        String(item.questionId),
        Number(item.answer)
      );
    }
  });

  let correctAnswers = 0;

  book.quiz.forEach((question) => {
    const submittedAnswer = answerMap.get(
      String(question._id)
    );

    if (
      submittedAnswer !== undefined &&
      submittedAnswer === question.correctAnswer
    ) {
      correctAnswers += 1;
    }
  });

  const totalQuestions = book.quiz.length;

  const score = Math.round(
    (correctAnswers / totalQuestions) * 100
  );

  const passed = score >= PASS_PERCENTAGE;

  reading.quizScore = score;
  reading.quizPassed = passed;
  reading.quizPassedAt = passed
    ? new Date()
    : reading.quizPassedAt;

  if (!passed) {
    await reading.save();

    return {
      completed: false,
      passed: false,
      score,
      correctAnswers,
      totalQuestions,
      passPercentage: PASS_PERCENTAGE,
      reading,
    };
  }

  reading.status = 'completed';
  reading.completedAt = new Date();

  if (!reading.completionRewarded) {
    const completionReward = await awardXP({
      userId,
      amount:
        book.xpReward || XP_REWARDS.BOOK_COMPLETED,
      reason: 'BOOK_COMPLETED',
      referenceId: reading._id,
    });

    const quizReward = await awardXP({
      userId,
      amount: XP_REWARDS.QUIZ_COMPLETED,
      reason: 'QUIZ_COMPLETED',
      referenceId: reading._id,
    });

    reading.completionRewarded =
      completionReward.rewarded;

    await reading.save();

    return {
      completed: true,
      passed: true,
      score,
      correctAnswers,
      totalQuestions,
      passPercentage: PASS_PERCENTAGE,
      rewards: {
        completion: completionReward,
        quiz: quizReward,
      },
      reading,
    };
  }

  await reading.save();

  return {
    completed: true,
    passed: true,
    score,
    correctAnswers,
    totalQuestions,
    passPercentage: PASS_PERCENTAGE,
    rewards: null,
    reading,
  };
};

module.exports = {
  completeBook,
};