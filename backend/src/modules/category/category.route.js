import { Router } from 'express';
import { verifyAdmin, verifyJWT } from '../../middlewares/auth.middleware.js';
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

categoryRouter.get('/', getPublicCategoriesController);
categoryRouter.post('/', adminOnly, createCategoryValidation, createCategoryController);
categoryRouter.patch('/:id', adminOnly, updateCategoryValidation, updateCategoryController);
categoryRouter.delete('/:id', adminOnly, categoryIdParamValidation, deleteCategoryController);
categoryRouter.patch(
  '/:id/activate',
  adminOnly,
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
