import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
  createProductVariant,
  deleteProductVariant,
  getProductVariantById,
  getProductVariants,
  updateProductVariant,
} from './productVariant.service.js';

export const createProductVariantController = asyncHandler(async (req, res) => {
  const variant = await createProductVariant({
    productId: req.params.productId,
    sellerId: req.user.id,
    sku: req.body.sku,
    attributes: req.body.attributes,
    images: req.body.images,
    price: req.body.price,
    currency: req.body.currency,
    isActive: req.body.isActive,
  });

  return res.status(201).json(new ApiResponse(201, variant, 'Product variant created successfully'));
});

export const getProductVariantsController = asyncHandler(async (req, res) => {
  const variants = await getProductVariants({ productId: req.params.productId, sellerId: req.user.id });
  return res.status(200).json(new ApiResponse(200, variants, 'Product variants fetched successfully'));
});

export const getProductVariantByIdController = asyncHandler(async (req, res) => {
  const variant = await getProductVariantById({
    productId: req.params.productId,
    variantId: req.params.variantId,
    sellerId: req.user.id,
  });

  return res.status(200).json(new ApiResponse(200, variant, 'Product variant fetched successfully'));
});

export const updateProductVariantController = asyncHandler(async (req, res) => {
  const variant = await updateProductVariant({
    productId: req.params.productId,
    variantId: req.params.variantId,
    sellerId: req.user.id,
    payload: req.body,
  });

  return res.status(200).json(new ApiResponse(200, variant, 'Product variant updated successfully'));
});

export const deleteProductVariantController = asyncHandler(async (req, res) => {
  const result = await deleteProductVariant({
    productId: req.params.productId,
    variantId: req.params.variantId,
    sellerId: req.user.id,
  });

  return res.status(200).json(new ApiResponse(200, result, 'Product variant deleted successfully'));
});
