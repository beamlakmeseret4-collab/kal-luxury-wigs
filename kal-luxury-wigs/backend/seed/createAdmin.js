require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const { normalizeEthiopianPhone } = require('../utils/helpers');

const run = async () => {
  await connectDB();

  const name = process.env.FIRST_ADMIN_NAME || 'Admin';
  const phone = normalizeEthiopianPhone(process.env.FIRST_ADMIN_PHONE);
  const password = process.env.FIRST_ADMIN_PASSWORD;

  if (!phone) {
    console.error('[create-admin] FIRST_ADMIN_PHONE in .env is missing or not a valid Ethiopian number.');
    process.exit(1);
  }
  if (!password || password.length < 6) {
    console.error('[create-admin] FIRST_ADMIN_PASSWORD in .env must be at least 6 characters.');
    process.exit(1);
  }

  const existing = await User.findOne({ phone });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`[create-admin] Existing account ${phone} was promoted to admin.`);
    } else {
      console.log(`[create-admin] Admin account for ${phone} already exists — nothing to do.`);
    }
    process.exit(0);
  }

  await User.create({ name, phone, password, role: 'admin' });
  console.log(`[create-admin] Admin account created for ${phone}.`);
  console.log('[create-admin] Log in at /admin/login with this phone number and the password from your .env — then change it from the account screen.');
  process.exit(0);
};

run().catch((err) => {
  console.error('[create-admin] Failed:', err.message);
  process.exit(1);
});
