import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Cloudinary will automatically use the CLOUDINARY_URL environment variable
// if it is available. No explicit config is needed if the URL is set.

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'amora-hub-profiles',
    allowed_formats: ['jpeg', 'png', 'jpg'],
    // transformation: [{ width: 500, height: 500, crop: 'limit' }]
  },
});

export { cloudinary, storage };