import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Config from '../config/Config.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    throw new ApiError(401, 'Unauthorized request');
  }
  try {
    const decodedToken = jwt.verify(token, Config.jwt_access_secret);
    req.user = decodedToken;
    next();
  } catch (error) {
    throw new ApiError(401, 'Invalid token', error);
  }
});

export const verifyAdmin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    throw new ApiError(403, 'Forbidden: Admin access required');
  }
});

export const verifyCashier = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'cashier') {
    next();
  } else {
    throw new ApiError(403, 'Forbidden: cashier access required');
  }
});

export const verifyStock_manager = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'stock_manager') {
    next();
  } else {
    throw new ApiError(403, 'Forbidden: Stock Manager access required');
  }
});

export const verifyInventoryManager = asyncHandler(async (req, res, next) => {
  if (req.user && ['admin', 'stock_manager'].includes(req.user.role)) {
    next();
  } else {
    throw new ApiError(403, 'Forbidden: inventory access required');
  }
});

export const verifyStoreUser = asyncHandler(async (req, res, next) => {
  if (req.user && ['admin', 'stock_manager', 'cashier'].includes(req.user.role)) {
    next();
  } else {
    throw new ApiError(403, 'Forbidden: store account required');
  }
});
