import {
    addReviewService,
    getReviewService,
    getAllReviewsAdminService,
    deleteReviewAdminService
} from "../services/reviewService.js";

export const addReviewController = async (req, res) => {
    try {
        const review = await addReviewService(req.user._id, req.body);
        res.status(201).json({ success: true, message: "Review added successfully", data: review });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getReviewController = async (req, res) => {
    try {
        const data = await getReviewService(req.params.productId);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Admin Controllers
export const getAllReviewsAdminController = async (req, res) => {
    try {
        const data = await getAllReviewsAdminService();
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteReviewAdminController = async (req, res) => {
    try {
        await deleteReviewAdminService(req.params.id);
        res.status(200).json({ success: true, message: "Review deleted by admin" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};