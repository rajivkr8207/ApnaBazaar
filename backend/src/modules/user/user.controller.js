import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getUserById,
  editUserProfile,
  changeUserPassword,
  verifyUserByOTP,
  resendUserOtp,
} from './user.service.js';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// ─────────────────────────────────────────────
// POST /api/v1/users/register
// ─────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const { fullName, username, email, password, mobile } = req.body;
  const image = req.file ? req.file.path : null;
  const user = await registerUser({
    fullName,
    username,
    email,
    password,
    mobile,
    image,
    role: 'customer',
  });
  return res.status(201).json(new ApiResponse(201, { user }, 'User registered successfully'));
});

export const VerifyUserByOTPController = asyncHandler(async (req, res) => {
  const { email } = req.query;
  const { otp } = req.body;
  const user = await verifyUserByOTP(email, otp);
  return res.status(200).json(new ApiResponse(200, { user }, 'User verified successfully'));
});

export const ResendUserOtpController = asyncHandler(async (req, res) => {
  const { email } = req.query;
  const user = await resendUserOtp(email);
  return res.status(200).json(new ApiResponse(200, { user }, 'OTP resent successfully'));
});
// ─────────────────────────────────────────────
// POST /api/v1/users/login
// ─────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const { user, accessToken, refreshToken } = await loginUser({ identifier, password });
  return res
    .status(200)
    .cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000, // 1 hour
    })
    .cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .json(new ApiResponse(200, { user, accessToken, refreshToken }, 'Login successful'));
});

// ─────────────────────────────────────────────
// POST /api/v1/users/logout  [Protected]
// ─────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  await logoutUser(req.user.id);
  return res
    .clearCookie('accessToken')
    .clearCookie('refreshToken')
    .status(200)
    .json(new ApiResponse(200, {}, 'Logged out successfully'));
});

// ─────────────────────────────────────────────
// POST /api/v1/users/refresh-token
// ─────────────────────────────────────────────
export const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  const { accessToken, refreshToken: newRefreshToken } =
    await refreshAccessToken(incomingRefreshToken);
  console.log(newRefreshToken, accessToken);
  return res
    .status(200)
    .cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000,
    })
    .cookie('refreshToken', newRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken: newRefreshToken },
        'Access token refreshed',
      ),
    );
});

// ─────────────────────────────────────────────
// GET /api/v1/users/profile  [Protected]
// ─────────────────────────────────────────────
export const getProfile = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.id);
  return res.status(200).json(new ApiResponse(200, user, 'Profile fetched successfully'));
});

// ─────────────────────────────────────────────
// PATCH /api/v1/users/profile  [Protected]
// ─────────────────────────────────────────────
export const editProfile = asyncHandler(async (req, res) => {
  const { fullName, username } = req.body;

  const user = await editUserProfile(req.user.id, { fullName, username });

  return res.status(200).json(new ApiResponse(200, user, 'Profile updated successfully'));
});

// ─────────────────────────────────────────────
// PATCH /api/v1/users/change-password  [Protected]
// ─────────────────────────────────────────────
export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const result = await changeUserPassword(req.user.id, { oldPassword, newPassword });

  return res.status(200).json(new ApiResponse(200, result, 'Password changed successfully'));
});
