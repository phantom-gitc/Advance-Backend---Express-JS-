import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },

    price: {
      amount: {
        type: Number,
        required: true,
        min: [1, "Price must be at least 1"],
        max: [10000000, "Price cannot exceed 10,000,000"],
      },

      currency: {
        type: String,
        required: true,
        enum: ["USD", "INR", "EUR"],
        default: "USD",
      },
    },

    sizes: {
      type: [String],
      required: true,
      enum: ["XS", "S", "M", "L", "XL", "XXL"],
      default: ["M"],
    },

    sizeStock: [
      {
        size: {
          type: String,
          enum: ["XS", "S", "M", "L", "XL", "XXL"],
        },
        stock: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],

    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      max: [1000, "Stock cannot exceed 1000"],
      default: 0,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (val) {
          return val.length <= 5;
        },
        message: "A maximum of 5 images can be stored",
      },
    },

    category: {
      type: String,
      trim: true,
      default: "Shirts (Topwear)",
      index: true,
    },

    subCategory: {
      type: String,
      trim: true,
      default: "Casual & Resort Wear",
      index: true,
    },

    isUnlisted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// High-performance compound indexes for catalog browsing and seller dashboard
productSchema.index({ isUnlisted: 1, createdAt: -1 });
productSchema.index({ isUnlisted: 1, category: 1, subCategory: 1, createdAt: -1 });
productSchema.index({ seller: 1, createdAt: -1 });

const productModel = mongoose.model("product", productSchema);

export default productModel;
