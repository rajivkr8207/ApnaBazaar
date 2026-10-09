import mongoose from 'mongoose';
import Product from './product.model.js';
import Category from '../category/category.model.js';
import ProductVariant from '../productVariant/productVariant.model.js';
import { ApiError } from '../../utils/ApiError.js';

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const ensureCategoryExists = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
};

const buildUniqueSlug = async (inputName, fallbackSlug, excludeProductId = null) => {
  const base = fallbackSlug || slugify(inputName);
  if (!base) {
    throw new ApiError(400, 'A valid product slug could not be generated from the name');
  }

  const filter = { slug: base };
  if (excludeProductId) {
    filter._id = { $ne: excludeProductId };
  }

  const existingProduct = await Product.findOne(filter);
  if (!existingProduct) {
    return base;
  }

  let suffix = 1;
  let candidate = `${base}-${suffix}`;

  while (
    await Product.findOne({
      slug: candidate,
      ...(excludeProductId ? { _id: { $ne: excludeProductId } } : {}),
    })
  ) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return candidate;
};

export const createProduct = async (payload, sellerId) => {
  const {
    name,
    category,
    slug,
    description = '',
    price,
    images = [],
    sku,
    brand,
    attributes,
    status,
    seo,
  } = payload;

  if (!name || !String(name).trim()) {
    throw new ApiError(400, 'Product name is required');
  }

  if (!category) {
    throw new ApiError(400, 'Category is required');
  }

  if (price === undefined || Number(price) < 0) {
    throw new ApiError(400, 'Price must be provided and cannot be negative');
  }

  await ensureCategoryExists(category);

  const uniqueSlug = await buildUniqueSlug(name, slug);

  const product = await Product.create({
    seller: sellerId,
    category,
    name: String(name).trim(),
    slug: uniqueSlug,
    description: String(description).trim(),
    price: Number(price),
    sku: sku ? String(sku).trim().toUpperCase() : undefined,
    brand: brand ? String(brand).trim() : null,
    attributes: attributes || {},
    status: status || 'draft',
    seo: seo || {},
    images,
    isActive: true,
  });

  return await product.populate('category', 'name slug');
};

export const updateProduct = async (productId, sellerId, payload) => {
  const product = await Product.findOne({ _id: productId, seller: sellerId });

  if (!product) {
    throw new ApiError(404, 'Product not found or you do not own this product');
  }

  const { name, category, slug, description, price, images, sku, brand, attributes, status, seo } =
    payload;

  if (name !== undefined) {
    if (!String(name).trim()) {
      throw new ApiError(400, 'Product name cannot be empty');
    }
    product.name = String(name).trim();
  }

  if (category !== undefined) {
    await ensureCategoryExists(category);
    product.category = category;
  }

  if (slug !== undefined) {
    const normalizedSlug = slugify(slug);
    product.slug = normalizedSlug || product.slug;
    product.slug = await buildUniqueSlug(product.slug, null, product._id);
  } else if (name !== undefined) {
    product.slug = await buildUniqueSlug(product.name, product.slug, product._id);
  }

  if (description !== undefined) {
    product.description = String(description).trim();
  }

  if (price !== undefined) {
    if (Number(price) < 0) {
      throw new ApiError(400, 'Price cannot be negative');
    }
    product.price = Number(price);
  }

  if (sku !== undefined) {
    product.sku = sku ? String(sku).trim().toUpperCase() : null;
  }

  if (brand !== undefined) {
    product.brand = brand ? String(brand).trim() : null;
  }

  if (attributes !== undefined) {
    product.attributes = attributes || {};
  }

  if (status !== undefined) {
    product.status = status;
  }

  if (seo !== undefined) {
    product.seo = seo || {};
  }

  if (images !== undefined) {
    product.images = images;
  }

  await product.save();

  return await product.populate('category', 'name slug');
};

export const deleteProduct = async (productId, sellerId) => {
  const product = await Product.findOneAndDelete({ _id: productId, seller: sellerId });

  if (!product) {
    throw new ApiError(404, 'Product not found or you do not own this product');
  }

  return product;
};

export const setProductActiveStatus = async (productId, sellerId, isActive) => {
  const product = await Product.findOne({ _id: productId, seller: sellerId });

  if (!product) {
    throw new ApiError(404, 'Product not found or you do not own this product');
  }

  product.isActive = isActive;
  await product.save();

  return await product.populate('category', 'name slug');
};

export const getAllProducts = async ({
  sellerId,
  page = 1,
  limit = 10,
  isActive,
  category,
  search,
}) => {
  const query = { seller: sellerId };

  if (isActive !== undefined) {
    query.isActive = isActive === true || isActive === 'true';
  }

  if (category) {
    query.category = category;
  }

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const skip = (safePage - 1) * safeLimit;

  const [items, totalItems] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit),
    Product.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalItems / safeLimit) || 1;

  return {
    items,
    page: safePage,
    limit: safeLimit,
    totalItems,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  };
};

export const getCatalogProducts = async ({
  page = 1,
  limit = 12,
  category,
  search,
  sort = 'newest',
}) => {
  const query = {
    isActive: true,
    status: 'published',
  };

  if (category) {
    if (!mongoose.isValidObjectId(category)) {
      throw new ApiError(400, 'A valid category ID is required');
    }
    query.category = category;
  }

  if (search) {
    const escapedSearch = String(search).slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { name: { $regex: escapedSearch, $options: 'i' } },
      { brand: { $regex: escapedSearch, $options: 'i' } },
      { description: { $regex: escapedSearch, $options: 'i' } },
    ];
  }

  const sortOptions = {
    newest: { createdAt: -1, _id: -1 },
    'price-asc': { price: 1, _id: 1 },
    'price-desc': { price: -1, _id: -1 },
  };
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 48);
  const [items, totalItems] = await Promise.all([
    Product.find(query)
      .select('name slug description price currency images brand category seller')
      .populate('category', 'name slug')
      .populate('seller', 'fullName username')
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean({ flattenMaps: true }),
    Product.countDocuments(query),
  ]);

  const productIds = items.map((item) => item._id);
  const variants = productIds.length
    ? await ProductVariant.find({ product: { $in: productIds }, isActive: true })
        .select('product sku attributes images price currency')
      .lean({ flattenMaps: true })
    : [];
  const variantsByProduct = new Map();

  for (const variant of variants) {
    const productId = variant.product.toString();
    const productVariants = variantsByProduct.get(productId) || [];
    productVariants.push(variant);
    variantsByProduct.set(productId, productVariants);
  }

  const products = items.map((item) => ({
    ...item,
    variants: variantsByProduct.get(item._id.toString()) || [],
  }));
  const totalPages = Math.ceil(totalItems / safeLimit) || 1;

  return {
    items: products,
    page: safePage,
    limit: safeLimit,
    totalItems,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  };
};

export const getProductById = async (productId, sellerId) => {
  const product = await Product.findOne({ _id: productId, seller: sellerId }).populate(
    'category',
    'name slug',
  );

  if (!product) {
    throw new ApiError(404, 'Product not found or you do not own this product');
  }

  return product;
};
