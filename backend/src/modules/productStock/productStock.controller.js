import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { getProductStock, upsertProductStock } from './productStock.service.js';

export const upsertProductStockController = asyncHandler(async (req, res) => {
  const stock = await upsertProductStock({
    productId: req.params.productId,
    sellerId: req.user.id,
    variantId: req.params.variantId || req.body.variantId || null,
    quantity: req.body.quantity,
    stockStatus: req.body.stockStatus,
  });

  return res.status(200).json(new ApiResponse(200, stock, 'Product stock updated successfully'));
});

export const getProductStockController = asyncHandler(async (req, res) => {
  const stock = await getProductStock({
    productId: req.params.productId,
    sellerId: req.user.id,
    variantId: req.params.variantId || null,
  });

  return res.status(200).json(new ApiResponse(200, stock, 'Product stock fetched successfully'));
});
