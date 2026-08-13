const prisma = require('../utils/prisma');
const { hashPassword, comparePassword } = require('../utils/hashUtils');
const { generateToken } = require('../utils/jwtUtils');

class AuthError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const sanitizeUser = (user) => {
  const { passwordHash, ...sanitized } = user;
  return sanitized;
};

const registerUser = async ({ name, email, address, password }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new AuthError('Email address is already registered', 409);
  }

  const hashedPassword = await hashPassword(password);

  // Force public registration role to USER
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      address,
      passwordHash: hashedPassword,
      role: 'USER',
    },
  });

  const token = generateToken({ userId: user.id, role: user.role });
  const sanitized = sanitizeUser(user);

  return { user: sanitized, token };
};

const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new AuthError('Invalid email or password', 401);
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AuthError('Invalid email or password', 401);
  }

  const token = generateToken({ userId: user.id, role: user.role });
  const sanitized = sanitizeUser(user);

  return { user: sanitized, token };
};

const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AuthError('User not found', 404);
  }

  const isOldPasswordValid = await comparePassword(oldPassword, user.passwordHash);
  if (!isOldPasswordValid) {
    throw new AuthError('Incorrect current password', 401);
  }

  if (oldPassword === newPassword) {
    throw new AuthError('New password must be different from current password', 400);
  }

  const newHashedPassword = await hashPassword(newPassword);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: newHashedPassword,
    },
  });

  return sanitizeUser(updatedUser);
};

module.exports = {
  AuthError,
  registerUser,
  loginUser,
  changePassword,
};
