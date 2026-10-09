import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getCatalogProducts,
  getProductById,
  setProductActiveStatus,
  updateProduct,
} from './product.service.js';

export const createProductController = asyncHandler(async (req, res) => {
  const product = await createProduct(req.body, req.user.id);

  return res.status(201).json(new ApiResponse(201, product, 'Product created successfully'));
});

export const updateProductController = asyncHandler(async (req, res) => {
  const product = await updateProduct(req.params.id, req.user.id, req.body);

  return res.status(200).json(new ApiResponse(200, product, 'Product updated successfully'));
});

export const deleteProductController = asyncHandler(async (req, res) => {
  const product = await deleteProduct(req.params.id, req.user.id);

  return res.status(200).json(new ApiResponse(200, product, 'Product deleted successfully'));
});

export const activateProductController = asyncHandler(async (req, res) => {
  const product = await setProductActiveStatus(req.params.id, req.user.id, true);

  return res.status(200).json(new ApiResponse(200, product, 'Product activated successfully'));
});

export const deactivateProductController = asyncHandler(async (req, res) => {
  const product = await setProductActiveStatus(req.params.id, req.user.id, false);

  return res.status(200).json(new ApiResponse(200, product, 'Product deactivated successfully'));
});

export const getAllProductsController = asyncHandler(async (req, res) => {
  const result = await getAllProducts({
    sellerId: req.user.id,
    page: req.query.page,
    limit: req.query.limit,
    isActive: req.query.isActive,
    category: req.query.category,
    search: req.query.search,
  });

  return res.status(200).json(new ApiResponse(200, result, 'Products fetched successfully'));
});

export const getCatalogProductsController = asyncHandler(async (req, res) => {
  const result = await getCatalogProducts({
    page: req.query.page,
    limit: req.query.limit,
    category: req.query.category,
    search: req.query.search,
    sort: req.query.sort,
  });

  return res.status(200).json(new ApiResponse(200, result, 'Catalog products fetched successfully'));
});

export const getProductByIdController = asyncHandler(async (req, res) => {
  const product = await getProductById(req.params.id, req.user.id);

  return res.status(200).json(new ApiResponse(200, product, 'Product fetched successfully'));
});
