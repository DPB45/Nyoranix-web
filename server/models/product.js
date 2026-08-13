const mongoose = require('mongoose');

// === 1. DEFINE REVIEW SCHEMA (Required for Reviews to work) ===
const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    // Allows users to like reviews
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  {
    timestamps: true,
  }
);

// === 2. DEFINE PRODUCT SCHEMA ===
const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    images: [{ type: String }],
    brand: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String },

    // New Fields you added
    shortDescription: { type: String },
    description: { type: String, required: true },

    features: [{ type: String }], // Key Highlights

    specifications: [{
      key: { type: String },
      value: { type: String }
    }],

    otherSpecifications: [{
      key: { type: String },
      value: { type: String }
    }],

    // === CRITICAL: This was missing! ===
    reviews: [reviewSchema],
    // ==================================

    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },

    // Price Fields
    price: { type: Number, required: true, default: 0 },
    priceExclGST: { type: Number, default: 0 },
    gst: { type: Number, default: 18 },

    countInStock: { type: Number, required: true, default: 0 },
    // Admin-controlled flag - shown in the homepage "New Arrivals" section when true
    isNewArrival: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;