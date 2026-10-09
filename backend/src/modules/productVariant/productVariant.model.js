import mongoose from 'mongoose';

const productVariantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 50,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (value) =>
          Array.isArray(value) && value.every((image) => typeof image === 'string'),
        message: 'Variant images must be an array of strings',
      },
    },
    attributes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    price: {
      type: Number,
      min: 0,
      default: 0,
      set: (value) => (value === null || value === undefined ? 0 : Number(value)),
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'INR'],
      default: 'INR',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

const ProductVariant = mongoose.model('ProductVariant', productVariantSchema);

export default ProductVariant;
