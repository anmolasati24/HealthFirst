import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (base64File) => {
  try {
    // ✅ Guard against undefined
    if (!base64File) {
      console.log("⚠️ Cloudinary: No file provided");
      return null;
    }

    let clean = base64File;

    // ✅ Handle Buffer — convert to base64 string
    if (Buffer.isBuffer(clean)) {
      clean = clean.toString("base64");
    }

    // ✅ Strip prefix if present
    if (clean.includes("base64,")) {
      clean = clean.split("base64,")[1];
    }

    const dataUri = `data:image/jpeg;base64,${clean}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "purepick",
    });

    return result.secure_url;
  } catch (err) {
    console.log("❌ Cloudinary Error:", err.message);
    return null;
  }
};

export { uploadToCloudinary };