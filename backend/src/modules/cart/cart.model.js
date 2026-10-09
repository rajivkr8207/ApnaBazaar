import mongoose from 'mongoose';
import priceSchema from '../price/price.model.js';

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        variant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ProductVariant',
          default: null,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
          validate: {
            validator: Number.isInteger,
            message: 'Cart item quantity must be an integer',
          },
        },
        price: {
          type: priceSchema,
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

cartSchema.index({ user: 1 }, { unique: true });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
