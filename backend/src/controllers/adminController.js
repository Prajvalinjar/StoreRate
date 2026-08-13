const {
  createUserSchema,
  createStoreSchema,
  userQuerySchema,
  storeQuerySchema,
} = require('../validators/adminValidator');
const adminService = require('../services/adminService');

const getDashboard = async (req, res, next) => {
  try {
    const metrics = await adminService.getDashboardMetrics();
    return res.status(200).json({
      status: 'success',
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const queryParams = userQuerySchema.parse(req.query);
    const result = await adminService.getUsers(queryParams);
    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid query parameters',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await adminService.getUserById(id);
    return res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    if (error instanceof adminService.AdminError) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
    next(error);
  }
};

const addUser = async (req, res, next) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const newUser = await adminService.createUser(validatedData);
    return res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: { user: newUser },
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    if (error instanceof adminService.AdminError) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
    next(error);
  }
};

const listStores = async (req, res, next) => {
  try {
    const queryParams = storeQuerySchema.parse(req.query);
    const result = await adminService.getStores(queryParams);
    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid query parameters',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    next(error);
  }
};

const getStore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const store = await adminService.getStoreById(id);
    return res.status(200).json({
      status: 'success',
      data: { store },
    });
  } catch (error) {
    if (error instanceof adminService.AdminError) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
    next(error);
  }
};

const addStore = async (req, res, next) => {
  try {
    const validatedData = createStoreSchema.parse(req.body);
    const newStore = await adminService.createStore(validatedData);
    return res.status(201).json({
      status: 'success',
      message: 'Store created successfully',
      data: { store: newStore },
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    if (error instanceof adminService.AdminError) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
    next(error);
  }
};

module.exports = {
  getDashboard,
  listUsers,
  getUser,
  addUser,
  listStores,
  getStore,
  addStore,
};
