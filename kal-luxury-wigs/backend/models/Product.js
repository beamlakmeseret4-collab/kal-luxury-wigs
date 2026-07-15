const mongoose = require('mongoose');
const slugify = require('slugify');

const imageSchema = new mongoose.Schema(
  { url: { type: String, required: true }, publicId: { type: String } },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 1000 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    slug: { type: String, unique: true, index: true },
    brand: {
      type: String,
      required: true,
      trim: true,
      default: 'Kal Signature',
    },
    sku: { type: String, unique: true, sparse: true },

    // What kind of wig this is. A single product composes several of
    // these attributes at once (e.g. Human Hair + HD Lace + Body Wave).
    hairType: {
      type: String,
      enum: ['human-hair', 'synthetic'],
      required: true,
    },
    laceType: {
      type: String,
      enum: [
        'none', 'lace-front', 'hd-lace', 'transparent-lace', '360-lace',
        'full-lace', 't-part', 'u-part', 'headband',
      ],
      default: 'none',
    },
    texture: {
      type: String,
      enum: [
        'straight', 'wavy', 'body-wave', 'deep-wave', 'water-wave',
        'curly', 'kinky-curly', 'coily',
      ],
      required: true,
    },
    styleTags: [
      {
        type: String,
        enum: ['bob', 'pixie', 'long', 'medical', 'colored', 'everyday', 'bridal'],
      },
    ],

    length: { type: String, required: true }, // e.g. 14", 18", 22"
    density: { type: String, default: '150%' },
    capSize: { type: String, default: 'Average (22"-22.5")' },
    capConstruction: { type: String, default: 'Machine-made with adjustable straps' },
    colorName: { type: String, default: 'Natural Black' },
    availableColors: [{ type: String }],
    availableSizes: [{ type: String }],

    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    currency: { type: String, default: 'ETB' },

    images: { type: [imageSchema], default: [] },
    shortDescription: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true },
    specifications: { type: Map, of: String, default: {} },

    badge: {
      type: String,
      enum: ['none', 'bestseller', 'new', 'sale', 'medical'],
      default: 'none',
    },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    stock: { type: Number, default: 10, min: 0 },

    reviews: { type: [reviewSchema], default: [] },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({
  name: 'text',
  brand: 'text',
  description: 'text',
  shortDescription: 'text',
});

productSchema.pre('validate', async function generateSlug(next) {
  if (this.isModified('name') || !this.slug) {
    const base = slugify(this.name || '', { lower: true, strict: true });
    let candidate = base;
    let i = 1;
    // Ensure uniqueness without relying on a race-prone count.
    // eslint-disable-next-line no-await-in-loop
    while (await mongoose.models.Product.exists({ slug: candidate, _id: { $ne: this._id } })) {
      candidate = `${base}-${i}`;
      i += 1;
    }
    this.slug = candidate;
  }
  next();
});

productSchema.methods.recomputeRating = function recomputeRating() {
  if (!this.reviews.length) {
    this.rating = 0;
    this.numReviews = 0;
    return;
  }
  const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
  this.rating = Math.round((total / this.reviews.length) * 10) / 10;
  this.numReviews = this.reviews.length;
};

module.exports = mongoose.model('Product', productSchema);
