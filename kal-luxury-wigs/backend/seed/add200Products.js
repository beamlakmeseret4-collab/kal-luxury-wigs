require('dotenv').config();
const connectDB = require('../config/db');
const Product = require('../models/Product');

// ============================================================================
// ADD 200 PRODUCTS — 100 human hair + 100 synthetic.
//
// This is a SEPARATE, ADD-ONLY script:
//   - It does NOT touch, edit, or delete anything already in your database.
//   - It only INSERTS new products alongside whatever's already there.
//   - Every product is created with an EMPTY photo list on purpose — you
//     add real photos afterward via /admin -> Products -> Edit, same as
//     always. Nothing here needs a picture to work: the site already
//     handles products with no photo yet by showing a soft empty box
//     instead of a broken image.
//
// HOW TO RUN:
//   node seed/add200Products.js
// (from inside the backend/ folder, same as you ran the other seed
// scripts — needs your .env pointing at the real database, local or live)
// ============================================================================

// ---- Building blocks — every value below matches the schema in
// models/Product.js exactly, so nothing here can fail validation. ----

const HUMAN_BRANDS = ['Kal Signature', 'Kal Remy', 'Kal Luxe', 'Kal Colour Edit', 'Kal Everyday'];
const SYN_BRANDS = ['Kal Classic', 'Kal Comfort', 'Kal Colour Edit', 'Kal Style', 'Kal Value'];

const TEXTURES = ['straight', 'wavy', 'body-wave', 'deep-wave', 'water-wave', 'curly', 'kinky-curly', 'coily'];
const TEXTURE_LABEL = {
  straight: 'Straight', wavy: 'Wavy', 'body-wave': 'Body Wave', 'deep-wave': 'Deep Wave',
  'water-wave': 'Water Wave', curly: 'Curly', 'kinky-curly': 'Kinky Curly', coily: 'Coily',
};

const LACE_TYPES = ['none', 'lace-front', 'hd-lace', 'transparent-lace', '360-lace', 'full-lace', 't-part', 'u-part', 'headband'];
const LACE_LABEL = {
  none: 'No-Lace', 'lace-front': 'Lace Front', 'hd-lace': 'HD Lace', 'transparent-lace': 'Transparent Lace',
  '360-lace': '360 Lace', 'full-lace': 'Full Lace', 't-part': 'T-Part', 'u-part': 'U-Part', headband: 'Headband',
};

const HUMAN_COLORS = [
  'Natural Black (1B)', 'Jet Black', 'Dark Brown', 'Chocolate Brown', 'Chestnut Brown', 'Honey Brown',
  'Medium Brown', 'Caramel Brown', 'Ash Blonde', 'Platinum Blonde (613)', 'Golden Blonde', 'Deep Burgundy',
  'Copper Red', 'Auburn', 'Black-to-Caramel Ombré', 'Black-to-Honey-Blonde Ombré', 'Salt & Pepper Grey',
];
const SYN_COLORS = [
  'Jet Black', 'Dark Brown', 'Chestnut Brown', 'Medium Brown', 'Ash Blonde', 'Platinum Blonde',
  'Deep Burgundy', 'Copper Red', 'Auburn', 'Silver Grey', 'Rose Gold', 'Chocolate Brown', 'Honey Blonde',
];

const LENGTHS = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30];

const OPENERS = [
  'A versatile everyday choice',
  'Designed for effortless styling',
  'A standout piece for special occasions',
  'Built for daily wear without sacrificing style',
  'A go-to for anyone wanting a quick transformation',
  'Crafted for a natural, lived-in look',
];
const TEXTURE_NOTES = {
  straight: 'sleek, glossy strands that hold a polished finish',
  wavy: 'soft, relaxed waves with easy natural movement',
  'body-wave': 'full, bouncy waves that move like natural hair',
  'deep-wave': 'defined, springy curls that hold their shape through humidity',
  'water-wave': 'a loose, glossy wave with a just-out-of-the-ocean finish',
  curly: 'bold, well-defined curls with real volume',
  'kinky-curly': 'a tight, natural-textured curl pattern',
  coily: 'a springy coil pattern that closely mirrors natural 4C texture',
};
const LACE_NOTES = {
  none: 'a simple, breathable capless construction — no lace to trim or glue',
  'lace-front': 'a lace front for a natural-looking hairline along the parting',
  'hd-lace': 'ultra-fine HD lace that all but disappears against the skin',
  'transparent-lace': 'transparent lace built to hold up under close-up lighting',
  '360-lace': 'a full 360° lace band for high ponytails and slicked styles',
  'full-lace': 'a full lace base for total styling and parting freedom',
  't-part': 'a small T-part opening for a quick, natural-looking install',
  'u-part': 'a U-part opening that blends with your own leave-out, no lace needed',
  headband: 'an attached headband scarf for the fastest possible install',
};
const CLOSERS = [
  'A dependable addition to any wig collection.',
  'Comfortable enough for all-day wear.',
  'Easy to maintain with basic care between wears.',
  'Holds its shape wash after wash with proper care.',
  'A flattering, easy-to-style option for any occasion.',
];

function pick(arr, i) {
  return arr[i % arr.length];
}

function buildName(brand, texture, lace, length) {
  const laceLabel = lace === 'none' ? '' : ` ${LACE_LABEL[lace]}`;
  const suffix = length <= 10 ? (length <= 8 ? ' Pixie' : ' Bob') : length >= 20 ? ' Long' : '';
  return `${brand} ${TEXTURE_LABEL[texture]}${laceLabel}${suffix} ${length}"`.replace(/\s+/g, ' ').trim();
}

function buildStyleTags(length, isMedical, isColored) {
  const tags = [];
  if (length <= 8) tags.push('pixie');
  else if (length <= 12) tags.push('bob');
  if (length >= 20) tags.push('long');
  if (isMedical) tags.push('medical');
  if (isColored) tags.push('colored');
  if (tags.length === 0) tags.push('everyday');
  if (length >= 18 && !isMedical) tags.push('bridal');
  return [...new Set(tags)];
}

function buildPrice(hairType, laceType, length) {
  const base = hairType === 'human-hair' ? 4800 : 1600;
  const perInch = hairType === 'human-hair' ? 230 : 55;
  const laceCost = {
    none: 0, headband: 100, 'u-part': 250, 't-part': 450, 'lace-front': 900,
    'hd-lace': 1600, 'transparent-lace': 1900, '360-lace': 2100, 'full-lace': 2300,
  }[laceType] || 0;
  const raw = base + length * perInch + laceCost;
  return Math.round(raw / 50) * 50; // round to nearest 50 ETB
}

function buildDescriptions(brand, texture, lace, length, colorName, i) {
  const opener = pick(OPENERS, i);
  const textureNote = TEXTURE_NOTES[texture];
  const laceNote = LACE_NOTES[lace];
  const closer = pick(CLOSERS, i + 2);

  const shortDescription = `${opener} — ${textureNote}, finished at ${length}" in ${colorName}.`.slice(0, 199);
  const description = `${opener}, the ${brand} ${TEXTURE_LABEL[texture]} wig features ${textureNote}. It's built on ${laceNote}, and comes finished at ${length}" in ${colorName}. ${closer}`;
  return { shortDescription, description };
}

function buildSpecs(hairType, texture, lace, length, density) {
  return {
    'Hair Type': hairType === 'human-hair' ? '100% Remy human hair' : 'Premium synthetic fiber',
    'Texture': TEXTURE_LABEL[texture],
    'Lace': LACE_LABEL[lace],
    'Length': `${length}"`,
    'Density': density,
  };
}

function generateBatch(hairType, count, seedOffset) {
  const brands = hairType === 'human-hair' ? HUMAN_BRANDS : SYN_BRANDS;
  const colors = hairType === 'human-hair' ? HUMAN_COLORS : SYN_COLORS;
  const densities = ['110%', '130%', '150%', '180%'];
  const products = [];

  for (let i = 0; i < count; i++) {
    const idx = i + seedOffset;
    const texture = pick(TEXTURES, idx);
    const lace = pick(LACE_TYPES, idx * 3 + Math.floor(idx / 7));
    const length = pick(LENGTHS, idx * 5 + Math.floor(idx / 3));
    const brand = pick(brands, idx * 2 + Math.floor(idx / 11));
    const density = pick(densities, idx);
    const isMedical = brand === 'Kal Comfort';
    const colorIndex = idx * 7 + Math.floor(idx / 5);
    const colorName = pick(colors, colorIndex);
    const isColored = colorName.toLowerCase().includes('ombr') || colorName.toLowerCase().includes('burgundy')
      || colorName.toLowerCase().includes('copper') || colorName.toLowerCase().includes('blonde')
      || colorName.toLowerCase().includes('auburn') || colorName.toLowerCase().includes('rose gold')
      || colorName.toLowerCase().includes('silver');

    const name = buildName(brand, texture, isMedical ? 'none' : lace, length);
    const { shortDescription, description } = buildDescriptions(
      brand, texture, isMedical ? 'none' : lace, length, colorName, idx
    );

    products.push({
      name,
      brand,
      hairType,
      laceType: isMedical ? 'none' : lace,
      texture,
      styleTags: buildStyleTags(length, isMedical, isColored),
      length: `${length}"`,
      density,
      capSize: 'Average (22"-22.5")',
      capConstruction: isMedical
        ? 'Seamless, breathable, soft inner band'
        : 'Machine-made with adjustable straps',
      colorName,
      availableColors: [colorName],
      availableSizes: ['Small', 'Average', 'Large'],
      price: buildPrice(hairType, isMedical ? 'none' : lace, length),
      shortDescription,
      description,
      specifications: buildSpecs(hairType, texture, isMedical ? 'none' : lace, length, density),
      images: [],
      badge: isMedical ? 'medical' : i % 17 === 0 ? 'new' : 'none',
      isFeatured: false,
      isActive: true,
      stock: 10,
    });
  }
  return products;
}

const newProducts = [
  ...generateBatch('human-hair', 100, 0),
  ...generateBatch('synthetic', 100, 41),
];

const run = async () => {
  await connectDB();
  console.log(`[add-200] Inserting ${newProducts.length} new products (existing products are untouched)...`);

  const result = await Product.insertMany(newProducts, { ordered: false }).catch((err) => {
    if (err.insertedDocs) return err.insertedDocs;
    throw err;
  });

  console.log(`[add-200] Done — ${result.length} products inserted.`);
  console.log("[add-200] Every one has zero photos for now — add them from /admin -> Products -> Edit whenever you're ready.");
  process.exit(0);
};

run().catch((err) => {
  console.error('[add-200] Failed:', err.message);
  process.exit(1);
});