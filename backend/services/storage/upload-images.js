import { uploadToCloudinary } from "./cloudinary.js";

// ✅ Accepts single base64 string, returns single URL
const uploadImages = async (base64File) => {
  try {
    const url = await uploadToCloudinary(base64File);
    return url;
  } catch (err) {
    console.log("❌ Upload failed:", err.message);
    return null;
  }
};

export { uploadImages };