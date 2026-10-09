import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Category slug must be lowercase letters, numbers, and hyphens only'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    image: {
      type: String,
      default: null,
      trim: true,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

const hasCircularHierarchy = async function (model, categoryId, currentCategoryId = null) {
  if (!categoryId) {
    return false;
  }

  const visited = new Set();
  let nextParentId = categoryId.toString();

  while (nextParentId) {
    if (visited.has(nextParentId)) {
      return true;
    }

    visited.add(nextParentId);

    if (currentCategoryId && nextParentId === currentCategoryId.toString()) {
      return true;
    }

    const parent = await model.findById(nextParentId).select('parentCategory');
    if (!parent || !parent.parentCategory) {
      return false;
    }

    nextParentId = parent.parentCategory.toString();
  }

  return false;
};

categorySchema.pre('validate', async function (next) {
  if (!this.parentCategory) {
    return next();
  }

  if (this._id && this.parentCategory.toString() === this._id.toString()) {
    return next(new Error('A category cannot be its own parent'));
  }

  try {
    const circular = await hasCircularHierarchy(this.constructor, this.parentCategory, this._id);
    if (circular) {
      return next(new Error('Circular category hierarchy detected'));
    }
  } catch (error) {
    return next(error);
  }

  next();
});

categorySchema.index({ name: 1, parentCategory: 1 }, { unique: false });

const Category = mongoose.model('Category', categorySchema);
export default Category;
