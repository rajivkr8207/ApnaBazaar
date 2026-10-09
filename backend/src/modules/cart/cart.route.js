import { Router } from 'express';
import { verifyJWT } from '../../middlewares/auth.middleware.js';
import {
  addItemToCartController,
  clearCartController,
  getCartController,
  removeCartItemController,
  updateCartItemQuantityController,
} from './cart.controller.js';
import {
  addCartItemValidation,
  cartItemIdValidation,
  updateCartItemValidation,
} from './cart.validate.js';

const cartRouter = Router();

cartRouter.use(verifyJWT);
cartRouter.get('/', getCartController);
cartRouter.post('/items', addCartItemValidation, addItemToCartController);
cartRouter.patch('/items/:itemId', updateCartItemValidation, updateCartItemQuantityController);
cartRouter.delete('/items/:itemId', cartItemIdValidation, removeCartItemController);
cartRouter.delete('/', clearCartController);

export default cartRouter;