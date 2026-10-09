import { body, param } from 'express-validator';
import { validate } from '../../config/validate.js';

export const productStockRequestValidation = [
  param('productId').isMongoId().withMessage('A valid product ID is required'),
  param('variantId').optional().isMongoId().withMessage('A valid variant ID is required when provided'),
  validate,
];

export const upsertProductStockValidation = [
  param('productId').isMongoId().withMessage('A valid product ID is required'),
  param('variantId').optional().isMongoId().withMessage('A valid variant ID is required when provided'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('stockStatus')
    .optional()
    .isIn(['in_stock', 'low_stock', 'out_of_stock'])
    .withMessage('Stock status must be in_stock, low_stock, or out_of_stock'),
  validate,
];
