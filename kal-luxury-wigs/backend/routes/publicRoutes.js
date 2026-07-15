const express = require('express');
const { body } = require('express-validator');
const { getPublicConfig } = require('../controllers/configController');
const { getActiveBanners } = require('../controllers/adminController');
const Subscriber = require('../models/Subscriber');
const { asyncHandler } = require('../utils/helpers');
const { validate } = require('../middleware/security');

const router = express.Router();

router.get('/config/public', getPublicConfig);
router.get('/banners', getActiveBanners);

router.post(
  '/newsletter/subscribe',
  [body('email').isEmail().withMessage('Please enter a valid email address.')],
  validate,
  asyncHandler(async (req, res) => {
    const email = req.body.email.toLowerCase().trim();
    await Subscriber.updateOne({ email }, { email }, { upsert: true });
    res.status(201).json({ success: true, message: 'Subscribed!' });
  })
);

module.exports = router;
