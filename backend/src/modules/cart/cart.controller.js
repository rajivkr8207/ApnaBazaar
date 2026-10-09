import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  addItemToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItemQuantity,
} from './cart.service.js';

export const getCartController = asyncHandler(async (req, res) => {
  const cart = await getCart(req.user.id);
  return res.status(200).json(new ApiResponse(200, cart, 'Cart fetched successfully'));
});

export const addItemToCartController = asyncHandler(async (req, res) => {
  const cart = await addItemToCart(req.user.id, req.body);
  return res.status(200).json(new ApiResponse(200, cart, 'Item added to cart successfully'));
});

export const updateCartItemQuantityController = asyncHandler(async (req, res) => {
  const cart = await updateCartItemQuantity(req.user.id, req.params.itemId, req.body.quantity);
  return res.status(200).json(new ApiResponse(200, cart, 'Cart item quantity updated successfully'));
});

export const removeCartItemController = asyncHandler(async (req, res) => {
  const cart = await removeCartItem(req.user.id, req.params.itemId);
  return res.status(200).json(new ApiResponse(200, cart, 'Item removed from cart successfully'));
});

export const clearCartController = asyncHandler(async (req, res) => {
  const cart = await clearCart(req.user.id);
  return res.status(200).json(new ApiResponse(200, cart, 'Cart cleared successfully'));
});