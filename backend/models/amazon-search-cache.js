import mongoose from "mongoose";

const amazonSearchCacheSchema = new mongoose.Schema({
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
  response: {
    total_products: Number,
    products: [mongoose.Schema.Types.Mixed],
    query: String,
    error: String,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 },
  },
}, {
  timestamps: true,
});

export const AmazonSearchCache =
  mongoose.models.AmazonSearchCache ||
  mongoose.model("AmazonSearchCache", amazonSearchCacheSchema);
