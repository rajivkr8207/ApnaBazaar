import { Router } from 'express';
import { verifyJWT, verifySeller } from '../../middlewares/auth.middleware.js';
import {
  createProductVariantController,
  deleteProductVariantController,
  getProductVariantByIdController,
  getProductVariantsController,
  updateProductVariantController,
} from './productVariant.controller.js';
import {
  createProductVariantValidation,
  productVariantIdParamValidation,
  updateProductVariantValidation,
} from './productVariant.validate.js';

const productVariantRouter = Router();
const sellerOnly = [verifyJWT, verifySeller];

productVariantRouter.get('/:productId/variants', sellerOnly, getProductVariantsController);
productVariantRouter.post(
  '/:productId/variants',
  sellerOnly,
  createProductVariantValidation,
  createProductVariantController,
);
productVariantRouter.get(
  '/:productId/variants/:variantId',
  sellerOnly,
  productVariantIdParamValidation,
  getProductVariantByIdController,
);
productVariantRouter.patch(
  '/:productId/variants/:variantId',
  sellerOnly,
  updateProductVariantValidation,
  updateProductVariantController,
);
productVariantRouter.delete(
  '/:productId/variants/:variantId',
  sellerOnly,
  productVariantIdParamValidation,
  deleteProductVariantController,
);

export default productVariantRouter;
