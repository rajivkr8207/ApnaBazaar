import mongoose from 'mongoose';
import priceSchema from '../price/price.model.js';

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
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
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1,
      },
      price: {
        type: priceSchema,
        required: true,
      },
    },
  ],
});

const cartModel = mongoose.model('Cart', cartSchema);

export default cartModel;
