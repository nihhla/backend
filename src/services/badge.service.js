const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const User = require('../models/User');
const ReadingProgress = require('../models/ReadingProgress');

const getCompletedBooksCount = async (userId) => {
  return ReadingProgress.countDocuments({
    userId,
    status: 'completed',
  });
};

const checkRequirement = async (userId, badge) => {
  const user = await User.findById(userId)
    .select('xp streak')
    .lean();

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const completedBooks =
    await getCompletedBooksCount(userId);

  const { type, value } = badge.requirement;

  if (type === 'books_completed') {
    return completedBooks >= value;
  }

  if (type === 'streak') {
    return user.streak >= value;
  }

  if (type === 'xp') {
    return user.xp >= value;
  }

  return false;
};

const unlockBadge = async (userId, badgeId) => {
  const existing = await UserBadge.findOne({
    userId,
    badgeId,
  });

  if (existing) {
    return {
      unlocked: false,
      userBadge: existing,
    };
  }

  const badge = await Badge.findById(badgeId);

  if (!badge) {
    const error = new Error('Badge not found');
    error.statusCode = 404;
    throw error;
  }

  const eligible = await checkRequirement(
    userId,
    badge
  );

  if (!eligible) {
    return {
      unlocked: false,
      eligible: false,
      badge,
    };
  }

  const userBadge = await UserBadge.create({
    userId,
    badgeId,
    unlockedAt: new Date(),
  });

  return {
    unlocked: true,
    eligible: true,
    badge,
    userBadge,
  };
};

const checkAndUnlockBadges = async (userId) => {
  const badges = await Badge.find({
    isActive: true,
  }).lean();

  const unlocked = [];
  const alreadyUnlocked = [];

  for (const badge of badges) {
    const existing = await UserBadge.findOne({
      userId,
      badgeId: badge._id,
    });

    if (existing) {
      alreadyUnlocked.push(badge);
      continue;
    }

    const eligible = await checkRequirement(
      userId,
      badge
    );

    if (!eligible) {
      continue;
    }

    const userBadge = await UserBadge.create({
      userId,
      badgeId: badge._id,
      unlockedAt: new Date(),
    });

    unlocked.push({
      badge,
      userBadge,
    });
  }

  return {
    unlocked,
    alreadyUnlocked,
  };
};

const getAllBadges = async () => {
  return Badge.find({
    isActive: true,
  })
    .sort({
      createdAt: 1,
    })
    .lean();
};

const getMyBadges = async (userId) => {
  const badges = await Badge.find({
    isActive: true,
  })
    .sort({
      createdAt: 1,
    })
    .lean();

  const userBadges = await UserBadge.find({
    userId,
  })
    .select('badgeId unlockedAt')
    .lean();

  const unlockedMap = new Map(
    userBadges.map((item) => [
      String(item.badgeId),
      item,
    ])
  );

  return badges.map((badge) => {
    const userBadge = unlockedMap.get(
      String(badge._id)
    );

    return {
      ...badge,
      unlocked: Boolean(userBadge),
      unlockedAt: userBadge?.unlockedAt || null,
    };
  });
};

const createBadge = async (data) => {
  return Badge.create(data);
};

module.exports = {
  checkAndUnlockBadges,
  unlockBadge,
  getAllBadges,
  getMyBadges,
  createBadge,
};