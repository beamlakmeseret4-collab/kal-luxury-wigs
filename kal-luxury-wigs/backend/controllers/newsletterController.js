const Subscriber = require('../models/Subscriber');
const { asyncHandler } = require('../utils/helpers');

// @desc  Subscribe an email to the newsletter
// @route POST /api/newsletter/subscribe
// @access Public
const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  const existing = await Subscriber.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.json({ success: true, message: 'You are already subscribed!' });
  }

  await Subscriber.create({ email: email.toLowerCase() });
  res.status(201).json({ success: true, message: 'Subscribed! Watch your inbox for new arrivals.' });
});

module.exports = { subscribe };
