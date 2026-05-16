import express from "express";
import { Protect } from "../middlewares/authMiddleware.js";
import { cancelOrder, checkoutController, getAllOrdersController, getMyOrdersController, getOrderController, getTrackingController, razorpayController, updateStatusController, verifyPaymentController } from "../controllers/orderController.js";
import { isAdminRole } from "../middlewares/roleMiddleware.js";

const orderrouter = express.Router();

orderrouter.post("/checkout", Protect, checkoutController);
orderrouter.post("/razorpay", Protect, razorpayController);
orderrouter.post("/verify", Protect, verifyPaymentController);
orderrouter.get("/my-orders", Protect, getMyOrdersController);
orderrouter.get("/all-orders", Protect, isAdminRole, getAllOrdersController)
orderrouter.get("/tracking/:id", getTrackingController);
orderrouter.post("/status/:id", Protect, isAdminRole, updateStatusController);
orderrouter.get("/:id", Protect, getOrderController);
orderrouter.put("/cancel/:id", Protect, cancelOrder);

export default orderrouter;