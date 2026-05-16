import express from "express";
import { Protect } from "../middlewares/authMiddleware.js";
import { getWishlistController, togglewishlistController } from "../controllers/wishlistController.js";

const wishrouter = express.Router();

wishrouter.get("/get", Protect, getWishlistController);

wishrouter.post("/toggle", Protect, togglewishlistController);

export default wishrouter; 