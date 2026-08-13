const { z } = require('zod');

const createUserSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(20, 'Name must be at least 20 characters long')
    .max(60, 'Name must not exceed 60 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Invalid email address format'),
  address: z
    .string({ required_error: 'Address is required' })
    .trim()
    .min(1, 'Address is required')
    .max(400, 'Address must not exceed 400 characters'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters long')
    .max(16, 'Password must not exceed 16 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  role: z.enum(['USER', 'ADMIN', 'STORE_OWNER'], {
    errorMap: () => ({ message: 'Role must be one of: USER, ADMIN, STORE_OWNER' }),
  }),
});

const createStoreSchema = z.object({
  name: z
    .string({ required_error: 'Store name is required' })
    .trim()
    .min(1, 'Store name is required')
    .max(60, 'Store name must not exceed 60 characters'),
  email: z
    .string({ required_error: 'Store email is required' })
    .trim()
    .toLowerCase()
    .email('Invalid email address format'),
  address: z
    .string({ required_error: 'Store address is required' })
    .trim()
    .min(1, 'Store address is required')
    .max(400, 'Store address must not exceed 400 characters'),
  ownerId: z
    .string({ required_error: 'Store owner ID is required' })
    .uuid('Invalid Store Owner ID format'),
});

const userQuerySchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['USER', 'ADMIN', 'STORE_OWNER']).optional(),
  sortBy: z.enum(['name', 'email', 'address', 'role', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

const storeQuerySchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'address', 'rating', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

module.exports = {
  createUserSchema,
  createStoreSchema,
  userQuerySchema,
  storeQuerySchema,
};
