const ReadingProgress = require('../models/ReadingProgress');
const Book = require('../models/Book');

const {
    awardXP
} = require('./gamification.service');

const {
    checkAndUnlockBadges
} = require('./badge.service');

const {
    updateAllUserChallenges
} = require('./challenge.service');

const PASS_PERCENTAGE = 70;

const completeBook = async (
    userId,
    readingId,
    answers
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

    if (reading.progress < 100) {
        const error = new Error(
            'Complete 100% of the book before submitting the quiz'
        );

        error.statusCode = 400;
        throw error;
    }

    if (!Array.isArray(answers)) {
        const error = new Error(
            'Quiz answers are required'
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

    const quiz = book.quiz || [];

    if (!quiz.length) {
        const error = new Error(
            'This book does not have a quiz'
        );

        error.statusCode = 400;
        throw error;
    }

    const answerMap = new Map();

    answers.forEach((item) => {
        if (
            item.questionId !== undefined &&
            item.answer !== undefined
        ) {
            answerMap.set(
                String(item.questionId),
                Number(item.answer)
            );
        }
    });

    let correctAnswers = 0;

    quiz.forEach((question) => {
        const answer =
            answerMap.get(
                String(question._id)
            );

        if (
            answer !== undefined &&
            answer ===
                Number(
                    question.correctAnswer
                )
        ) {
            correctAnswers++;
        }
    });

    const totalQuestions =
        quiz.length;

    const score = Math.round(
        (correctAnswers /
            totalQuestions) *
            100
    );

    const passed =
        score >= PASS_PERCENTAGE;

    reading.quizScore = score;
    reading.quizPassed = passed;

    if (!passed) {
        await reading.save();

        return {
            completed: false,
            passed: false,
            score,
            correctAnswers,
            totalQuestions,
            passPercentage:
                PASS_PERCENTAGE,
            rewards: {
                completion: 0,
                quiz: 0,
                total: 0
            },
            badges: [],
            challenges: [],
            reading
        };
    }

    reading.status =
        'completed';

    reading.progress = 100;

    reading.pagesRead =
        book.pages;

    reading.completedAt =
        new Date();

    reading.quizScore =
        score;

    reading.quizPassed =
        true;

    await reading.save();

    let completionReward = 0;
    let quizReward = 0;

    if (!reading.completionRewarded) {
        const result =
            await awardXP({
                userId,
                amount:
                    book.xpReward ||
                    50,
                reason:
                    'BOOK_COMPLETED',
                referenceId:
                    reading._id
            });

        if (result.rewarded) {
            completionReward =
                result.amount;
        }

        reading.completionRewarded =
            true;

        await reading.save();
    }

    const quizResult =
        await awardXP({
            userId,
            amount: 10,
            reason:
                'QUIZ_COMPLETED',
            referenceId:
                reading._id
        });

    if (quizResult.rewarded) {
        quizReward =
            quizResult.amount;
    }

    const challengeProgress =
        await updateAllUserChallenges(
            userId
        );

    const badgeResult =
        await checkAndUnlockBadges(
            userId
        );

    return {
        completed: true,
        passed: true,
        score,
        correctAnswers,
        totalQuestions,
        passPercentage:
            PASS_PERCENTAGE,
        rewards: {
            completion:
                completionReward,
            quiz:
                quizReward,
            total:
                completionReward +
                quizReward
        },
        badges:
            badgeResult.unlocked ||
            [],
        challenges:
            challengeProgress,
        reading
    };
};

module.exports = {
    completeBook
};