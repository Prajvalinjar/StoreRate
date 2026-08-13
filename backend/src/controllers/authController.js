const { registerSchema, loginSchema, changePasswordSchema } = require('../validators/authValidator');
const { registerUser, loginUser, changePassword, AuthError } = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const result = await registerUser(validatedData);
    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await loginUser(validatedData);
    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
    next(error);
  }
};

const getMe = async (req, res) => {
  return res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
};

const handleChangePassword = async (req, res, next) => {
  try {
    const validatedData = changePasswordSchema.parse(req.body);
    const updatedUser = await changePassword(req.user.id, validatedData.oldPassword, validatedData.newPassword);
    return res.status(200).json({
      status: 'success',
      message: 'Password changed successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  handleChangePassword,
};
