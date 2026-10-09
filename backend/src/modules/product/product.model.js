import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Product slug must be lowercase letters, numbers, and hyphens only'],
    },

    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      uppercase: true,
      maxlength: 50,
    },

    brand: {
      type: String,
      trim: true,
      default: null,
      maxlength: 80,
    },

    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 2000,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      set: (value) => (value === null || value === undefined ? 0 : Number(value)),
    },

    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'INR'],
      default: 'INR',
    },

    attributes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },

    status: {
      type: String,
      enum: ['draft', 'published', 'pending_review', 'rejected'],
      default: 'draft',
      index: true,
    },

    seo: {
      metaTitle: {
        type: String,
        default: null,
        maxlength: 150,
      },
      metaDescription: {
        type: String,
        default: null,
        maxlength: 200,
      },
      keywords: {
        type: [String],
        default: [],
      },
    },

    images: {
      type: [String],
      default: [],
      validate: {
        validator: (value) =>
          Array.isArray(value) && value.every((image) => typeof image === 'string'),
        message: 'Product images must be an array of strings',
      },
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

productSchema.index({ seller: 1, category: 1, isActive: 1 });
productSchema.index({ seller: 1, createdAt: -1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
