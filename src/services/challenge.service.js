const Challenge = require('../models/Challenge');
const ChallengeProgress = require('../models/ChallengeProgress');
const ReadingProgress = require('../models/ReadingProgress');
const Book = require('../models/Book');

const {
    awardXP
} = require('./gamification.service');

const {
    checkAndUnlockBadges
} = require('./badge.service');

const updateChallengeStatus = async (challenge) => {
    const now = new Date();

    if (challenge.endDate < now) {
        challenge.status = 'expired';
        challenge.isActive = false;

        await challenge.save();

        return challenge;
    }

    if (
        challenge.startDate <= now &&
        challenge.status === 'draft'
    ) {
        challenge.status = 'active';

        await challenge.save();
    }

    return challenge;
};

const createChallenge = async (data) => {
    if (
        !data.title ||
        !data.description ||
        !data.type ||
        !data.target ||
        data.reward === undefined ||
        !data.startDate ||
        !data.endDate
    ) {
        const error = new Error(
            'All challenge fields are required'
        );

        error.statusCode = 400;

        throw error;
    }

    if (
        ![
            'books_completed',
            'pages_read',
            'categories_read'
        ].includes(data.type)
    ) {
        const error = new Error(
            'Invalid challenge type'
        );

        error.statusCode = 400;

        throw error;
    }

    if (
        new Date(data.endDate) <=
        new Date(data.startDate)
    ) {
        const error = new Error(
            'End date must be after start date'
        );

        error.statusCode = 400;

        throw error;
    }

    return Challenge.create(data);
};

const getChallenges = async (userId) => {
    const challenges = await Challenge.find({
        isActive: true
    })
        .sort({
            endDate: 1
        })
        .lean();

    const progress = await ChallengeProgress.find({
        userId
    }).lean();

    const progressMap = new Map(
        progress.map((item) => [
            String(item.challengeId),
            item
        ])
    );

    return challenges.map((challenge) => {
        const item = progressMap.get(
            String(challenge._id)
        );

        return {
            ...challenge,
            joined: Boolean(item),
            progress: item?.progress || 0,
            target: challenge.target,
            completed: item?.completed || false,
            completedAt: item?.completedAt || null
        };
    });
};

const getChallenge = async (
    challengeId,
    userId
) => {
    const challenge = await Challenge.findById(
        challengeId
    ).lean();

    if (!challenge) {
        const error = new Error(
            'Challenge not found'
        );

        error.statusCode = 404;

        throw error;
    }

    const progress =
        await ChallengeProgress.findOne({
            userId,
            challengeId
        }).lean();

    return {
        ...challenge,
        joined: Boolean(progress),
        progress: progress?.progress || 0,
        completed: progress?.completed || false,
        completedAt: progress?.completedAt || null
    };
};

const joinChallenge = async (
    userId,
    challengeId
) => {
    const challenge = await Challenge.findById(
        challengeId
    );

    if (!challenge) {
        const error = new Error(
            'Challenge not found'
        );

        error.statusCode = 404;

        throw error;
    }

    const now = new Date();

    if (
        !challenge.isActive ||
        challenge.status !== 'active'
    ) {
        const error = new Error(
            'Challenge is not active'
        );

        error.statusCode = 400;

        throw error;
    }

    if (
        now < challenge.startDate ||
        now > challenge.endDate
    ) {
        const error = new Error(
            'Challenge is outside its active period'
        );

        error.statusCode = 400;

        throw error;
    }

    const existing =
        await ChallengeProgress.findOne({
            userId,
            challengeId
        });

    if (existing) {
        return {
            joined: true,
            alreadyJoined: true,
            progress: existing
        };
    }

    const progress =
        await ChallengeProgress.create({
            userId,
            challengeId,
            target: challenge.target
        });

    return {
        joined: true,
        alreadyJoined: false,
        progress
    };
};

const calculateProgress = async (
    userId,
    challenge
) => {
    const completedBooks =
        await ReadingProgress.find({
            userId,
            status: 'completed'
        })
            .populate({
                path: 'bookId',
                select: 'pages category'
            })
            .lean();

    if (
        challenge.type ===
        'books_completed'
    ) {
        return completedBooks.length;
    }

    if (
        challenge.type ===
        'pages_read'
    ) {
        return completedBooks.reduce(
            (total, reading) => {
                return (
                    total +
                    (reading.pagesRead || 0)
                );
            },
            0
        );
    }

    if (
        challenge.type ===
        'categories_read'
    ) {
        const categories = new Set();

        completedBooks.forEach(
            (reading) => {
                if (
                    reading.bookId?.category
                ) {
                    categories.add(
                        reading.bookId.category
                    );
                }
            }
        );

        return categories.size;
    }

    return 0;
};

const updateChallengeProgress = async (
    userId,
    challengeId
) => {
    const challenge =
        await Challenge.findById(
            challengeId
        );

    if (!challenge) {
        return null;
    }

    const progress =
        await ChallengeProgress.findOne({
            userId,
            challengeId
        });

    if (!progress) {
        return null;
    }

    const now = new Date();

    if (
        now > challenge.endDate
    ) {
        return progress;
    }

    const currentProgress =
        await calculateProgress(
            userId,
            challenge
        );

    progress.progress =
        Math.min(
            currentProgress,
            challenge.target
        );

    if (
        progress.progress >=
        challenge.target &&
        !progress.completed
    ) {
        progress.completed = true;
        progress.completedAt = new Date();

        if (!progress.rewardClaimed) {
            const rewardResult =
                await awardXP({
                    userId,
                    amount: challenge.reward,
                    reason: 'CHALLENGE_COMPLETED',
                    referenceId:
                        challenge._id
                });

            progress.rewardClaimed =
                rewardResult.rewarded;
        }

        await progress.save();

        await checkAndUnlockBadges(
            userId
        );

        return progress;
    }

    await progress.save();

    return progress;
};

const updateAllUserChallenges = async (
    userId
) => {
    const joinedChallenges =
        await ChallengeProgress.find({
            userId,
            completed: false
        }).select('challengeId');

    const updated = [];

    for (
        const item of joinedChallenges
    ) {
        const result =
            await updateChallengeProgress(
                userId,
                item.challengeId
            );

        if (result) {
            updated.push(result);
        }
    }

    return updated;
};

const updateChallenge = async (
    challengeId,
    data
) => {
    const challenge =
        await Challenge.findById(
            challengeId
        );

    if (!challenge) {
        const error = new Error(
            'Challenge not found'
        );

        error.statusCode = 404;

        throw error;
    }

    if (data.type) {
        if (
            ![
                'books_completed',
                'pages_read',
                'categories_read'
            ].includes(data.type)
        ) {
            const error = new Error(
                'Invalid challenge type'
            );

            error.statusCode = 400;

            throw error;
        }
    }

    Object.assign(
        challenge,
        data
    );

    await challenge.save();

    return challenge;
};

const deleteChallenge = async (
    challengeId
) => {
    const challenge =
        await Challenge.findById(
            challengeId
        );

    if (!challenge) {
        const error = new Error(
            'Challenge not found'
        );

        error.statusCode = 404;

        throw error;
    }

    await ChallengeProgress.deleteMany({
        challengeId
    });

    await Challenge.deleteOne({
        _id: challengeId
    });

    return true;
};

const getMyChallengeProgress = async (
    userId
) => {
    await updateAllUserChallenges(
        userId
    );

    return ChallengeProgress.find({
        userId
    })
        .populate(
            'challengeId'
        )
        .sort({
            updatedAt: -1
        })
        .lean();
};

module.exports = {
    createChallenge,
    getChallenges,
    getChallenge,
    joinChallenge,
    updateChallengeProgress,
    updateAllUserChallenges,
    getMyChallengeProgress,
    updateChallenge,
    deleteChallenge
};