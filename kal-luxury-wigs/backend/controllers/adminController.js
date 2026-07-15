const Order = require('../models/Order');
const Product = require('../models/Product');
const Banner = require('../models/Banner');
const { asyncHandler } = require('../utils/helpers');
const { persistUploadedFile, deleteUploadedFile } = require('../services/cloudinaryService');

// @desc  Dashboard summary stats
// @route GET /api/admin/stats
// @access Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalRevenueAgg,
    ordersByStatus,
    revenueByDay,
    topProducts,
    recentOrders,
    productCount,
    pendingVerificationCount,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.name', unitsSold: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(8),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments({ paymentStatus: 'pending_verification' }),
  ]);

  res.json({
    success: true,
    stats: {
      totalRevenue: totalRevenueAgg[0]?.total || 0,
      paidOrderCount: totalRevenueAgg[0]?.count || 0,
      ordersByStatus: ordersByStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      revenueByDay,
      topProducts,
      recentOrders,
      productCount,
      pendingVerificationCount,
    },
  });
});

// @desc  List all banners (admin sees inactive ones too)
// @route GET /api/admin/banners
// @access Private/Admin
const getAllBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
  res.json({ success: true, banners });
});

// @desc  Get only active banners, for the public homepage
// @route GET /api/banners
// @access Public
const getActiveBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
  res.json({ success: true, banners });
});

// @desc  Create a banner
// @route POST /api/admin/banners
// @access Private/Admin
const createBanner = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'A banner image is required.' });
  }
  const { url } = await persistUploadedFile(req.file, req);
  const banner = await Banner.create({ ...req.body, imageUrl: url });
  res.status(201).json({ success: true, banner });
});

// @desc  Update a banner (optionally replacing its image)
// @route PUT /api/admin/banners/:id
// @access Private/Admin
const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) return res.status(404).json({ success: false, message: 'Banner not found.' });

  Object.assign(banner, req.body);
  if (req.file) {
    const { url } = await persistUploadedFile(req.file, req);
    banner.imageUrl = url;
  }
  await banner.save();
  res.json({ success: true, banner });
});

// @desc  Delete a banner
// @route DELETE /api/admin/banners/:id
// @access Private/Admin
const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) return res.status(404).json({ success: false, message: 'Banner not found.' });
  await banner.deleteOne();
  res.json({ success: true, message: 'Banner deleted.' });
});

module.exports = {
  getDashboardStats,
  getAllBanners,
  getActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
