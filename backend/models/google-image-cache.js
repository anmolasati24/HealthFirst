import mongoose from "mongoose";

const googleImageCacheSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
  },
  queryKey: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  error: {
    type: String,
    default: null,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 },
  },
}, {
  timestamps: true,
});

export const GoogleImageCache =
  mongoose.models.GoogleImageCache ||
  mongoose.model("GoogleImageCache", googleImageCacheSchema);
