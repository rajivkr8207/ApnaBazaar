import { body, param } from 'express-validator';
import { validate } from '../../config/validate.js';

const categoryIdValidation = [
  param('id').isMongoId().withMessage('A valid category ID is required'),
  validate,
];

const categoryNameValidation = body('name')
  .optional()
  .isString()
  .withMessage('Category name must be a string')
  .bail()
  .trim()
  .notEmpty()
  .withMessage('Category name cannot be empty')
  .isLength({ max: 100 })
  .withMessage('Category name cannot exceed 100 characters');

const categoryMetadataValidation = [
  body('slug')
    .optional()
    .isString()
    .withMessage('Category slug must be a string')
    .bail()
    .trim()
    .toLowerCase()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Category slug must contain only lowercase letters, numbers, and hyphens'),

  body('description')
    .optional()
    .isString()
    .withMessage('Category description must be a string')
    .bail()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Category description cannot exceed 500 characters'),

  body('image')
    .optional({ nullable: true })
    .isString()
    .withMessage('Category image must be a string')
    .bail()
    .isLength({ max: 2048 })
    .withMessage('Category image cannot exceed 2048 characters'),
];

export const createCategoryValidation = [
  body('name')
    .isString()
    .withMessage('Category name is required')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ max: 100 })
    .withMessage('Category name cannot exceed 100 characters'),
  ...categoryMetadataValidation,
  validate,
];

export const updateCategoryValidation = [
  param('id').isMongoId().withMessage('A valid category ID is required'),
  categoryNameValidation,
  ...categoryMetadataValidation,
  body().custom((_, { req }) => {
    const allowedFields = ['name', 'slug', 'description', 'image'];
    if (
      !req.body ||
      !allowedFields.some((field) => Object.prototype.hasOwnProperty.call(req.body, field))
    ) {
      throw new Error('At least one category field must be provided');
    }
    return true;
  }),
  validate,
];

export const categoryIdParamValidation = categoryIdValidation;
