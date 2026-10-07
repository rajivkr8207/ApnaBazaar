import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Config from '../../config/Config.js';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    mobile: {
      type: String,
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid mobile number'],
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['admin', 'seller', 'customer'],
      default: 'customer',
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    googleId: {
      type: String,
      default: null,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpire: {
      type: Date,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id.toString(),
      role: this.role,
      email: this.email,
    },
    Config.jwt_access_secret,
    {
      expiresIn: Config.jwt_access_expires_in,
    },
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id.toString(),
    },
    Config.jwt_refresh_secret,
    {
      expiresIn: Config.jwt_refresh_expires_in,
    },
  );
};

const User = mongoose.model('User', userSchema);

export default User;
