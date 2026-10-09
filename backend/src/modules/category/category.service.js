import Category from './category.model.js';
import { ApiError } from '../../utils/ApiError.js';

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const throwIfDuplicateSlug = (error) => {
  if (error.code === 11000 && error.keyPattern?.slug) {
    throw new ApiError(409, 'A category with this slug already exists');
  }
  throw error;
};

const ensureValidParentCategory = async (parentCategoryId, currentCategoryId = null) => {
  if (!parentCategoryId) {
    return null;
  }

  const parentCategory = await Category.findById(parentCategoryId);
  if (!parentCategory) {
    throw new ApiError(400, 'Parent category not found');
  }

  if (currentCategoryId && parentCategory._id.toString() === currentCategoryId.toString()) {
    throw new ApiError(400, 'A category cannot be its own parent');
  }

  let currentParentId = parentCategory.parentCategory;
  const visited = new Set([parentCategory._id.toString()]);

  while (currentParentId) {
    if (currentCategoryId && currentParentId.toString() === currentCategoryId.toString()) {
      throw new ApiError(400, 'Circular category hierarchy detected');
    }

    if (visited.has(currentParentId.toString())) {
      throw new ApiError(400, 'Circular category hierarchy detected');
    }

    visited.add(currentParentId.toString());
    const ancestor = await Category.findById(currentParentId).select('parentCategory');
    if (!ancestor) {
      break;
    }
    currentParentId = ancestor.parentCategory;
  }

  return parentCategory._id;
};

export const createCategory = async ({ name, slug, description, image, parentCategory }) => {
  const categorySlug = slug || slugify(name);
  if (!categorySlug) {
    throw new ApiError(400, 'A valid category slug could not be generated from the name');
  }

  const resolvedParentCategory = await ensureValidParentCategory(parentCategory);

  try {
    return await Category.create({
      name,
      slug: categorySlug,
      description,
      image,
      parentCategory: resolvedParentCategory,
      isActive: true,
    });
  } catch (error) {
    throwIfDuplicateSlug(error);
  }
};

export const updateCategory = async (id, { name, slug, description, image, parentCategory }) => {
  try {
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (description !== undefined) updates.description = description;
    if (image !== undefined) updates.image = image;
    if (parentCategory !== undefined) {
      updates.parentCategory = parentCategory || null;
      if (parentCategory) {
        await ensureValidParentCategory(parentCategory, id);
      }
    }

    const category = await Category.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }
    return category;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
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

export const getPublicCategories = () =>
  Category.find({ isActive: true })
    .select('name slug description image parentCategory')
    .sort({ name: 1 })
    .lean();
