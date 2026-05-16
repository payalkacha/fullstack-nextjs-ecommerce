import { addToCartService, clearCartService, getCartService, removeService, updateService } from "../services/cartService.js";

// Add to Cart
export const addToCartController = async (req, res, next) => {
    try {
        const cart = await addToCartService(
            req.user._id,
            req.body.productId
        );
        res.status(200).json({
            success: true,
            message: "Add To Cart",
            data: cart
        });
    } catch (error) {
        res.status(400);
        next(error);
    }
};

// Remove Cart
export const removeController = async (req, res, next) => {
    try {
        const cart = await removeService(
            req.user._id,
            req.params.productId
        );
        res.status(200).json({
            success: true,
            message: "Product remove",
            data: cart
        });
    } catch (error) {
        res.status(400);
        next(error);
    }
};

// Update Cart
export const updateController = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;
        const cart = await updateService(
            req.user._id,
            productId,
            quantity
        );
        res.status(200).json({
            success: true,
            message: "Update To Cart",
            data: cart
        });
    } catch (error) {
        res.status(400);
        next(error);
    }
};

// Get Cart
export const getCartController = async (req, res, next) => {
    try {
        const cart = await getCartService(req.user._id);
        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        res.status(400);
        next(error);
    }
};

// Clear Cart
export const clearCartController = async (req, res, next) => {
    try {
        const cart = await clearCartService(req.user._id);
        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        res.status(400);
        next(error);
    }
};