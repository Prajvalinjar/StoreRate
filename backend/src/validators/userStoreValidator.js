const { z } = require('zod');

const ratingBodySchema = z.object({
  rating: z
    .number({
      required_error: 'Rating is required',
      invalid_type_error: 'Rating must be a valid number',
    })
    .int('Rating must be an integer (decimals are not allowed)')
    .min(1, 'Rating must be an integer between 1 and 5')
    .max(5, 'Rating must be an integer between 1 and 5'),
  review: z
    .string()
    .max(500, 'Review text cannot exceed 500 characters')
    .transform((val) => {
      if (!val) return null;
      const trimmed = val.trim();
      return trimmed.length > 0 ? trimmed : null;
    })
    .optional()
    .nullable(),
});

const storeIdParamSchema = z.object({
  storeId: z.string({ required_error: 'Store ID is required' }).uuid('Invalid Store ID format'),
});

const userStoreQuerySchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  q: z.string().optional(),
});

module.exports = {
  ratingBodySchema,
  storeIdParamSchema,
  userStoreQuerySchema,
};
