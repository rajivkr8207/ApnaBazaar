import { body, param } from 'express-validator';
import { validate } from '../../config/validate.js';

const productVariantIdValidation = [
  param('productId').isMongoId().withMessage('A valid product ID is required'),
  param('variantId').isMongoId().withMessage('A valid variant ID is required'),
  validate,
];

export const createProductVariantValidation = [
  param('productId').isMongoId().withMessage('A valid product ID is required'),
  body('sku')
    .notEmpty()
    .withMessage('Variant SKU is required')
    .isString()
    .withMessage('Variant SKU must be a string')
    .bail()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Variant SKU must be between 3 and 50 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Variant price must be a non-negative number'),
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'JPY', 'INR'])
    .withMessage('Currency must be one of USD, EUR, GBP, JPY, INR'),
  body('attributes').optional().isObject().withMessage('Attributes must be an object'),
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

export const updateProductVariantValidation = [
  ...productVariantIdValidation,
  body('sku')
    .optional()
    .isString()
    .withMessage('Variant SKU must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Variant SKU cannot be empty')
    .isLength({ min: 3, max: 50 })
    .withMessage('Variant SKU must be between 3 and 50 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Variant price must be a non-negative number'),
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'JPY', 'INR'])
    .withMessage('Currency must be one of USD, EUR, GBP, JPY, INR'),
  body('attributes').optional().isObject().withMessage('Attributes must be an object'),
  body('images')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Images must be an array with up to 10 items')
    .bail()
    .custom((images) => images.every((image) => typeof image === 'string'))
    .withMessage('Each image must be a string URL or path'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body().custom((_, { req }) => {
    const allowedFields = ['sku', 'attributes', 'images', 'price', 'currency', 'isActive'];
    if (!req.body || !allowedFields.some((field) => Object.prototype.hasOwnProperty.call(req.body, field))) {
      throw new Error('At least one valid variant field must be provided');
    }
    return true;
  }),
  validate,
];

export const productVariantIdParamValidation = productVariantIdValidation;
