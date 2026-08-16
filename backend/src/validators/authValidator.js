const { z } = require('zod');

const nameSchema = z
  .string({ required_error: 'Name is required' })
  .trim()
  .min(20, 'Name must be at least 20 characters long')
  .max(60, 'Name must not exceed 60 characters');

const addressSchema = z
  .string({ required_error: 'Address is required' })
  .trim()
  .min(1, 'Address is required')
  .max(400, 'Address must not exceed 400 characters');

const emailSchema = z
  .string({ required_error: 'Email is required' })
  .trim()
  .toLowerCase()
  .email('Invalid email address format');

const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters long')
  .max(16, 'Password must not exceed 16 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  password: passwordSchema,
  role: z.enum(['USER', 'STORE_OWNER'], {
    invalid_type_error: 'Invalid registration role. Must be USER or STORE_OWNER.',
  }).optional().default('USER'),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

const changePasswordSchema = z
  .object({
    oldPassword: z.string({ required_error: 'Current password is required' }).min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string({ required_error: 'Confirm password is required' }).min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New password and confirm password do not match',
    path: ['confirmPassword'],
  });

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
};
