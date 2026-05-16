import express from "express";
import { Protect } from "../middlewares/authMiddleware.js"; 
import {
    addReviewController,
    getReviewController,
    getAllReviewsAdminController,
    deleteReviewAdminController
} from "../controllers/reviewController.js";
import { isAdminRole } from "../middlewares/roleMiddleware.js";

const reviewrouter = express.Router();

// User Routes
reviewrouter.post("/add", Protect, addReviewController);
reviewrouter.get("/get/:productId", getReviewController);

// Admin Routes 
reviewrouter.get("/admin/all", Protect, isAdminRole, getAllReviewsAdminController);
reviewrouter.delete("/admin/delete/:id", Protect, isAdminRole, deleteReviewAdminController);

export default reviewrouter;