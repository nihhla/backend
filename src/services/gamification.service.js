const User = require('../models/User');
const XPTransaction = require('../models/XPTransaction');

const LEVELS = [
  {
    level: 1,
    minXP: 0,
    maxXP: 99,
  },
  {
    level: 2,
    minXP: 100,
    maxXP: 249,
  },
  {
    level: 3,
    minXP: 250,
    maxXP: 499,
  },
  {
    level: 4,
    minXP: 500,
    maxXP: 999,
  },
  {
    level: 5,
    minXP: 1000,
    maxXP: Infinity,
  },
];

const XP_REWARDS = {
  BOOK_STARTED: 5,
  BOOK_COMPLETED: 50,
  QUIZ_COMPLETED: 10,
  BOOK_REVIEW: 10,
  READING_CHALLENGE: 25,
  SEVEN_DAY_STREAK: 30,
  THIRTY_DAY_STREAK: 100,
};

const calculateLevel = (xp) => {
  const currentLevel = LEVELS.find(
    (level) =>
      xp >= level.minXP &&
      xp <= level.maxXP
  );

  return currentLevel
    ? currentLevel.level
    : 5;
};

const getLevelProgress = (xp) => {
  const level = calculateLevel(xp);

  if (level === 5) {
    return {
      level,
      currentXP: xp,
      nextLevelXP: null,
      progress: 100,
      remainingXP: 0,
    };
  }

  const currentLevel = LEVELS[level - 1];
  const nextLevel = LEVELS[level];

  const levelXP = xp - currentLevel.minXP;
  const requiredXP =
    nextLevel.minXP - currentLevel.minXP;

  const progress = Math.min(
    100,
    Math.round((levelXP / requiredXP) * 100)
  );

  return {
    level,
    currentXP: xp,
    nextLevelXP: nextLevel.minXP,
    progress,
    remainingXP: Math.max(
      0,
      nextLevel.minXP - xp
    ),
  };
};

const awardXP = async ({
  userId,
  amount,
  reason,
  referenceId,
}) => {
  if (!userId || !amount || !reason) {
    const error = new Error(
      'User ID, XP amount and reason are required'
    );
    error.statusCode = 400;
    throw error;
  }

  if (amount <= 0) {
    const error = new Error(
      'XP amount must be greater than zero'
    );
    error.statusCode = 400;
    throw error;
  }

  const existingTransaction =
    await XPTransaction.findOne({
      userId,
      reason,
      referenceId: referenceId || null,
    });

  if (existingTransaction) {
    return {
      rewarded: false,
      transaction: existingTransaction,
      message: 'XP already rewarded for this activity',
    };
  }

  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const transaction = await XPTransaction.create({
    userId,
    amount,
    reason,
    referenceId: referenceId || null,
  });

  user.xp += amount;
  user.level = calculateLevel(user.xp);

  await user.save();

  return {
    rewarded: true,
    amount,
    reason,
    transaction,
    xp: user.xp,
    level: user.level,
  };
};

const getMyStats = async (userId) => {
  const user = await User.findById(userId)
    .select(
      'name email studentId department semester xp level streak'
    )
    .lean();

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const levelProgress = getLevelProgress(user.xp);

  const transactions =
    await XPTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      department: user.department,
      semester: user.semester,
    },
    xp: user.xp,
    level: user.level,
    streak: user.streak,
    levelProgress,
    recentXP: transactions,
  };
};

const getXPTransactions = async (userId) => {
  return XPTransaction.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
};

module.exports = {
  XP_REWARDS,
  calculateLevel,
  getLevelProgress,
  awardXP,
  getMyStats,
  getXPTransactions,
};