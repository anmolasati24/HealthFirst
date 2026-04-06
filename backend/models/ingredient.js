import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },

  aliases: {
    type: [String], // e.g. ["sucrose", "glucose"]
    default: [],
  },

  healthInfo: {
    overallRating: {
      type: Number,
      min: 0,
      max: 10,
      default: 5,
    },

    risks: {
      type: [String],
      default: [],
    },

    benefits: {
      type: [String],
      default: [],
    },

    diseases: {
      type: [String], // e.g. ["diabetes"]
      default: [],
    },

    allergies: {
      type: [String], // e.g. ["milk", "peanut"]
      default: [],
    },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Ingredient = mongoose.model("Ingredient", ingredientSchema);

export { Ingredient };