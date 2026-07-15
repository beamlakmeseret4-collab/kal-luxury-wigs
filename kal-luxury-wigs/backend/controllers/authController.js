const User = require('../models/User');
const Product = require('../models/Product');
const { asyncHandler, generateToken, normalizeEthiopianPhone } = require('../utils/helpers');

// @desc  Register a new customer account
// @route POST /api/auth/register
// @access Public
const register = asyncHandler(async (req, res) => {
  const { name, phone, password, email } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).json({ success: false, message: 'Name, phone, and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }

  const normalizedPhone = normalizeEthiopianPhone(phone);
  if (!normalizedPhone) {
    return res.status(400).json({ success: false, message: 'Please enter a valid Ethiopian phone number.' });
  }

  const exists = await User.findOne({ phone: normalizedPhone });
  if (exists) {
    return res.status(400).json({ success: false, message: 'An account with that phone number already exists.' });
  }

  const user = await User.create({ name, phone: normalizedPhone, password, email });

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: user.toSafeObject(),
  });
});

// @desc  Login with phone + password
// @route POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;
  const normalizedPhone = normalizeEthiopianPhone(phone);

  if (!normalizedPhone || !password) {
    return res.status(400).json({ success: false, message: 'Phone and password are required.' });
  }

  const user = await User.findOne({ phone: normalizedPhone }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid phone number or password.' });
  }
  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'This account has been disabled.' });
  }

  res.json({
    success: true,
    token: generateToken(user._id, user.role === 'admin'),
    user: user.toSafeObject(),
  });
});

// @desc  Get the logged-in user's profile
// @route GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

// @desc  Update name / email on the logged-in user's profile
// @route PUT /api/auth/me
// @access Private
const updateMe = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  if (name) req.user.name = name;
  if (email !== undefined) req.user.email = email;
  await req.user.save();
  res.json({ success: true, user: req.user.toSafeObject() });
});

// @desc  Add a saved address
// @route POST /api/auth/addresses
// @access Private
const addAddress = asyncHandler(async (req, res) => {
  const { label, fullAddress, coordinates, notes } = req.body;
  if (!fullAddress) {
    return res.status(400).json({ success: false, message: 'Address is required.' });
  }
  req.user.addresses.push({ label, fullAddress, coordinates, notes });
  await req.user.save();
  res.status(201).json({ success: true, addresses: req.user.addresses });
});

// @desc  Delete a saved address
// @route DELETE /api/auth/addresses/:addressId
// @access Private
const deleteAddress = asyncHandler(async (req, res) => {
  req.user.addresses = req.user.addresses.filter(
    (a) => a._id.toString() !== req.params.addressId
  );
  await req.user.save();
  res.json({ success: true, addresses: req.user.addresses });
});

// @desc  Get the logged-in user's wishlist (populated)
// @route GET /api/auth/wishlist
// @access Private
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    select: 'name slug price compareAtPrice images brand rating badge',
  });
  res.json({ success: true, wishlist: user.wishlist });
});

// @desc  Add/remove a product from the wishlist (toggle)
// @route POST /api/auth/wishlist/:productId
// @access Private
const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const idx = req.user.wishlist.findIndex((id) => id.toString() === productId);
  let inWishlist;
  if (idx > -1) {
    req.user.wishlist.splice(idx, 1);
    inWishlist = false;
  } else {
    req.user.wishlist.push(productId);
    inWishlist = true;
  }
  await req.user.save();
  res.json({ success: true, inWishlist });
});

// @desc  Change the logged-in user's password
// @route PUT /api/auth/password
// @access Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current and new password are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
  }

  user.password = newPassword; // re-hashed automatically by the User model's pre-save hook
  await user.save();

  res.json({ success: true, message: 'Password updated.' });
});

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
  addAddress,
  deleteAddress,
  getWishlist,
  toggleWishlist,
};
