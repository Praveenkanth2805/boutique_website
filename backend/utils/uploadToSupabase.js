const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'service-images';

/**
 * Uploads an image buffer to Supabase Storage (converted to WebP)
 * @param {Buffer} buffer - Image buffer from multer
 * @param {string} originalName - Original file name (for extension)
 * @returns {Promise<string>} Public URL
 */
async function uploadToSupabase(buffer, originalName) {
  // Convert to WebP and compress
  const webpBuffer = await sharp(buffer)
    .resize(800, null, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  // Generate unique filename
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  const filename = `${timestamp}-${random}.webp`;

  // Upload to Supabase
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, webpBuffer, {
      contentType: 'image/webp',
      cacheControl: '3600',
    });

  if (error) throw error;

  // Get public URL
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filename);
  return data.publicUrl;
}

module.exports = uploadToSupabase;