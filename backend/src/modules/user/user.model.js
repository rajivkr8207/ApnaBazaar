import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Config from '../../config/Config.js';

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const normalizeUsername = (value) => String(value || '').trim().toLowerCase();

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      match: [/^[a-z0-9]+$/, 'Username can only contain lowercase letters and numbers'],
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },

    password: {
      type: String,
      required: function requiredPassword() {
        return this.provider === 'local';
      },
      minlength: 6,
      select: false,
      default: null,
    },

    mobile: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: null,
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
      index: true,
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
      index: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: null,
    },
    otp: {
      type: String,
      select: false,
      default: null,
    },
    otpExpire: {
      type: Date,
      select: false,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    refreshTokenHash: {
      type: String,
      select: false,
      default: null,
    },
    refreshTokenVersion: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('validate', function (next) {
  if (this.email) {
    this.email = normalizeEmail(this.email);
  }

  if (this.username) {
    this.username = normalizeUsername(this.username);
  }

  if (this.provider === 'google' && !this.password) {
    this.password = undefined;
  }

  next();
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function comparePassword(password) {
  if (!password || !this.password) {
    return false;
  }

  return bcrypt.compare(password, this.password);
};

userSchema.methods.hashToken = function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
};

userSchema.methods.setRefreshTokenHash = function setRefreshTokenHash(token) {
  if (!token) {
    return null;
  }

  this.refreshTokenHash = this.hashToken(token);
  this.refreshTokenVersion = (this.refreshTokenVersion || 0) + 1;
  return this.refreshTokenHash;
};

userSchema.methods.compareRefreshToken = function compareRefreshToken(token) {
  if (!token || !this.refreshTokenHash) {
    return false;
  }

  const incomingHash = this.hashToken(token);
  const storedHash = Buffer.from(this.refreshTokenHash, 'hex');
  const incomingHashBuffer = Buffer.from(incomingHash, 'hex');

  if (storedHash.length !== incomingHashBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(storedHash, incomingHashBuffer);
};

userSchema.methods.generateAccessToken = function generateAccessToken() {
  return jwt.sign(
    {
      id: this._id.toString(),
      role: this.role,
      email: this.email,
      provider: this.provider,
    },
    Config.jwt_access_secret,
    {
      expiresIn: Config.jwt_access_expires_in,
    },
  );
};

userSchema.methods.generateRefreshToken = function generateRefreshToken() {
  return jwt.sign(
    {
      id: this._id.toString(),
      version: this.refreshTokenVersion || 0,
      provider: this.provider,
    },
    Config.jwt_refresh_secret,
    {
      expiresIn: Config.jwt_refresh_expires_in,
    },
  );
};

userSchema.methods.toJSON = function toJSON() {
  const userObject = this.toObject();

  delete userObject.password;
  delete userObject.otp;
  delete userObject.otpExpire;
  delete userObject.refreshTokenHash;
  delete userObject.googleId;
  delete userObject.__v;

  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User;
