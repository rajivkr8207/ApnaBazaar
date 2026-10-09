import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';
import Product from '../product/product.model.js';
import ProductStock from '../productStock/productStock.model.js';
import ProductVariant from '../productVariant/productVariant.model.js';
import Cart from './cart.model.js';

const findOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    try {
      cart = await Cart.create({ user: userId, items: [] });
    } catch (error) {
      if (error.code !== 11000) {
        throw error;
      }
      cart = await Cart.findOne({ user: userId });
    }
  }

  return cart;
};

const getAvailableItem = async (productId, variantId) => {
  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, 'A valid product ID is required');
  }

  const product = await Product.findOne({
    _id: productId,
    isActive: true,
    status: 'published',
  });
  if (!product) {
    throw new ApiError(404, 'Product not found or unavailable');
  }

  let variant = null;
  if (variantId) {
    if (!mongoose.isValidObjectId(variantId)) {
      throw new ApiError(400, 'A valid variant ID is required');
    }

    variant = await ProductVariant.findOne({
      _id: variantId,
      product: product._id,
      isActive: true,
    });
    if (!variant) {
      throw new ApiError(404, 'Product variant not found or unavailable');
    }
  }

  const stock = await ProductStock.findOne({
    product: product._id,
    variant: variant ? variant._id : null,
  });
  const availableQuantity = stock ? stock.quantity - (stock.reservedQuantity || 0) : 0;
  if (availableQuantity < 1) {
    throw new ApiError(409, 'Product is out of stock');
  }

  return { product, variant, stock, availableQuantity };
};

const createPriceSnapshot = (product, variant) => ({
  amount: variant && variant.price > 0 ? variant.price : product.price,
  currency: variant && variant.price > 0 ? variant.currency : product.currency,
});

const populateCart = (cart) =>
  cart.populate([
    {
      path: 'items.product',
      select: 'name slug images price currency seller category isActive',
      populate: [
        { path: 'seller', select: 'fullName username avatar' },
        { path: 'category', select: 'name slug' },
      ],
    },
    {
      path: 'items.variant',
      select: 'sku attributes images price currency isActive',
    },
  ]);

export const getCart = async (userId) => populateCart(await findOrCreateCart(userId));

export const addItemToCart = async (userId, { productId, variantId, quantity = 1 }) => {
  const safeQuantity = Number(quantity);
  if (!Number.isInteger(safeQuantity) || safeQuantity < 1) {
    throw new ApiError(400, 'Quantity must be a positive integer');
  }

  const { product, variant, availableQuantity } = await getAvailableItem(productId, variantId);
  const cart = await findOrCreateCart(userId);
  const existingItem = cart.items.find(
    (item) =>
      item.product.toString() === product._id.toString() &&
      (item.variant ? item.variant.toString() : null) === (variant ? variant._id.toString() : null),
  );
  const updatedQuantity = (existingItem?.quantity || 0) + safeQuantity;

  if (updatedQuantity > availableQuantity) {
    throw new ApiError(409, `Only ${availableQuantity} item(s) are available`);
  }

  if (existingItem) {
    existingItem.quantity = updatedQuantity;
    existingItem.price = createPriceSnapshot(product, variant);
  } else {
    cart.items.push({
      product: product._id,
      variant: variant ? variant._id : null,
      quantity: safeQuantity,
      price: createPriceSnapshot(product, variant),
    });
  }

  await cart.save();
  return populateCart(cart);
};

export const updateCartItemQuantity = async (userId, itemId, quantity) => {
  if (!mongoose.isValidObjectId(itemId)) {
    throw new ApiError(400, 'A valid cart item ID is required');
  }

  const safeQuantity = Number(quantity);
  if (!Number.isInteger(safeQuantity) || safeQuantity < 1) {
    throw new ApiError(400, 'Quantity must be a positive integer');
  }

  const cart = await Cart.findOne({ user: userId });
  const item = cart?.items.id(itemId);
  if (!cart || !item) {
    throw new ApiError(404, 'Cart item not found');
  }

  const { product, variant, availableQuantity } = await getAvailableItem(
    item.product,
    item.variant,
  );
  if (safeQuantity > availableQuantity) {
    throw new ApiError(409, `Only ${availableQuantity} item(s) are available`);
  }

  item.quantity = safeQuantity;
  item.price = createPriceSnapshot(product, variant);
  await cart.save();
  return populateCart(cart);
};

export const removeCartItem = async (userId, itemId) => {
  if (!mongoose.isValidObjectId(itemId)) {
    throw new ApiError(400, 'A valid cart item ID is required');
  }

  const cart = await Cart.findOne({ user: userId });
  const item = cart?.items.id(itemId);
  if (!cart || !item) {
    throw new ApiError(404, 'Cart item not found');
  }

  item.deleteOne();
  await cart.save();
  return populateCart(cart);
};

export const clearCart = async (userId) => {
  const cart = await findOrCreateCart(userId);
  cart.items = [];
  await cart.save();
  return cart;
};
