const express = require('express');
const { getDashboardStats, getAllBanners, createBanner, updateBanner, deleteBanner } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);

router.get('/banners', getAllBanners);
router.post('/banners', upload.single('image'), createBanner);
router.put('/banners/:id', upload.single('image'), updateBanner);
router.delete('/banners/:id', deleteBanner);

module.exports = router;
