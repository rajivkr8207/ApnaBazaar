import Product from '../product/product.model.js';
import ProductVariant from '../productVariant/productVariant.model.js';
import ProductStock from './productStock.model.js';
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
  if (!variantId) {
    return { product, variant: null };
  }

  const variant = await ProductVariant.findOne({ _id: variantId, product: product._id });
  if (!variant) {
    throw new ApiError(404, 'Variant not found for this product');
  }

  return { product, variant };
};

export const upsertProductStock = async ({ productId, sellerId, variantId, quantity, stockStatus }) => {
  await ensureVariantBelongsToSellerProduct(productId, variantId, sellerId);

  const safeQuantity = Number(quantity);
  if (!Number.isFinite(safeQuantity) || safeQuantity < 0) {
    throw new ApiError(400, 'Quantity must be a non-negative number');
  }

  const stockDoc = await ProductStock.findOne({ product: productId, variant: variantId || null });

  if (stockDoc) {
    stockDoc.quantity = safeQuantity;
    if (stockStatus) {
      stockDoc.stockStatus = stockStatus;
    }
    await stockDoc.save();
    return stockDoc;
  }

  return ProductStock.create({
    product: productId,
    variant: variantId || null,
    quantity: safeQuantity,
    stockStatus: stockStatus || undefined,
  });
};

export const getProductStock = async ({ productId, sellerId, variantId }) => {
  await ensureVariantBelongsToSellerProduct(productId, variantId || null, sellerId);

  if (variantId) {
    const stock = await ProductStock.findOne({ product: productId, variant: variantId }).populate('variant');
    return stock;
  }

  return ProductStock.find({ product: productId }).populate('variant');
};
