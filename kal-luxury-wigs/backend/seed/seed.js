require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const products = require('./data/products');

const run = async () => {
  await connectDB();

  if (process.argv.includes('--destroy')) {
    await Product.deleteMany();
    console.log('[seed] All products removed.');
    process.exit(0);
  }

  await Product.deleteMany();
  console.log('[seed] Cleared existing products.');

  const created = await Product.insertMany(products, { ordered: true });
  console.log(`[seed] Inserted ${created.length} products.`);

  console.log('[seed] Done. Run "npm run create-admin" next to set up your admin login.');
  process.exit(0);
};

run().catch((err) => {
  console.error('[seed] Failed:', err.message);
  process.exit(1);
});
