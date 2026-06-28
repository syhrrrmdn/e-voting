import { v2 as cloudinary } from 'cloudinary';

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

export default cloudinary;
