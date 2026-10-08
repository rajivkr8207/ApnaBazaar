import { body, param } from 'express-validator';
import { validate } from '../../config/validate.js';

const productIdValidation = [
  param('id').isMongoId().withMessage('A valid product ID is required'),
  validate,
];

export const createProductValidation = [
  body('name')
    .isString()
    .withMessage('Product name is required')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 150 })
    .withMessage('Product name cannot exceed 150 characters'),

  body('category').isMongoId().withMessage('A valid category ID is required'),

  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),

  body('slug')
    .optional()
    .isString()
    .withMessage('Product slug must be a string')
    .bail()
    .trim()
    .toLowerCase()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Product slug must contain only lowercase letters, numbers, and hyphens'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .bail()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),

  body('images')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Images must be an array with up to 10 items')
    .bail()
    .custom((images) => images.every((image) => typeof image === 'string'))
    .withMessage('Each image must be a string URL or path'),

  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),

  validate,
];

export const updateProductValidation = [
  param('id').isMongoId().withMessage('A valid product ID is required'),

  body('name')
    .optional()
    .isString()
    .withMessage('Product name must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ max: 150 })
    .withMessage('Product name cannot exceed 150 characters'),

  body('category').optional().isMongoId().withMessage('A valid category ID is required'),

  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),

  body('slug')
    .optional()
    .isString()
    .withMessage('Product slug must be a string')
    .bail()
    .trim()
    .toLowerCase()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Product slug must contain only lowercase letters, numbers, and hyphens'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .bail()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),

  body('images')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Images must be an array with up to 10 items')
    .bail()
    .custom((images) => images.every((image) => typeof image === 'string'))
    .withMessage('Each image must be a string URL or path'),

  body().custom((_, { req }) => {
    const allowedFields = ['name', 'category', 'price', 'slug', 'description', 'images'];
    if (
      !req.body ||
      !allowedFields.some((field) => Object.prototype.hasOwnProperty.call(req.body, field))
    ) {
      throw new Error('At least one valid product field must be provided');
    }
    return true;
  }),

  validate,
];

export const productIdParamValidation = productIdValidation;
