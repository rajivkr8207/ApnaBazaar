import Product from '../product/product.model.js';
import ProductVariant from './productVariant.model.js';
import { ApiError } from '../../utils/ApiError.js';

const ensureSellerOwnsProduct = async (productId, sellerId) => {
  const product = await Product.findOne({ _id: productId, seller: sellerId });
  if (!product) {
    throw new ApiError(404, 'Product not found or you do not own this product');
  }

  return product;
};

const ensureVariantBelongsToSellerProduct = async (productId, variantId, sellerId) => {
  const product = await ensureSellerOwnsProduct(productId, sellerId);
  const variant = await ProductVariant.findOne({ _id: variantId, product: product._id });

  if (!variant) {
    throw new ApiError(404, 'Variant not found for this product');
  }

  return { product, variant };
};

export const createProductVariant = async ({ productId, sellerId, sku, attributes, images, price, currency, isActive }) => {
  await ensureSellerOwnsProduct(productId, sellerId);

  const normalizedSku = String(sku || '').trim();
  if (!normalizedSku) {
    throw new ApiError(400, 'Variant SKU is required');
  }

  const safeSku = normalizedSku.toUpperCase();
  const existingVariant = await ProductVariant.findOne({ product: productId, sku: safeSku });
  if (existingVariant) {
    throw new ApiError(409, 'A variant with this SKU already exists for this product');
  }

  const variant = await ProductVariant.create({
    product: productId,
    sku: safeSku,
    attributes: attributes || {},
    images: Array.isArray(images) ? images : [],
    price: Number(price ?? 0),
    currency: currency || 'INR',
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  });

  return variant;
};

export const getProductVariants = async ({ productId, sellerId }) => {
  await ensureSellerOwnsProduct(productId, sellerId);

  return ProductVariant.find({ product: productId }).sort({ createdAt: -1 });
};

export const getProductVariantById = async ({ productId, variantId, sellerId }) => {
  const { variant } = await ensureVariantBelongsToSellerProduct(productId, variantId, sellerId);
  return variant;
};

export const updateProductVariant = async ({ productId, variantId, sellerId, payload }) => {
  const { product, variant } = await ensureVariantBelongsToSellerProduct(productId, variantId, sellerId);

  const { sku, attributes, images, price, currency, isActive } = payload;

  if (sku !== undefined) {
    const normalizedSku = String(sku).trim();
    if (!normalizedSku) {
      throw new ApiError(400, 'Variant SKU is required');
    }

    const nextSku = normalizedSku.toUpperCase();
    const existingVariant = await ProductVariant.findOne({ product: product._id, sku: nextSku, _id: { $ne: variant._id } });
    if (existingVariant) {
      throw new ApiError(409, 'A variant with this SKU already exists for this product');
    }

    variant.sku = nextSku;
  }

  if (attributes !== undefined) {
    variant.attributes = attributes || {};
  }

  if (images !== undefined) {
    variant.images = Array.isArray(images) ? images : [];
  }

  if (price !== undefined) {
    variant.price = Number(price);
  }

  if (currency !== undefined) {
    variant.currency = currency;
  }

  if (isActive !== undefined) {
    variant.isActive = Boolean(isActive);
  }

  await variant.save();
  return variant;
};

export const deleteProductVariant = async ({ productId, variantId, sellerId }) => {
  const { variant } = await ensureVariantBelongsToSellerProduct(productId, variantId, sellerId);

  await variant.deleteOne();
  return { deleted: true, id: variantId };
};
