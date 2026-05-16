import express from "express";
import { Protect } from "../middlewares/authMiddleware.js";
import { isAdminRole } from "../middlewares/roleMiddleware.js";
import { getDashboard } from "../controllers/adminController.js";


const adminrouter = express.Router();

adminrouter.get("/dashboard", Protect, isAdminRole, getDashboard);

export default adminrouter;