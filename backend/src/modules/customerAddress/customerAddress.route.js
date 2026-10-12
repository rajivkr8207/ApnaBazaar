import { Router } from 'express';
import { verifyJWT } from '../../middlewares/auth.middleware.js';
import {
  createCustomerAddressController,
  deleteCustomerAddressController,
  getCustomerAddressByIdController,
  getCustomerAddressesController,
  getDefaultCustomerAddressController,
  setDefaultCustomerAddressController,
  updateCustomerAddressController,
} from './customerAddress.controller.js';
import {
  addressIdValidation,
  createAddressValidation,
  updateAddressValidation,
} from './customerAddress.validate.js';

const customerAddressRouter = Router();

// All customer address routes require authentication
customerAddressRouter.use(verifyJWT);

// Get all addresses or create a new address
customerAddressRouter
  .route('/')
  .get(getCustomerAddressesController)
  .post(createAddressValidation, createCustomerAddressController);

// Get the user's default address
customerAddressRouter
  .route('/default')
  .get(getDefaultCustomerAddressController);

// Set an address as default
customerAddressRouter
  .route('/:id/default')
  .patch(addressIdValidation, setDefaultCustomerAddressController);

// Get, update, or delete a specific address
customerAddressRouter
  .route('/:id')
  .get(addressIdValidation, getCustomerAddressByIdController)
  .patch(updateAddressValidation, updateCustomerAddressController)
  .delete(addressIdValidation, deleteCustomerAddressController);

export default customerAddressRouter;
