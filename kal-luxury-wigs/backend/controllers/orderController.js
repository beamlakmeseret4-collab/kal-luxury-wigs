const Order = require('../models/Order');
const Product = require('../models/Product');
const { asyncHandler, normalizeEthiopianPhone } = require('../utils/helpers');
const { persistUploadedFile } = require('../services/cloudinaryService');
const { generateOrderNumber } = require('../services/orderNumberService');
const { notifyNewOrder } = require('../services/notificationService');

// @desc  Create an order (guest or logged-in). Multipart form if a payment
//        screenshot is attached (telebirr/cbe), otherwise plain JSON (cash).
// @route POST /api/orders
// @access Public
const createOrder = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  ['items', 'deliveryAddress'].forEach((key) => {
    if (typeof body[key] === 'string') {
      try { body[key] = JSON.parse(body[key]); } catch (e) { /* leave as-is, validated below */ }
    }
  });

  const {
    customerName, customerPhone, customerEmail,
    items, deliveryMethod, deliveryAddress,
    paymentMethod, payerName, payerPhone,
  } = body;

  if (!customerName || !customerPhone) {
    return res.status(400).json({ success: false, message: 'Name and phone number are required.' });
  }
  const normalizedPhone = normalizeEthiopianPhone(customerPhone);
  if (!normalizedPhone) {
    return res.status(400).json({ success: false, message: 'Please enter a valid Ethiopian phone number.' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Your cart is empty.' });
  }
  if (!['delivery', 'pickup'].includes(deliveryMethod)) {
    return res.status(400).json({ success: false, message: 'Please choose delivery or pickup.' });
  }
  if (!['telebirr', 'cbe', 'cash'].includes(paymentMethod)) {
    return res.status(400).json({ success: false, message: 'Please choose a payment method.' });
  }
  if (deliveryMethod === 'delivery' && !deliveryAddress?.fullAddress) {
    return res.status(400).json({ success: false, message: 'Please provide a delivery address or pin your location.' });
  }
  if ((paymentMethod === 'telebirr' || paymentMethod === 'cbe') && !req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a screenshot of your payment.' });
  }

  // Re-price server-side from the database — never trust client-supplied prices.
  const productIds = items.map((i) => i.productId).filter(Boolean);
  const dbProducts = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

  const orderItems = [];
  let subtotal = 0;
  for (const item of items) {
    const dbProduct = productMap.get(item.productId);
    if (!dbProduct) {
      return res.status(400).json({ success: false, message: `A product in your cart is no longer available.` });
    }
    const qty = Math.max(1, Number(item.qty) || 1);
    orderItems.push({
      product: dbProduct._id,
      name: dbProduct.name,
      image: dbProduct.images?.[0]?.url,
      price: dbProduct.price,
      qty,
      size: item.size,
      color: item.color,
    });
    subtotal += dbProduct.price * qty;
  }

  const deliveryFee = deliveryMethod === 'delivery' ? Number(process.env.DELIVERY_FEE || 0) : 0;
  const total = subtotal + deliveryFee;

  let paymentProof;
  if (req.file) {
    const persisted = await persistUploadedFile(req.file, req);
    paymentProof = {
      imageUrl: persisted.url,
      payerName: payerName || customerName,
      payerPhone: normalizeEthiopianPhone(payerPhone) || normalizedPhone,
    };
  }

  const orderNumber = await generateOrderNumber();

  const order = await Order.create({
    orderNumber,
    user: req.user ? req.user._id : undefined,
    customer: { name: customerName, phone: normalizedPhone, email: customerEmail },
    items: orderItems,
    subtotal,
    deliveryFee,
    total,
    deliveryMethod,
    deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : undefined,
    paymentMethod,
    paymentProof,
    paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending_verification',
    orderStatus: 'pending',
    timeline: [{ status: 'pending', note: 'Order placed' }],
  });

  // Fire-and-forget: never let notification failures block the response.
  notifyNewOrder(order).catch(() => {});
  const io = req.app.get('io');
  if (io) io.to('admin').emit('new_order', order);

  res.status(201).json({ success: true, order });
});

// @desc  Track an order as a guest (requires matching order number + phone)
// @route GET /api/orders/track?orderNumber=&phone=
// @access Public
const trackOrder = asyncHandler(async (req, res) => {
  const { orderNumber, phone } = req.query;
  const normalizedPhone = normalizeEthiopianPhone(phone);
  if (!orderNumber || !normalizedPhone) {
    return res.status(400).json({ success: false, message: 'Order number and phone number are required.' });
  }
  const order = await Order.findOne({ orderNumber, 'customer.phone': normalizedPhone });
  if (!order) {
    return res.status(404).json({ success: false, message: 'No matching order found. Double check your order number and phone.' });
  }
  res.json({ success: true, order });
});

// @desc  Get the logged-in customer's own orders
// @route GET /api/orders/my
// @access Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// @desc  List all orders (admin), filterable by status/payment/date
// @route GET /api/orders
// @access Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus, paymentMethod, deliveryMethod, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (orderStatus) filter.orderStatus = orderStatus;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (deliveryMethod) filter.deliveryMethod = deliveryMethod;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    Order.countDocuments(filter),
  ]);

  res.json({ success: true, orders, page: pageNum, pages: Math.ceil(total / limitNum) || 1, total });
});

// @desc  Get one order by id
// @route GET /api/orders/:id
// @access Private/Admin
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  res.json({ success: true, order });
});

// @desc  Confirm that payment has been received (manual verification)
// @route PUT /api/orders/:id/confirm-payment
// @access Private/Admin
const confirmPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  order.paymentStatus = 'paid';
  if (order.orderStatus === 'pending') order.orderStatus = 'confirmed';
  order.timeline.push({ status: 'payment_confirmed', note: 'Payment verified by admin' });
  await order.save();

  res.json({ success: true, order });
});

// @desc  Update order status (confirmed/processing/shipped/delivered/cancelled)
// @route PUT /api/orders/:id/status
// @access Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, note, cancelReason } = req.body;
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(orderStatus)) {
    return res.status(400).json({ success: false, message: 'Invalid status.' });
  }

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  order.orderStatus = orderStatus;
  if (orderStatus === 'cancelled' && cancelReason) order.cancelReason = cancelReason;
  order.timeline.push({ status: orderStatus, note });
  await order.save();

  res.json({ success: true, order });
});

// @desc  Assign a driver to a delivery order
// @route PUT /api/orders/:id/assign-driver
// @access Private/Admin
const assignDriver = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  order.assignedDriver = { name, phone };
  order.timeline.push({ status: order.orderStatus, note: `Driver assigned: ${name}` });
  await order.save();

  res.json({ success: true, order });
});

// @desc  Export orders as CSV
// @route GET /api/orders/export.csv
// @access Private/Admin
const exportOrdersCSV = asyncHandler(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });

  const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
  const header = [
    'Order Number', 'Date', 'Customer', 'Phone', 'Items', 'Subtotal', 'Delivery Fee', 'Total',
    'Payment Method', 'Payment Status', 'Order Status', 'Delivery Method', 'Address',
  ];
  const rows = orders.map((o) => [
    o.orderNumber,
    o.createdAt.toISOString(),
    o.customer.name,
    o.customer.phone,
    o.items.map((i) => `${i.qty}x ${i.name}`).join('; '),
    o.subtotal,
    o.deliveryFee,
    o.total,
    o.paymentMethod,
    o.paymentStatus,
    o.orderStatus,
    o.deliveryMethod,
    o.deliveryAddress?.fullAddress || '',
  ]);

  const csv = [header, ...rows].map((r) => r.map(escape).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="orders-${Date.now()}.csv"`);
  res.send(csv);
});

module.exports = {
  createOrder,
  trackOrder,
  getMyOrders,
  getOrders,
  getOrderById,
  confirmPayment,
  updateOrderStatus,
  assignDriver,
  exportOrdersCSV,
};
