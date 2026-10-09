import { body, param } from 'express-validator';
import { validate } from '../../config/validate.js';

export const addCartItemValidation = [
  body('productId').isMongoId().withMessage('A valid product ID is required'),
  body('variantId')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('A valid variant ID is required when provided'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  validate,
];

export const updateCartItemValidation = [
  param('itemId').isMongoId().withMessage('A valid cart item ID is required'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  validate,
];

export const cartItemIdValidation = [
  param('itemId').isMongoId().withMessage('A valid cart item ID is required'),
  validate,
];