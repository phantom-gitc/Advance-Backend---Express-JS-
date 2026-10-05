import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";




// Add to Cart Controller 

export const addToCart = async (req, res) => {

    try {

        const { productId, size, quantity = 1, price } = req.body;
        const userId = req.user.userId || req.user._id;

        // Check If product Exist Or Not 
        const product = await productModel.findById(productId);

        // If product not exist or is unlisted throw error 
        if (!product || product.isUnlisted) {
            return res.status(404).json({
                message: "Product Not Found or has been unlisted"
            });
        }

        // Check If Size Valid Or Not 
        const isSizeValid = product.sizes.includes(size);

        // If Size not exist throw error 
        if (!isSizeValid) {
            return res.status(400).json({
                message: "Invalid Size"
            });
        }

        // Check size-specific stock if configured, otherwise overall stock
        let availableStock = product.stock;
        if (Array.isArray(product.sizeStock) && product.sizeStock.length > 0) {
            const sizeStockEntry = product.sizeStock.find((s) => s.size === size);
            if (sizeStockEntry) {
                availableStock = sizeStockEntry.stock;
            }
        }

        // Check if size is currently out of stock (Requirement 6)
        if (availableStock <= 0) {
            return res.status(400).json({
                message: `Size ${size} is currently Unavailable (out of stock)`
            });
        }

        // Check If Stock Exist Or Not 
        if (availableStock < quantity) {
            return res.status(400).json({
                message: `Insufficient Stock. Available Stock : ${availableStock}`
            });
        }

        // Find user cart
        let cart = await cartModel.findOne({ user: userId });

        if (!cart) {
            // Create New Cart if not exist
            cart = new cartModel({
                user: userId,
                products: []
            });
        }

        // Check if item already exist in cart
        const productInCart = cart.products.find((item) =>
            item.product.toString() === productId && item.size === size
        );

        // If item already exist, update quantity
        if (productInCart) {

            if (productInCart.quantity + quantity > availableStock) {
                return res.status(400).json({
                    message: `Insufficient Stock. Available Stock : ${availableStock}`
                });
            }

            productInCart.quantity += quantity;

            await cart.save();

            return res.status(200).json({
                message: "Item Quantity Updated Successfully"
            });
        }

        // Add New Item to cart
        const itemPrice = price || product.price.amount;

        cart.products.push({
            product: productId,
            size,
            quantity,
            price: itemPrice
        });

        await cart.save();

        return res.status(200).json({
            message: "Item Added Successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Internal Server Error"
        });
    }
};


// Get Cart Controller 

export const getCart = async (req, res) => {

    try {

        const userId = req.user.userId || req.user._id;

        // Find user cart and populate product details
        const cart = await cartModel.findOne({ user: userId }).populate("products.product");

        // If cart not exist 
        if (!cart) {
            return res.status(404).json({
                message: "Cart Not Found"
            });
        }

        return res.status(200).json({
            message: "Cart Fetched Successfully",
            cart
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Internal Server Error"
        });
    }
};


// Update Cart Item Quantity Controller 

export const updateCartItem = async (req, res) => {
    try {
        const { productId, size, quantity } = req.body;
        const userId = req.user.userId || req.user._id;

        const cart = await cartModel.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                message: "Cart Not Found",
            });
        }

        const productInCart = cart.products.find(
            (item) => item.product.toString() === productId && item.size === size
        );

        if (!productInCart) {
            return res.status(404).json({
                message: "Item not found in cart",
            });
        }

        // Verify product & available stock
        const product = await productModel.findById(productId);
        if (!product || product.isUnlisted) {
            return res.status(404).json({
                message: "Product Not Found or has been unlisted",
            });
        }

        let availableStock = product.stock;
        if (Array.isArray(product.sizeStock) && product.sizeStock.length > 0) {
            const sizeStockEntry = product.sizeStock.find((s) => s.size === size);
            if (sizeStockEntry) {
                availableStock = sizeStockEntry.stock;
            }
        }

        if (quantity > availableStock) {
            return res.status(400).json({
                message: `Insufficient Stock. Available Stock : ${availableStock}`,
            });
        }

        productInCart.quantity = quantity;
        await cart.save();

        return res.status(200).json({
            message: "Cart Item Updated Successfully",
            cart,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Internal Server Error",
        });
    }
};


// Remove Item from Cart Controller 

export const removeFromCart = async (req, res) => {
    try {
        const { productId, size } = req.body;
        const userId = req.user.userId || req.user._id;

        const cart = await cartModel.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                message: "Cart Not Found",
            });
        }

        const initialLength = cart.products.length;
        cart.products = cart.products.filter(
            (item) => !(item.product.toString() === productId && item.size === size)
        );

        if (cart.products.length === initialLength) {
            return res.status(404).json({
                message: "Item not found in cart",
            });
        }

        await cart.save();

        return res.status(200).json({
            message: "Item Removed from Cart Successfully",
            cart,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Internal Server Error",
        });
    }
};


// Clear Cart Controller 

export const clearCart = async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;

        const cart = await cartModel.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                message: "Cart Not Found",
            });
        }

        cart.products = [];
        await cart.save();

        return res.status(200).json({
            message: "Cart Cleared Successfully",
            cart,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Internal Server Error",
        });
    }
};

