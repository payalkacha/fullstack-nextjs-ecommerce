import { createService, deleteService, fetchOneService, getService, updateService } from "../services/productService.js";

// Create Product
export const createController = async (req, res, next) => {
    try {
        const product = await createService(req.body, req.files, req.user._id);
        res.status(201).json({
            success: true,
            message: "Product Created",
            data: product
        });
    } catch (error) {
        res.status(400);
        next(error);
    }
};

// Get Products
export const getController = async (req, res, next) => {
    try {
        const result = await getService(req.query);
        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(400);
        next(error);
    }
};

// Fetch One Product
export const fetchOneController = async (req, res, next) => {
    try {
        const product = await fetchOneService(req.params.id);
        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(400);
        next(error);
    }
};

// Update Product
export const updateController = async (req, res, next) => {
    try {
        const product = await updateService(
            req.params.id,
            req.body,
            req.files
        );
        res.status(200).json({
            success: true,
            message: "Product Updated",
            data: product
        });
    } catch (error) {
        res.status(400);
        next(error);
    }
};

// Delete Product
export const deleteController = async (req, res, next) => {
    try {
        await deleteService(req.params.id);
        res.status(200).json({
            success: true,
            message: "Product Deleted"
        });
    } catch (error) {
        res.status(400);
        next(error);
    }
};