import mongoose from 'mongoose';

const productStockSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant',
      default: null,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Stock quantity must be an integer',
      },
    },
    reservedQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Reserved stock quantity must be an integer',
      },
    },
    stockStatus: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock'],
      default: 'out_of_stock',
      index: true,
    },
  },
  { timestamps: true },
);

productStockSchema.pre('save', function setStockStatus(next) {
  if (this.quantity <= 0) {
    this.stockStatus = 'out_of_stock';
  } else if (this.quantity <= 5) {
    this.stockStatus = 'low_stock';
  } else {
    this.stockStatus = 'in_stock';
  }

  next();
});

productStockSchema.index({ product: 1, variant: 1 }, { unique: true, sparse: true });

const ProductStock = mongoose.model('ProductStock', productStockSchema);
export default ProductStock;
