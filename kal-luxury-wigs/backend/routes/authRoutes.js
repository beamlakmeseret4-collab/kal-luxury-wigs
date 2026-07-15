const express = require('express');
const { body } = require('express-validator');
const {
  register, login, getMe, updateMe, changePassword,
  addAddress, deleteAddress, getWishlist, toggleWishlist,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');
const { validate } = require('../middleware/security');

const router = express.Router();

router.post(
  '/register',
  authLimiter,
  [body('name').trim().notEmpty(), body('phone').trim().notEmpty(), body('password').isLength({ min: 6 })],
  validate,
  register
);
router.post('/login', authLimiter, [body('phone').trim().notEmpty(), body('password').notEmpty()], validate, login);

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put(
  '/password',
  protect,
  authLimiter,
  [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 6 })],
  validate,
  changePassword
);

router.post('/addresses', protect, addAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:productId', protect, toggleWishlist);

module.exports = router;
