const User = require('../models/User');
const Book = require('../models/Book');
const ReadingProgress = require('../models/ReadingProgress');
const ReadingSession = require('../models/ReadingSession');
const Review = require('../models/Review');
const ChallengeProgress = require('../models/ChallengeProgress');
const UserBadge = require('../models/UserBadge');
const XPTransaction = require('../models/XPTransaction');

const getStudentAnalytics = async (userId) => {
    const user = await User.findById(userId)
        .select('name email studentId department semester xp level streak')
        .lean();

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    const readingStats = await ReadingProgress.aggregate([
        {
            $match: {
                userId
            }
        },
        {
            $group: {
                _id: null,
                totalBooksStarted: {
                    $sum: 1
                },
                completedBooks: {
                    $sum: {
                        $cond: [
                            {
                                $eq: [
                                    '$status',
                                    'completed'
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },
                pagesRead: {
                    $sum: '$pagesRead'
                },
                averageProgress: {
                    $avg: '$progress'
                },
                averageQuizScore: {
                    $avg: {
                        $cond: [
                            {
                                $ne: [
                                    '$quizScore',
                                    null
                                ]
                            },
                            '$quizScore',
                            null
                        ]
                    }
                }
            }
        }
    ]);

    const sessionStats =
        await ReadingSession.aggregate([
            {
                $match: {
                    userId
                }
            },
            {
                $group: {
                    _id: null,
                    totalSessions: {
                        $sum: 1
                    },
                    totalReadingTime: {
                        $sum: '$duration'
                    }
                }
            }
        ]);

    const challengeStats =
        await ChallengeProgress.aggregate([
            {
                $match: {
                    userId
                }
            },
            {
                $group: {
                    _id: null,
                    joined: {
                        $sum: 1
                    },
                    completed: {
                        $sum: {
                            $cond: [
                                '$completed',
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

    const badgeCount =
        await UserBadge.countDocuments({
            userId
        });

    const xpTransactions =
        await XPTransaction.find({
            userId
        })
            .sort({
                createdAt: -1
            })
            .limit(10)
            .lean();

    const readingActivity =
        await ReadingProgress.find({
            userId
        })
            .select(
                'bookId status progress pagesRead updatedAt completedAt'
            )
            .populate(
                'bookId',
                'title author cover category'
            )
            .sort({
                updatedAt: -1
            })
            .limit(20)
            .lean();

    const reading = readingStats[0] || {
        totalBooksStarted: 0,
        completedBooks: 0,
        pagesRead: 0,
        averageProgress: 0,
        averageQuizScore: 0
    };

    const sessions = sessionStats[0] || {
        totalSessions: 0,
        totalReadingTime: 0
    };

    const challenges = challengeStats[0] || {
        joined: 0,
        completed: 0
    };

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            studentId: user.studentId,
            department: user.department,
            semester: user.semester
        },
        overview: {
            totalBooksStarted:
                reading.totalBooksStarted,
            completedBooks:
                reading.completedBooks,
            pagesRead:
                reading.pagesRead,
            averageProgress: Number(
                (
                    reading.averageProgress || 0
                ).toFixed(1)
            ),
            averageQuizScore: Number(
                (
                    reading.averageQuizScore || 0
                ).toFixed(1)
            ),
            totalSessions:
                sessions.totalSessions,
            totalReadingTime:
                sessions.totalReadingTime,
            currentStreak:
                user.streak || 0,
            totalXP:
                user.xp || 0,
            level:
                user.level || 1,
            badgesEarned:
                badgeCount,
            challengesJoined:
                challenges.joined,
            challengesCompleted:
                challenges.completed
        },
        readingActivity,
        recentXP: xpTransactions
    };
};

const getAdminAnalytics = async () => {
    const [
        totalStudents,
        totalBooks,
        totalReviews,
        totalBadgesUnlocked,
        activeChallenges
    ] = await Promise.all([
        User.countDocuments({
            role: 'student'
        }),

        Book.countDocuments(),

        Review.countDocuments(),

        UserBadge.countDocuments(),

        ChallengeProgress.distinct(
            'challengeId',
            {
                completed: false
            }
        )
    ]);

    const readingStats =
        await ReadingProgress.aggregate([
            {
                $group: {
                    _id: null,
                    totalStarted: {
                        $sum: 1
                    },
                    totalCompleted: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        '$status',
                                        'completed'
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    totalPagesRead: {
                        $sum: '$pagesRead'
                    },
                    averageQuizScore: {
                        $avg: {
                            $cond: [
                                {
                                    $ne: [
                                        '$quizScore',
                                        null
                                    ]
                                },
                                '$quizScore',
                                null
                            ]
                        }
                    }
                }
            }
        ]);

    const sessionStats =
        await ReadingSession.aggregate([
            {
                $group: {
                    _id: null,
                    totalSessions: {
                        $sum: 1
                    },
                    totalReadingTime: {
                        $sum: '$duration'
                    }
                }
            }
        ]);

    const ratingStats =
        await Review.aggregate([
            {
                $group: {
                    _id: null,
                    averageRating: {
                        $avg: '$rating'
                    }
                }
            }
        ]);

    const topReaders =
        await User.find({
            role: 'student'
        })
            .select(
                'name studentId department xp level streak'
            )
            .sort({
                xp: -1
            })
            .limit(10)
            .lean();

    const popularBooks =
        await ReadingProgress.aggregate([
            {
                $group: {
                    _id: '$bookId',
                    readers: {
                        $sum: 1
                    },
                    completed: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        '$status',
                                        'completed'
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $sort: {
                    readers: -1
                }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: 'books',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'book'
                }
            },
            {
                $unwind: {
                    path: '$book',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 0,
                    bookId: '$_id',
                    title: '$book.title',
                    author: '$book.author',
                    readers: 1,
                    completed: 1
                }
            }
        ]);

    const reading = readingStats[0] || {
        totalStarted: 0,
        totalCompleted: 0,
        totalPagesRead: 0,
        averageQuizScore: 0
    };

    const sessions = sessionStats[0] || {
        totalSessions: 0,
        totalReadingTime: 0
    };

    const rating = ratingStats[0] || {
        averageRating: 0
    };

    const completionRate =
        reading.totalStarted > 0
            ? Number(
                  (
                      (reading.totalCompleted /
                          reading.totalStarted) *
                      100
                  ).toFixed(1)
              )
            : 0;

    return {
        overview: {
            totalStudents,
            totalBooks,
            totalReviews,
            totalBadgesUnlocked,
            activeChallenges:
                activeChallenges.length,
            totalReadingSessions:
                sessions.totalSessions,
            totalReadingTime:
                sessions.totalReadingTime,
            totalPagesRead:
                reading.totalPagesRead,
            totalBooksStarted:
                reading.totalStarted,
            totalBooksCompleted:
                reading.totalCompleted,
            completionRate,
            averageQuizScore: Number(
                (
                    reading.averageQuizScore || 0
                ).toFixed(1)
            ),
            averageRating: Number(
                (
                    rating.averageRating || 0
                ).toFixed(1)
            )
        },
        topReaders,
        popularBooks
    };
};

const getReadingActivity = async (
    userId
) => {
    const activity =
        await ReadingProgress.find({
            userId
        })
            .select(
                'bookId status progress pagesRead startedAt completedAt updatedAt'
            )
            .populate(
                'bookId',
                'title author cover category'
            )
            .sort({
                updatedAt: -1
            })
            .lean();

    return activity;
};

const getTopReaders = async () => {
    return User.find({
        role: 'student'
    })
        .select(
            'name studentId department xp level streak'
        )
        .sort({
            xp: -1
        })
        .limit(20)
        .lean();
};

module.exports = {
    getStudentAnalytics,
    getAdminAnalytics,
    getReadingActivity,
    getTopReaders
};