import mongoose from "mongoose";

// Sub-schema for individual items in the cart
const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
    },
    size: {
        type: String,
        enum: ["S", "M", "L", "XL", "XXL"],
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, "Quantity must be at least 1"],
        default: 1,
    },
    price: {
        type: Number,
        required: true,
        min: [0, "Price cannot be negative"],
    },
}, { _id: true });

// Main Cart Schema
const cartSchema = new mongoose.Schema(
    {
        // Each cart belongs to a specific user
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
            unique: true,
            index: true,
        },

        // List of products added to the cart
        products: [cartItemSchema],

        // Total amount for all items in the cart
        totalPrice: {
            type: Number,
            default: 0,
            min: [0, "Total price cannot be negative"],
        },
    },
    {
        timestamps: true,
    }
);

// Automatically update totalPrice before saving the cart

cartSchema.pre("save", function (next) {
    if (this.products && this.products.length > 0) {
        this.totalPrice = this.products.reduce(
            (total, item) => total + (item.price * item.quantity),
            0
        );
    } else {
        this.totalPrice = 0;
    }
    next();
});

const cartModel = mongoose.model("cart", cartSchema);

export default cartModel;