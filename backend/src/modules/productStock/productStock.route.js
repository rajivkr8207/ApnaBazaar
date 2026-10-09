import { Router } from 'express';
import { verifyJWT, verifySeller } from '../../middlewares/auth.middleware.js';
import {
  getProductStockController,
  upsertProductStockController,
} from './productStock.controller.js';
import { productStockRequestValidation, upsertProductStockValidation } from './productStock.validate.js';

const productStockRouter = Router();
const sellerOnly = [verifyJWT, verifySeller];

productStockRouter.get('/:productId/stock', sellerOnly, productStockRequestValidation, getProductStockController);
productStockRouter.patch(
  '/:productId/stock',
  sellerOnly,
  upsertProductStockValidation,
  upsertProductStockController,
);
productStockRouter.get(
  '/:productId/variants/:variantId/stock',
  sellerOnly,
  productStockRequestValidation,
  getProductStockController,
);
productStockRouter.patch(
  '/:productId/variants/:variantId/stock',
  sellerOnly,
  upsertProductStockValidation,
  upsertProductStockController,
);

export default productStockRouter;
