const bcrypt = require('bcryptjs');

const User = require('../models/User');

const { generateToken } = require('../utils/jwt');

const registerStudent = async ({
  name,
  email,
  password,
  studentId,
  department,
  semester,
}) => {
  if (
    !name ||
    !email ||
    !password ||
    !studentId ||
    !department ||
    !semester
  ) {
    const error = new Error('Please provide all required fields');
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error('Password must be at least 6 characters');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedStudentId = studentId.trim();

  const existingEmail = await User.findOne({
    email: normalizedEmail,
  });

  if (existingEmail) {
    const error = new Error(
      'An account with this email already exists'
    );
    error.statusCode = 409;
    throw error;
  }

  const existingStudentId = await User.findOne({
    studentId: normalizedStudentId,
  });

  if (existingStudentId) {
    const error = new Error(
      'This student ID is already registered'
    );
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    studentId: normalizedStudentId,
    department: department.trim(),
    semester,
    role: 'student',
  });

  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      department: user.department,
      semester: user.semester,
      role: user.role,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
    },
  };
};

const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error(
      'Email and password are required'
    );
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select('+password');

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Your account has been disabled');
    error.statusCode = 403;
    throw error;
  }

  const passwordMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      department: user.department,
      semester: user.semester,
      role: user.role,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
    },
  };
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select('-password');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const getUserById = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User no longer exists');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Your account has been disabled');
    error.statusCode = 403;
    throw error;
  }

  return user;
};

module.exports = {
  registerStudent,
  loginUser,
  getCurrentUser,
  getUserById,
};