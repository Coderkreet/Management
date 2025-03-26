import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import FileSystem from 'fs';

dotenv.config();

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
});

const uploadResult = async (filePath) => {
  if (!filePath) {
    throw new Error("File path is required for upload");
  }

  try {
    const result = await cloudinary.uploader.upload(filePath);
    FileSystem.unlinkSync(filePath); // Ensure filePath is valid before deleting
    return result;
  } catch (error) {
    if (filePath) {
      FileSystem.unlinkSync(filePath); // Ensure filePath is valid before deleting
    }
    console.error("Error uploading file:", error);
    throw new Error("Error uploading file");
  }
};

export default uploadResult;