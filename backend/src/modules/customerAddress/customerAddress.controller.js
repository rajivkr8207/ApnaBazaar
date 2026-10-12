import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  createCustomerAddress,
  deleteCustomerAddress,
  getCustomerAddressById,
  getCustomerAddresses,
  getDefaultCustomerAddress,
  setDefaultCustomerAddress,
  updateCustomerAddress,
} from './customerAddress.service.js';

const getUserId = (req) => req.user?.id || req.user?._id;

export const createCustomerAddressController = asyncHandler(async (req, res) => {
  const address = await createCustomerAddress(getUserId(req), req.body);
  return res.status(201).json(new ApiResponse(201, address, 'Address created successfully'));
});

export const getCustomerAddressesController = asyncHandler(async (req, res) => {
  const addresses = await getCustomerAddresses(getUserId(req));
  return res.status(200).json(new ApiResponse(200, addresses, 'Addresses retrieved successfully'));
});

export const getCustomerAddressByIdController = asyncHandler(async (req, res) => {
  const address = await getCustomerAddressById(getUserId(req), req.params.id);
  return res.status(200).json(new ApiResponse(200, address, 'Address retrieved successfully'));
});

export const updateCustomerAddressController = asyncHandler(async (req, res) => {
  const address = await updateCustomerAddress(getUserId(req), req.params.id, req.body);
  return res.status(200).json(new ApiResponse(200, address, 'Address updated successfully'));
});

export const deleteCustomerAddressController = asyncHandler(async (req, res) => {
  const result = await deleteCustomerAddress(getUserId(req), req.params.id);
  return res.status(200).json(new ApiResponse(200, result, 'Address deleted successfully'));
});

export const setDefaultCustomerAddressController = asyncHandler(async (req, res) => {
  const address = await setDefaultCustomerAddress(getUserId(req), req.params.id);
  return res.status(200).json(new ApiResponse(200, address, 'Default address set successfully'));
});

export const getDefaultCustomerAddressController = asyncHandler(async (req, res) => {
  const address = await getDefaultCustomerAddress(getUserId(req));
  return res.status(200).json(new ApiResponse(200, address, 'Default address retrieved successfully'));
});
