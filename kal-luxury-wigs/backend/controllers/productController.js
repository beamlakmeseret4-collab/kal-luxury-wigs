const Product = require('../models/Product');
const { asyncHandler } = require('../utils/helpers');
const { persistUploadedFile, deleteUploadedFile } = require('../services/cloudinaryService');

// @desc  List products with search/filter/sort/pagination
// @route GET /api/products
// @access Public
// Supported query params: q, category (hairType), laceType, texture, style,
// brand, color, minPrice, maxPrice, inStock, sort, page, limit
const getProducts = asyncHandler(async (req, res) => {
  const {
    q, hairType, laceType, texture, style, brand, color,
    minPrice, maxPrice, inStock, sort, page = 1, limit = 24,
  } = req.query;

  const filter = { isActive: true };

  if (q) filter.$text = { $search: q };
  if (hairType) filter.hairType = hairType;
  if (laceType) filter.laceType = laceType;
  if (texture) filter.texture = texture;
  if (style) filter.styleTags = style;
  if (brand) filter.brand = brand;
  if (color) filter.availableColors = color;
  if (inStock === 'true') filter.stock = { $gt: 0 };

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sortMap = {
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    newest: { createdAt: -1 },
    rating: { rating: -1 },
    popular: { numReviews: -1 },
  };
  const sortBy = sortMap[sort] || { createdAt: -1 };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(60, Math.max(1, Number(limit)));

  const [products, total] = await Promise.all([
    Product.find(filter)
      .select('-reviews -description -specifications')
      .sort(sortBy)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    products,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    total,
  });
});

// @desc  Get distinct filter facets (brands, colors, etc.) for the shop sidebar
// @route GET /api/products/facets
// @access Public
const getFacets = asyncHandler(async (req, res) => {
  const [brands, colors] = await Promise.all([
    Product.distinct('brand', { isActive: true }),
    Product.distinct('availableColors', { isActive: true }),
  ]);
  res.json({
    success: true,
    facets: {
      brands: brands.sort(),
      colors: colors.sort(),
      hairTypes: ['human-hair', 'synthetic'],
      laceTypes: [
        'none', 'lace-front', 'hd-lace', 'transparent-lace', '360-lace',
        'full-lace', 't-part', 'u-part', 'headband',
      ],
      textures: [
        'straight', 'wavy', 'body-wave', 'deep-wave', 'water-wave',
        'curly', 'kinky-curly', 'coily',
      ],
      styleTags: ['bob', 'pixie', 'long', 'medical', 'colored', 'everyday', 'bridal'],
    },
  });
});

// @desc  Get featured / trending products for the homepage
// @route GET /api/products/featured
// @access Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const featured = await Product.find({ isActive: true, isFeatured: true })
    .select('-reviews -description -specifications')
    .limit(8);
  const trending = await Product.find({ isActive: true })
    .select('-reviews -description -specifications')
    .sort({ numReviews: -1, createdAt: -1 })
    .limit(8);
  res.json({ success: true, featured, trending });
});

// @desc  Get one product by slug (full detail incl. reviews)
// @route GET /api/products/slug/:slug
// @access Public
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true });
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }
  res.json({ success: true, product });
});

// @desc  Get related products (same texture or hairType, excluding self)
// @route GET /api/products/:id/related
// @access Public
const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.json({ success: true, products: [] });

  const related = await Product.find({
    _id: { $ne: product._id },
    isActive: true,
    $or: [{ texture: product.texture }, { hairType: product.hairType }],
  })
    .select('-reviews -description -specifications')
    .limit(4);

  res.json({ success: true, products: related });
});

// @desc  Create a product (with optional image uploads)
// @route POST /api/products
// @access Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  ['availableColors', 'availableSizes', 'styleTags', 'specifications'].forEach((key) => {
    if (typeof body[key] === 'string') {
      try {
        body[key] = JSON.parse(body[key]);
      } catch (e) {
        body[key] = body[key].split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
  });

  if (req.files && req.files.length) {
    const uploaded = await Promise.all(req.files.map((f) => persistUploadedFile(f, req)));
    body.images = uploaded;
  }

  const product = await Product.create(body);
  res.status(201).json({ success: true, product });
});

// @desc  Update a product (with optional new image uploads, appended)
// @route PUT /api/products/:id
// @access Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const body = { ...req.body };
  ['availableColors', 'availableSizes', 'styleTags', 'specifications', 'existingImages'].forEach((key) => {
    if (typeof body[key] === 'string') {
      try {
        body[key] = JSON.parse(body[key]);
      } catch (e) {
        if (key !== 'existingImages') {
          body[key] = body[key].split(',').map((s) => s.trim()).filter(Boolean);
        }
      }
    }
  });

  Object.keys(body).forEach((key) => {
    if (key === 'existingImages') return;
    product[key] = body[key];
  });

  // existingImages (if provided) is the client's edited list of images to KEEP
  let finalImages = body.existingImages !== undefined ? body.existingImages : product.images;

  if (req.files && req.files.length) {
    const uploaded = await Promise.all(req.files.map((f) => persistUploadedFile(f, req)));
    finalImages = [...finalImages, ...uploaded];
  }
  product.images = finalImages;

  await product.save();
  res.json({ success: true, product });
});

// @desc  Delete a product
// @route DELETE /api/products/:id
// @access Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }
  await Promise.all(product.images.map((img) => deleteUploadedFile(img.publicId)));
  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted.' });
});

// @desc  Submit a review for a product
// @route POST /api/products/:id/reviews
// @access Public (name/rating/comment; optionally attached to logged-in user)
const addReview = asyncHandler(async (req, res) => {
  const { name, rating, comment } = req.body;
  if (!name || !rating || !comment) {
    return res.status(400).json({ success: false, message: 'Name, rating, and comment are required.' });
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  product.reviews.push({
    name,
    rating: Number(rating),
    comment,
    user: req.user ? req.user._id : undefined,
  });
  product.recomputeRating();
  await product.save();

  res.status(201).json({ success: true, product });
});

module.exports = {
  getProducts,
  getFacets,
  getFeaturedProducts,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
};