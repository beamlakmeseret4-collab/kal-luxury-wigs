const express = require('express');
const {
  createOrder, trackOrder, getMyOrders, getOrders, getOrderById,
  confirmPayment, updateOrderStatus, assignDriver, exportOrdersCSV,
} = require('../controllers/orderController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { orderLimiter } = require('../middleware/security');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', orderLimiter, optionalAuth, upload.single('paymentScreenshot'), createOrder);
router.get('/track', trackOrder);
router.get('/my', protect, getMyOrders);

router.get('/export.csv', protect, adminOnly, exportOrdersCSV);
router.get('/', protect, adminOnly, getOrders);
router.get('/:id', protect, adminOnly, getOrderById);
router.put('/:id/confirm-payment', protect, adminOnly, confirmPayment);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.put('/:id/assign-driver', protect, adminOnly, assignDriver);

module.exports = router;
