import { Router } from 'express';
import { verifyJWT, verifySeller } from '../../middlewares/auth.middleware.js';
import {
  activateProductController,
  createProductController,
  deactivateProductController,
  deleteProductController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
} from './product.controller.js';
import {
  createProductValidation,
  productIdParamValidation,
  updateProductValidation,
} from './product.validate.js';

const productRouter = Router();
const sellerOnly = [verifyJWT, verifySeller];

productRouter.post('/', sellerOnly, createProductValidation, createProductController);
productRouter.get('/', sellerOnly, getAllProductsController);
productRouter.get('/:id', sellerOnly, productIdParamValidation, getProductByIdController);
productRouter.patch('/:id', sellerOnly, productIdParamValidation, updateProductValidation, updateProductController);
productRouter.patch('/:id/activate', sellerOnly, productIdParamValidation, activateProductController);
productRouter.patch('/:id/deactivate', sellerOnly, productIdParamValidation, deactivateProductController);
productRouter.delete('/:id', sellerOnly, productIdParamValidation, deleteProductController);

export default productRouter;
