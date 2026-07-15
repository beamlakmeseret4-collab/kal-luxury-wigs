const fs = require('fs');
const path = require('path');

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

let cloudinary = null;
if (isCloudinaryConfigured()) {
  // Only require + configure the SDK if credentials are actually present,
  // so the app runs fine with zero Cloudinary setup (local disk storage).
  // eslint-disable-next-line global-require
  cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Given a file that Multer has already saved to local disk, either:
 *  - uploads it to Cloudinary and deletes the local temp copy (if configured), or
 *  - leaves it on local disk and returns a URL served by this same server.
 * Returns { url, publicId } either way, so callers don't need to care which.
 */
const persistUploadedFile = async (file, req) => {
  if (isCloudinaryConfigured() && cloudinary) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'kal-luxury-wigs',
      resource_type: 'image',
    });
    // Clean up the local temp file now that it's hosted on Cloudinary.
    fs.unlink(file.path, () => {});
    return { url: result.secure_url, publicId: result.public_id };
  }

  const host = `${req.protocol}://${req.get('host')}`;
  const url = `${host}/uploads/${path.basename(file.path)}`;
  return { url, publicId: null };
};

const deleteUploadedFile = async (publicId) => {
  if (!publicId || !isCloudinaryConfigured() || !cloudinary) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn('[cloudinary] failed to delete asset:', err.message);
  }
};

module.exports = { isCloudinaryConfigured, persistUploadedFile, deleteUploadedFile };
