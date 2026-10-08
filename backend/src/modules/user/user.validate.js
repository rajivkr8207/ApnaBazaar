import { body } from 'express-validator';
import { validate } from '../../config/validate.js';

// ─────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────
export const registerValidation = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 60 })
    .withMessage('Full name must be between 2 and 60 characters'),

  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .isAlphanumeric()
    .withMessage('Username can only contain letters and numbers')
    .toLowerCase(),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  // .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
  body('mobile')
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid mobile number'),
  validate,
];

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
export const loginValidation = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Email, username, or mobile is required')
    .withMessage('Please provide a valid email'),

  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

// ─────────────────────────────────────────────
// EDIT PROFILE
// ─────────────────────────────────────────────
export const editProfileValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Full name must be between 2 and 60 characters'),

  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .isAlphanumeric()
    .withMessage('Username can only contain letters and numbers')
    .toLowerCase(),
  validate,
];

// ─────────────────────────────────────────────
// CHANGE PASSWORD
// ─────────────────────────────────────────────
export const changePasswordValidation = [
  body('oldPassword').notEmpty().withMessage('Old password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/\d/)
    .withMessage('New password must contain at least one number'),
  validate,
];
