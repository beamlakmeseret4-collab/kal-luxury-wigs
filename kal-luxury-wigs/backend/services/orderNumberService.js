const { getNextSequence } = require('../models/Counter');

const generateOrderNumber = async () => {
  const year = new Date().getFullYear();
  const seq = await getNextSequence(`order-${year}`);
  return `KAL-${year}-${String(seq).padStart(6, '0')}`;
};

module.exports = { generateOrderNumber };
