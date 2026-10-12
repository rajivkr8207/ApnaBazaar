import { body, param } from 'express-validator';
import { validate } from '../../config/validate.js';

export const addressIdValidation = [
  param('id').isMongoId().withMessage('A valid address ID is required'),
  validate,
];

export const createAddressValidation = [
  body('fullName')
    .isString()
    .withMessage('Full name must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ max: 100 })
    .withMessage('Full name cannot exceed 100 characters'),

  body('mobile')
    .isString()
    .withMessage('Mobile number must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Mobile number is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit Indian mobile number'),

  body('alternateMobile')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('Alternate mobile must be a string')
    .bail()
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit Indian alternate mobile number'),

  body('addressType')
    .optional()
    .isIn(['home', 'office', 'other'])
    .withMessage('Address type must be home, office, or other'),

  body('houseNo')
    .optional()
    .isString()
    .withMessage('House number must be a string')
    .bail()
    .trim()
    .isLength({ max: 50 })
    .withMessage('House number cannot exceed 50 characters'),

  body('street')
    .isString()
    .withMessage('Street address must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Street address is required')
    .isLength({ max: 255 })
    .withMessage('Street cannot exceed 255 characters'),

  body('landmark')
    .optional()
    .isString()
    .withMessage('Landmark must be a string')
    .bail()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Landmark cannot exceed 100 characters'),

  body('city')
    .isString()
    .withMessage('City must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters'),

  body('state')
    .isString()
    .withMessage('State must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .isLength({ max: 100 })
    .withMessage('State cannot exceed 100 characters'),

  body('country')
    .optional()
    .isString()
    .withMessage('Country must be a string')
    .bail()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country cannot exceed 100 characters'),

  body('pincode')
    .isString()
    .withMessage('PIN code must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('PIN code is required')
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage('Invalid Indian PIN code (must be 6 digits and cannot start with 0)'),

  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean')
    .toBoolean(),

  validate,
];

export const updateAddressValidation = [
  param('id').isMongoId().withMessage('A valid address ID is required'),

  body('fullName')
    .optional()
    .isString()
    .withMessage('Full name must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Full name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Full name cannot exceed 100 characters'),

  body('mobile')
    .optional()
    .isString()
    .withMessage('Mobile number must be a string')
    .bail()
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit Indian mobile number'),

  body('alternateMobile')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('Alternate mobile must be a string')
    .bail()
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit Indian alternate mobile number'),

  body('addressType')
    .optional()
    .isIn(['home', 'office', 'other'])
    .withMessage('Address type must be home, office, or other'),

  body('houseNo')
    .optional()
    .isString()
    .withMessage('House number must be a string')
    .bail()
    .trim()
    .isLength({ max: 50 })
    .withMessage('House number cannot exceed 50 characters'),

  body('street')
    .optional()
    .isString()
    .withMessage('Street address must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Street address cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Street cannot exceed 255 characters'),

  body('landmark')
    .optional()
    .isString()
    .withMessage('Landmark must be a string')
    .bail()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Landmark cannot exceed 100 characters'),

  body('city')
    .optional()
    .isString()
    .withMessage('City must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('City cannot be empty')
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters'),

  body('state')
    .optional()
    .isString()
    .withMessage('State must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('State cannot be empty')
    .isLength({ max: 100 })
    .withMessage('State cannot exceed 100 characters'),

  body('country')
    .optional()
    .isString()
    .withMessage('Country must be a string')
    .bail()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country cannot exceed 100 characters'),

  body('pincode')
    .optional()
    .isString()
    .withMessage('PIN code must be a string')
    .bail()
    .trim()
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage('Invalid Indian PIN code (must be 6 digits and cannot start with 0)'),

  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean')
    .toBoolean(),

  validate,
];
