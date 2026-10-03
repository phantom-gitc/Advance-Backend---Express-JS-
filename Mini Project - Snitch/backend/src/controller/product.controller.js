import productModel from "../models/product.model.js";
import { uploadToImageKit } from "../services/imageKit.service.js";


// Create a product 

export const createProduct = async (req, res) => {
    try {
        const { title, description, price, sizes, stock } = req.body;
        const seller = req.user.userId;

        const files = req.files || [];
        if (files.length > 5) {
            return res.status(400).json({
                success: false,
                message: "A maximum of 5 images can be uploaded",
            });
        }

        // Upload images to ImageKit

        let imageUrls = [];
        if (files.length > 0) {
            imageUrls = await Promise.all(
                files.map((file) => uploadToImageKit(file, "/products"))
            );
        }

        // If string URLs were passed in body (e.g. from JSON payload), include them
        
        if (Array.isArray(req.body.images)) {
            imageUrls = [...imageUrls, ...req.body.images];
        }

        const product = await productModel.create({
            title,
            description,
            price,
            sizes,
            stock,
            seller,
            images: imageUrls,
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product,
        });
    } catch (error) {
        console.error("Error creating product:", error);

        if (error.name === "ValidationError") {
            const errorMessages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: errorMessages,
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error while creating product",
        });
    }
};


// Get all the products from the DB

export const getAllProducts = async ( req , res) =>{
    try {
        
        const products = await productModel.find()

        if(!products){
            return res.status(404).json({
                success: false,
                message: "No products found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            products,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error while fetching products",
        });
    }
}