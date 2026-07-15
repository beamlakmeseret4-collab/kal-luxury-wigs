const mongoose = require('mongoose');

// A tiny atomic counter used to generate sequential, human-friendly
// order numbers (KAL-2026-000123) without race conditions.
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

/** Atomically increments and returns the next sequence number for `key`. */
async function getNextSequence(key) {
  const result = await Counter.findByIdAndUpdate(
    key,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return result.seq;
}

module.exports = { Counter, getNextSequence };
