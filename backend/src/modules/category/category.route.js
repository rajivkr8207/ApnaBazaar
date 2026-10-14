import { Router } from 'express';
import {
  verifyAdmin,
  verifyAdminOrSeller,
  verifyJWT,
  verifySeller,
} from '../../middlewares/auth.middleware.js';
import {
  activateCategoryController,
  createCategoryController,
  deactivateCategoryController,
  deleteCategoryController,
  getPublicCategoriesController,
  updateCategoryController,
} from './category.controller.js';
import {
  categoryIdParamValidation,
  createCategoryValidation,
  updateCategoryValidation,
} from './category.validate.js';

const categoryRouter = Router();
const adminOnly = [verifyJWT, verifyAdmin];
const sellerOnly = [verifyJWT, verifySeller];

categoryRouter.get('/', getPublicCategoriesController);
categoryRouter.post('/', sellerOnly, createCategoryValidation, createCategoryController);
categoryRouter.patch('/:id', sellerOnly, updateCategoryValidation, updateCategoryController);
categoryRouter.delete('/:id', sellerOnly, categoryIdParamValidation, deleteCategoryController);
categoryRouter.patch(
  '/:id/activate',
  sellerOnly,
  categoryIdParamValidation,
  activateCategoryController,
);
categoryRouter.patch(
  '/:id/deactivate',
  adminOnly,
  categoryIdParamValidation,
  deactivateCategoryController,
);

export default categoryRouter;
