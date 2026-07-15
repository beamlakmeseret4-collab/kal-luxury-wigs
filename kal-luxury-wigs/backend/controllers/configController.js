const { asyncHandler } = require('../utils/helpers');

// @desc  Public, non-secret shop configuration the frontend needs to render
//        checkout (payment display details, shop address, maps key).
//        Keeping this on the backend means there is exactly one place to
//        edit this information — the .env file — rather than duplicating
//        it in the frontend code.
// @route GET /api/config/public
// @access Public
const getPublicConfig = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    config: {
      shopName: process.env.SHOP_NAME || 'Kal Luxury Wig Shop',
      shopEmail: process.env.SHOP_EMAIL || '',
      shopPhone: process.env.SHOP_PHONE || '',
      shopAddress: process.env.SHOP_ADDRESS || '',
      shopPickupInstructions: process.env.SHOP_PICKUP_INSTRUCTIONS || '',
      telebirr: {
        accountName: process.env.TELEBIRR_ACCOUNT_NAME || '',
        number: process.env.TELEBIRR_NUMBER || '',
      },
      cbe: {
        accountName: process.env.CBE_ACCOUNT_NAME || '',
        accountNumber: process.env.CBE_ACCOUNT_NUMBER || '',
        branch: process.env.CBE_BRANCH || '',
      },
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
      deliveryFee: Number(process.env.DELIVERY_FEE || 0),
    },
  });
});

module.exports = { getPublicConfig };
