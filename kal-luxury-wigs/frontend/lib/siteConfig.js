// Static brand/navigation content. Shop-specific business details (phone,
// TeleBirr number, CBE account, Maps key, etc.) are NOT here — those come
// from the backend's /api/config/public endpoint (see lib/api.js) so they
// only ever need to be edited in one place: backend/.env.

export const siteConfig = {
  name: 'Kal Luxury Wig Shop',
  shortName: 'Kal',
  tagline: 'Wear Your Crown',
  description:
    'Luxury human hair and synthetic wigs in Addis Ababa — lace fronts, bobs, curls, and colour, delivered or ready for pickup.',
};

export const mainNav = [
  { label: 'Shop', href: '/shop' },
  { label: 'Track Order', href: '/track-order' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export const footerLinks = {
  Shop: [
    { label: 'All Wigs', href: '/shop' },
    { label: 'Human Hair', href: '/shop?hairType=human-hair' },
    { label: 'Synthetic', href: '/shop?hairType=synthetic' },
    { label: 'Track an Order', href: '/track-order' },
  ],
  Support: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Returns & Care', href: '/returns' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
  ],
};

export const textureLabels = {
  straight: 'Straight',
  wavy: 'Wavy',
  'body-wave': 'Body Wave',
  'deep-wave': 'Deep Wave',
  'water-wave': 'Water Wave',
  curly: 'Curly',
  'kinky-curly': 'Kinky Curly',
  coily: 'Coily',
};

export const laceLabels = {
  none: 'No Lace',
  'lace-front': 'Lace Front',
  'hd-lace': 'HD Lace',
  'transparent-lace': 'Transparent Lace',
  '360-lace': '360 Lace',
  'full-lace': 'Full Lace',
  't-part': 'T-Part',
  'u-part': 'U-Part',
  headband: 'Headband',
};

export const styleTagLabels = {
  bob: 'Bob',
  pixie: 'Pixie',
  long: 'Long',
  medical: 'Medical / Sensitive Scalp',
  colored: 'Colour',
  everyday: 'Everyday',
  bridal: 'Bridal & Occasion',
};

export const badgeLabels = {
  bestseller: 'Bestseller',
  new: 'New',
  sale: 'Sale',
  medical: 'Comfort Fit',
};
