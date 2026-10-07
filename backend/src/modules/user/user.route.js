import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  editProfile,
  changePassword,
  VerifyUserByOTPController,
  ResendUserOtpController,
} from './user.controller.js';
import { verifyAdmin, verifyJWT } from '../../middlewares/auth.middleware.js';
import {
  registerValidation,
  loginValidation,
  editProfileValidation,
  changePasswordValidation,
} from './user.validate.js';

const authRouter = Router();

// ─────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────

/**
 * @route   POST /api/v1/users/register
 * @desc    Register a new user
 * @access  Public
 */
authRouter.post('/register', registerValidation, register);

/**
 * @route   POST /api/v1/users/verify-email
 * @desc    Verify user email using OTP
 * @access  Protected
 */
authRouter.post('/verify-email',  VerifyUserByOTPController);


authRouter.post('/resend-otp', verifyJWT, ResendUserOtpController);
/**
 * @route   POST /api/v1/users/login
 * @desc    Login user and receive tokens
 * @access  Public
 */
authRouter.post('/login', loginValidation, login);

/**
 * @route   POST /api/v1/users/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
authRouter.post('/refresh-token', refreshToken);

// ─────────────────────────────────────────────
// PROTECTED ROUTES  (requires valid JWT)
// ─────────────────────────────────────────────

/**
 * @route   POST /api/v1/users/logout
 * @desc    Logout current user and clear cookies
 * @access  Protected
 */
authRouter.post('/logout', verifyJWT, logout);

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get current logged-in user profile
 * @access  Protected
 */
authRouter.get('/profile', verifyJWT, getProfile);

/**
 * @route   PATCH /api/v1/users/profile
 * @desc    Edit current user's profile (fullName, username)
 * @access  Protected
 */
authRouter.patch('/profile', verifyJWT, editProfileValidation, editProfile);

/**
 * @route   PATCH /api/v1/users/change-password
 * @desc    Change current user's password
 * @access  Protected
 */
authRouter.patch('/change-password', verifyJWT, changePasswordValidation, changePassword);

export default authRouter;
