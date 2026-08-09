const User = require('../models/User');
const ReadingProgress = require('../models/ReadingProgress');
const XPTransaction = require('../models/XPTransaction');

const getDateKey = (date = new Date()) => {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: process.env.APP_TIMEZONE || 'Asia/Kolkata',
  }).format(new Date(date));
};

const getPreviousDateKey = (dateKey) => {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() - 1);

  return getDateKey(date);
};

const getLastActivityDate = async (userId) => {
  const activity = await ReadingProgress.findOne({
    userId,
    progress: {
      $gt: 0,
    },
  })
    .sort({
      updatedAt: -1,
    })
    .select('updatedAt');

  return activity ? getDateKey(activity.updatedAt) : null;
};

const hasActivityToday = async (userId) => {
  const today = getDateKey();

  const startOfDay = new Date(`${today}T00:00:00`);
  const endOfDay = new Date(`${today}T23:59:59.999`);

  const activity = await ReadingProgress.findOne({
    userId,
    updatedAt: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    progress: {
      $gt: 0,
    },
  }).select('_id');

  return Boolean(activity);
};

const calculateCurrentStreak = async (userId) => {
  const activities = await ReadingProgress.find({
    userId,
    progress: {
      $gt: 0,
    },
  })
    .select('updatedAt')
    .sort({
      updatedAt: -1,
    })
    .lean();

  if (!activities.length) {
    return 0;
  }

  const dates = [
    ...new Set(
      activities.map((activity) =>
        getDateKey(activity.updatedAt)
      )
    ),
  ];

  const today = getDateKey();
  const yesterday = getPreviousDateKey(today);

  if (
    dates[0] !== today &&
    dates[0] !== yesterday
  ) {
    return 0;
  }

  let streak = 0;
  let currentDate =
    dates[0] === today ? today : yesterday;

  for (const date of dates) {
    if (date === currentDate) {
      streak += 1;
      currentDate = getPreviousDateKey(currentDate);
    } else if (date < currentDate) {
      break;
    }
  }

  return streak;
};

const updateStreak = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const alreadyActiveToday =
    await hasActivityToday(userId);

  if (alreadyActiveToday) {
    const currentStreak =
      await calculateCurrentStreak(userId);

    user.streak = currentStreak;

    await user.save();

    return {
      streak: currentStreak,
      increased: false,
      alreadyCountedToday: true,
      reward: null,
    };
  }

  const previousStreak =
    await calculateCurrentStreak(userId);

  const currentStreak = previousStreak + 1;

  user.streak = currentStreak;

  await user.save();

  let reward = null;

  if (currentStreak === 7) {
    const existingReward =
      await XPTransaction.findOne({
        userId,
        reason: 'SEVEN_DAY_STREAK',
      });

    if (!existingReward) {
      reward =
        await XPTransaction.create({
          userId,
          amount: 30,
          reason: 'SEVEN_DAY_STREAK',
          referenceId: null,
        });

      user.xp += 30;

      if (user.xp >= 1000) {
        user.level = 5;
      } else if (user.xp >= 500) {
        user.level = 4;
      } else if (user.xp >= 250) {
        user.level = 3;
      } else if (user.xp >= 100) {
        user.level = 2;
      } else {
        user.level = 1;
      }

      await user.save();
    }
  }

  if (currentStreak === 30) {
    const existingReward =
      await XPTransaction.findOne({
        userId,
        reason: 'THIRTY_DAY_STREAK',
      });

    if (!existingReward) {
      reward =
        await XPTransaction.create({
          userId,
          amount: 100,
          reason: 'THIRTY_DAY_STREAK',
          referenceId: null,
        });

      user.xp += 100;

      if (user.xp >= 1000) {
        user.level = 5;
      } else if (user.xp >= 500) {
        user.level = 4;
      } else if (user.xp >= 250) {
        user.level = 3;
      } else if (user.xp >= 100) {
        user.level = 2;
      } else {
        user.level = 1;
      }

      await user.save();
    }
  }

  return {
    streak: currentStreak,
    increased: true,
    alreadyCountedToday: false,
    reward,
  };
};

const getStreakStats = async (userId) => {
  const user = await User.findById(userId)
    .select('streak xp level')
    .lean();

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const currentStreak =
    await calculateCurrentStreak(userId);

  const activeToday =
    await hasActivityToday(userId);

  return {
    streak: currentStreak,
    activeToday,
    xp: user.xp,
    level: user.level,
  };
};

module.exports = {
  updateStreak,
  getStreakStats,
  calculateCurrentStreak,
};