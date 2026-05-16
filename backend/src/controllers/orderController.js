import Order from "../models/Order.js";
import {
    cancelOrderService,
    checkoutService,
    getAllOrderService,
    getMyOrdersService,
    getOrderService,
    getOrderTrackingService,
    razorpayService,
    updateStatusService,
    verifyPaymentService
} from "../services/orderService.js";

// Checkout
export const checkoutController = async (req, res) => {
    try {
        const order = await checkoutService(req.user._id, req.body);

        res.status(200).json({
            success: true,
            message: "Order Created",
            data: order
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Razorpay
export const razorpayController = async (req, res) => {
    try {
        const { orderId } = req.body;

        const razorpayOrder = await razorpayService(orderId);

        res.status(200).json({
            success: true,
            data: razorpayOrder
        });

    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Verify
export const verifyPaymentController = async (req, res) => {
    try {
        const order = await verifyPaymentService(req.body);

        res.status(200).json({
            success: true,
            message: "Payment Success",
            data: order
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Tracking
export const getTrackingController = async (req, res) => {
    try {
        const data = await getOrderTrackingService(req.params.id);

        res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update Status
export const updateStatusController = async (req, res) => {
    try {
        const order = await updateStatusService(req.params.id, req.body.status);

        res.status(200).json({
            success: true,
            message: "Update Status",
            data: order
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get Single
export const getOrderController = async (req, res) => {
    try {
        const order = await getOrderService(req.params.id);

        res.status(200).json({
            success: true,
            data: order
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// My Orders
export const getMyOrdersController = async (req, res) => {
    try {
        const orders = await getMyOrdersService(req.user._id);

        res.status(200).json({
            success: true,
            data: orders
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


//  CANCEL ORDER
export const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id;

        const updatedOrder = await cancelOrderService(orderId);

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            data: updatedOrder
        });

    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

export const getAllOrdersController = async (req, res) => {
    try {
        const orders = await getAllOrderService();
        res.status(200).send({
            success: true,
            data: orders,
        });
    } catch (error) {
        res.status(400).send({
            success: false,
            message: error.message
        });
    }
};