const prisma = require('../utils/prisma');
const { hashPassword } = require('../utils/hashUtils');

class AdminError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const sanitizeUser = (user) => {
  if (!user) return null;
  const { passwordHash, ...sanitized } = user;
  return sanitized;
};

const getDashboardMetrics = async () => {
  const [totalUsers, totalStores, totalRatings, pendingStoresCount, userRoles, storePerformance] = await Promise.all([
    prisma.user.count(),
    prisma.store.count({ where: { status: 'APPROVED' } }),
    prisma.rating.count(),
    prisma.store.count({ where: { status: 'PENDING' } }),
    prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    }),
    prisma.store.findMany({
      where: { status: 'APPROVED' },
      select: {
        id: true,
        name: true,
        address: true,
        category: true,
        ratings: {
          select: { rating: true },
        },
      },
    }),
  ]);

  const roleDistribution = { USER: 0, STORE_OWNER: 0, ADMIN: 0 };
  userRoles.forEach((r) => {
    roleDistribution[r.role] = r._count.role;
  });

  const storesWithPerformance = storePerformance.map((s) => {
    const total = s.ratings.length;
    const sum = s.ratings.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = total > 0 ? Number((sum / total).toFixed(1)) : 0;
    return {
      id: s.id,
      name: s.name,
      address: s.address,
      category: s.category || 'General',
      averageRating,
      totalRatings: total,
    };
  });
  storesWithPerformance.sort((a, b) => b.averageRating - a.averageRating);

  return {
    totalUsers,
    totalStores,
    totalRatings,
    pendingStoresCount,
    roleDistribution,
    storePerformance: storesWithPerformance,
  };
};

const getPendingStores = async () => {
  const stores = await prisma.store.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      category: true,
      status: true,
      createdAt: true,
      owner: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return { stores };
};

const approveStore = async (storeId) => {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store) {
    throw new AdminError('Store not found', 404);
  }

  const updatedStore = await prisma.store.update({
    where: { id: storeId },
    data: {
      status: 'APPROVED',
      rejectionReason: null,
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return updatedStore;
};

const rejectStore = async (storeId, reason) => {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store) {
    throw new AdminError('Store not found', 404);
  }

  const updatedStore = await prisma.store.update({
    where: { id: storeId },
    data: {
      status: 'REJECTED',
      rejectionReason: reason || 'Business information could not be verified.',
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return updatedStore;
};

const getUsers = async ({ name, email, address, role, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 }) => {
  const where = {};
  if (name) where.name = { contains: name, mode: 'insensitive' };
  if (email) where.email = { contains: email, mode: 'insensitive' };
  if (address) where.address = { contains: address, mode: 'insensitive' };
  if (role) where.role = role;

  const skip = (page - 1) * limit;

  const [total, rawUsers] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  return {
    users: rawUsers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AdminError('User not found', 404);
  }

  if (user.role === 'STORE_OWNER') {
    const stores = await prisma.store.findMany({
      where: { ownerId: id },
      include: {
        ratings: {
          select: { rating: true },
        },
      },
    });

    const storesWithRating = stores.map((store) => {
      const total = store.ratings.length;
      const sum = store.ratings.reduce((acc, r) => acc + r.rating, 0);
      const averageRating = total > 0 ? Number((sum / total).toFixed(1)) : 0;
      const { ratings, ...storeData } = store;
      return {
        ...storeData,
        averageRating,
        totalRatings: total,
      };
    });

    return {
      ...user,
      stores: storesWithRating,
    };
  }

  return user;
};

const createUser = async ({ name, email, address, password, role }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new AdminError('Email address is already registered', 409);
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      address,
      passwordHash: hashedPassword,
      role,
    },
  });

  return sanitizeUser(newUser);
};

const getStores = async ({ name, email, address, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 }) => {
  const where = {};
  if (name) where.name = { contains: name, mode: 'insensitive' };
  if (email) where.email = { contains: email, mode: 'insensitive' };
  if (address) where.address = { contains: address, mode: 'insensitive' };

  if (sortBy === 'rating') {
    const allStores = await prisma.store.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        ratings: {
          select: { rating: true },
        },
      },
    });

    const processed = allStores.map((store) => {
      const total = store.ratings.length;
      const sum = store.ratings.reduce((acc, r) => acc + r.rating, 0);
      const averageRating = total > 0 ? Number((sum / total).toFixed(1)) : 0;
      const { ratings, ...storeData } = store;
      return { ...storeData, averageRating, totalRatings: total };
    });

    processed.sort((a, b) => {
      return sortOrder === 'asc' ? a.averageRating - b.averageRating : b.averageRating - a.averageRating;
    });

    const total = processed.length;
    const paginated = processed.slice((page - 1) * limit, page * limit);

    return {
      stores: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  const skip = (page - 1) * limit;

  const [total, rawStores] = await Promise.all([
    prisma.store.count({ where }),
    prisma.store.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        ratings: {
          select: { rating: true },
        },
      },
    }),
  ]);

  const stores = rawStores.map((store) => {
    const total = store.ratings.length;
    const sum = store.ratings.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = total > 0 ? Number((sum / total).toFixed(1)) : 0;
    const { ratings, ...storeData } = store;
    return { ...storeData, averageRating, totalRatings: total };
  });

  return {
    stores,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const getStoreById = async (id) => {
  const store = await prisma.store.findUnique({
    where: { id },
    include: {
      owner: {
        select: { id: true, name: true, email: true, role: true },
      },
      ratings: {
        select: { rating: true },
      },
    },
  });

  if (!store) {
    throw new AdminError('Store not found', 404);
  }

  const total = store.ratings.length;
  const sum = store.ratings.reduce((acc, r) => acc + r.rating, 0);
  const averageRating = total > 0 ? Number((sum / total).toFixed(1)) : 0;
  const { ratings, ...storeData } = store;

  return {
    ...storeData,
    averageRating,
    totalRatings: total,
  };
};

const createStore = async ({ name, email, address, ownerId }) => {
  const owner = await prisma.user.findUnique({
    where: { id: ownerId },
  });

  if (!owner) {
    throw new AdminError('Specified store owner does not exist', 404);
  }

  if (owner.role !== 'STORE_OWNER') {
    throw new AdminError('Store owner ID must reference a user with role STORE_OWNER', 400);
  }

  const newStore = await prisma.store.create({
    data: {
      name,
      email: email.toLowerCase(),
      address,
      ownerId,
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return {
    ...newStore,
    averageRating: 0,
    totalRatings: 0,
  };
};

module.exports = {
  AdminError,
  getDashboardMetrics,
  getUsers,
  getUserById,
  createUser,
  getStores,
  getStoreById,
  createStore,
  getPendingStores,
  approveStore,
  rejectStore,
};
