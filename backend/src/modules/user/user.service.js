import User from './user.model.js';
import { ApiError } from '../../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import Config from '../../config/Config.js';
import { MailService } from '../../services/mail.service.js';

export const registerUser = async ({
  fullName,
  username,
  email,
  password,
  mobile,
  image,
  role,
}) => {
  const existingUser = await User.findOne({ $or: [{ email }, { username }, { mobile }] });
  if (existingUser) {
    return new ApiError(409, 'User with this email, username, or mobile already exists');
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpire = new Date(Date.now() + 10 * 60 * 1000);
  const user = await User.create({ fullName, username, email, password, mobile, image, role, otp, otpExpire });
  const mail =  await new MailService().SendRegisterMail(email, otp, fullName);
  if (!mail) {
    throw new ApiError(500, 'Failed to send verification email');
  }
  return user;
};

export const loginUser = async ({ identifier, password }) => {
  const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }, { mobile: identifier }] }).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  if (!user.isVerified) {
    throw new ApiError(403, 'Account is not verified. Please verify your email.');
  }
  if (!user.isActive) {
    throw new ApiError(403, 'Account is not active. Please contact support.');
  }
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid password');
  }
  user.lastLoginAt = new Date();
  await user.save();
  user.password = undefined;
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  return { user, accessToken, refreshToken };
};

export const logoutUser = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return;
};

export const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token is required');
  }

  const decoded = jwt.verify(incomingRefreshToken, Config.jwt_refresh_secret);
  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(404, 'User not found');
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  return { accessToken, refreshToken };
};

export const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

export const editUserProfile = async (id, { fullName, username }) => {
  const user = await User.findByIdAndUpdate(
    id,
    { fullName, username },
    { new: true, runValidators: true },
  );
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

export const changeUserPassword = async (id, { oldPassword, newPassword }) => {
  const user = await User.findById(id).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  const isOldPasswordValid = await user.comparePassword(oldPassword);
  if (!isOldPasswordValid) throw new ApiError(401, 'Old password is incorrect');

  user.password = newPassword; // pre-save hook hashes it
  await user.save();
  return { message: 'Password changed successfully' };
};

export const verifyUserByOTP = async (email, otp) => {
  const user = await User.findOne({ email, otp });
  if (!user) throw new ApiError(404, 'Invalid OTP');
  user.isVerified = true;
  await user.save();
  return user;
};

export const resendUserOtp = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'User not found');
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpire = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  const mail = await new MailService().SendAgainRegisterMail(email, otp, user.fullName);
  if (!mail) {
    throw new ApiError(500, 'Failed to send verification email');
  }
  return user;
};
