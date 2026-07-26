import { v2 as cloudinary } from 'cloudinary';
import dns from 'dns';

// Force Node.js DNS to prefer IPv4 (fixes Cloudinary API TimeoutError on Windows/ISPs)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Uploads a base64 encoded image or file buffer to Cloudinary.
 * @param fileStr - Base64 data string (e.g., data:image/png;base64,iVBORw...)
 * @param folder - Cloudinary folder name
 * @returns Promise with secure URL and public ID
 */
export async function uploadToCloudinary(fileStr: string, folder: string = 'e-voting') {
  try {
    const response = await cloudinary.uploader.upload(fileStr, {
      folder: folder,
      resource_type: 'auto',
      timeout: 60000,
    });
    return {
      success: true,
      secure_url: response.secure_url,
      public_id: response.public_id,
    };
  } catch (error: any) {
    console.error('Cloudinary Upload Error:', error);
    return {
      success: false,
      error: error.message || error,
    };
  }
}

/**
 * Extracts Cloudinary public_id from a Cloudinary secure_url.
 * e.g. "https://res.cloudinary.com/daemueqx4/image/upload/v1720000000/avatars/xyz.jpg" -> "avatars/xyz"
 */
export function extractPublicIdFromUrl(url: string): string | null {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return null;
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    let pathAfterUpload = parts[1];

    // Remove query string if present
    pathAfterUpload = pathAfterUpload.split('?')[0];

    // Split by slash
    const segments = pathAfterUpload.split('/');
    
    // Filter out transformation segments and version segments (v12345678)
    const cleanSegments = segments.filter(segment => {
      if (/^v\d+$/.test(segment)) return false;
      if (segment.includes(',') || /^[a-z]_[a-z0-9]+/.test(segment)) return false;
      return true;
    });

    if (cleanSegments.length === 0) return null;

    const fullPath = cleanSegments.join('/');
    const lastDotIndex = fullPath.lastIndexOf('.');
    const publicId = lastDotIndex !== -1 ? fullPath.substring(0, lastDotIndex) : fullPath;
    return publicId || null;
  } catch (e) {
    return null;
  }
}

/**
 * Deletes an asset from Cloudinary given its public_id or image URL.
 * @param publicIdOrUrl - Cloudinary public_id or full secure URL
 */
export async function deleteFromCloudinary(publicIdOrUrl: string) {
  try {
    if (!publicIdOrUrl) return { success: false, message: 'No public ID or URL provided' };

    const publicId = publicIdOrUrl.startsWith('http')
      ? extractPublicIdFromUrl(publicIdOrUrl)
      : publicIdOrUrl;

    if (!publicId) return { success: false, message: 'Invalid Cloudinary URL or Public ID' };

    // Invalidate CDN cache and delete image from Cloudinary
    const response = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: 'image',
    });

    console.log(`Cloudinary deletion for [${publicId}]:`, response.result);

    return {
      success: response.result === 'ok' || response.result === 'not_found',
      result: response.result,
    };
  } catch (error: any) {
    console.error('Cloudinary Delete Error:', error);
    return {
      success: false,
      error: error.message || error,
    };
  }
}

export default cloudinary;

