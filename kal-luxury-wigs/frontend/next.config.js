/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Placeholder seed images — safe to remove once real product photos are uploaded.
      { protocol: 'https', hostname: 'placehold.co' },
      // Used automatically if you configure Cloudinary for image hosting.
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Local-disk-uploaded images served by the backend in development.
      { protocol: 'http', hostname: 'localhost' },
      // TODO: once you deploy the backend to its real domain, add it here, e.g.:
      // { protocol: 'https', hostname: 'api.kalluxurywigshop.com' },
    ],
  },
};

module.exports = nextConfig;
