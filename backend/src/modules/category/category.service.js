import Category from './category.model.js';
import { ApiError } from '../../utils/ApiError.js';

const slugify = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const throwIfDuplicateSlug = (error) => {
  if (error.code === 11000 && error.keyPattern?.slug) {
    throw new ApiError(409, 'A category with this slug already exists');
  }
  throw error;
};

export const createCategory = async ({ name, slug, description, image }) => {
  const categorySlug = slug || slugify(name);
  if (!categorySlug) {
    throw new ApiError(400, 'A valid category slug could not be generated from the name');
  }

  try {
    return await Category.create({
      name,
      slug: categorySlug,
      description,
      image,
    });
  } catch (error) {
    throwIfDuplicateSlug(error);
  }
};

export const updateCategory = async (id, { name, slug, description, image }) => {
  try {
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (description !== undefined) updates.description = description;
    if (image !== undefined) updates.image = image;

    const category = await Category.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }
    return category;
  } catch (error) {
    throwIfDuplicateSlug(error);
  }
};

export const deleteCategory = async (id) => {
  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  return category;
};

const setCategoryActive = async (id, isActive) => {
  const category = await Category.findByIdAndUpdate(
    id,
    { isActive },
    { new: true, runValidators: true },
  );
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  return category;
};

export const activateCategory = (id) => setCategoryActive(id, true);

export const deactivateCategory = (id) => setCategoryActive(id, false);
