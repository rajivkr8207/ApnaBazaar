import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  activateCategory,
  createCategory,
  deactivateCategory,
  deleteCategory,
  getPublicCategories,
  updateCategory,
} from './category.service.js';

export const createCategoryController = asyncHandler(async (req, res) => {
  const category = await createCategory(req.body);
  return res.status(201).json(new ApiResponse(201, category, 'Category created successfully'));
});

export const updateCategoryController = asyncHandler(async (req, res) => {
  const category = await updateCategory(req.params.id, req.body);
  return res.status(200).json(new ApiResponse(200, category, 'Category updated successfully'));
});

export const deleteCategoryController = asyncHandler(async (req, res) => {
  const category = await deleteCategory(req.params.id);
  return res.status(200).json(new ApiResponse(200, category, 'Category deleted successfully'));
});

export const activateCategoryController = asyncHandler(async (req, res) => {
  const category = await activateCategory(req.params.id);
  return res.status(200).json(new ApiResponse(200, category, 'Category activated successfully'));
});

export const deactivateCategoryController = asyncHandler(async (req, res) => {
  const category = await deactivateCategory(req.params.id);
  return res.status(200).json(new ApiResponse(200, category, 'Category deactivated successfully'));
});

export const getPublicCategoriesController = asyncHandler(async (req, res) => {
  const categories = await getPublicCategories();
  return res.status(200).json(new ApiResponse(200, categories, 'Categories fetched successfully'));
});
