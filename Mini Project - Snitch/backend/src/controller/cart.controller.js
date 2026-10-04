import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";




// Add to Cart Controller 

export const addToCart = async (req, res) => {

    try {

        const { productId, size, quantity = 1, price } = req.body;
        const userId = req.user.userId || req.user._id;

        // Check If product Exist Or Not 
        const product = await productModel.findById(productId);

        // If product not exist throw error 
        if (!product) {
            return res.status(404).json({
                message: "Product Not Found"
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

        // Check If Stock Exist Or Not 
        if (product.stock < quantity) {
            return res.status(400).json({
                message: "Out Of Stock"
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

            if (productInCart.quantity + quantity > product.stock) {
                return res.status(400).json({
                    message: `Insufficient Stock. Available Stock : ${product.stock}`
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

