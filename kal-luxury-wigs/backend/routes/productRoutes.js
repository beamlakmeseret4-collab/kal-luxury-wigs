const express = require('express');
const {
  getProducts, getFacets, getFeaturedProducts, getProductBySlug,
  getRelatedProducts, createProduct, updateProduct, deleteProduct, addReview,
} = require('../controllers/productController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getProducts);
router.get('/facets', getFacets);
router.get('/featured', getFeaturedProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id/related', getRelatedProducts);
router.post('/:id/reviews', optionalAuth, addReview);

router.post('/', protect, adminOnly, upload.array('images', 8), createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 8), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
