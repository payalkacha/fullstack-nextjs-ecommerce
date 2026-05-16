import crypto from "crypto";
import { razorpay } from "../configs/razorpay.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// CHECKOUT SERVICE

export const checkoutService = async (userId, data) => {
    const {
        paymentMethod,
        name,
        address,
        city,
        pincode,
        phone,
        productId
    } = data;

    let items = [];

    // BUY NOW
    if (productId) {
        const product = await Product.findById(productId);
        if (!product) throw new Error("Product not found");

        items = [{
            product: product._id,
            quantity: 1
        }];
    }
    // CART
    else {
        const cart = await Cart.findOne({ user: userId });

        if (!cart || cart.items.length === 0) {
            throw new Error("Cart is empty");
        }

        items = cart.items;
    }

    // TOTAL
    const productIds = items.map(i => i.product);

    const products = await Product.find({
        _id: { $in: productIds }
    });

    let totalPrice = 0;

    items.forEach(item => {
        const product = products.find(
            p => p._id.toString() === item.product.toString()
        );

        if (!product) throw new Error("Product missing");

        totalPrice += Number(product.price) * Number(item.quantity);
    });

    if (totalPrice <= 0) throw new Error("Invalid total");

    for (let item of items) {
        const product = await Product.findById(item.product);

        if (!product) {
            throw new Error("Product not found");
        }

        if (product.stock < item.quantity) {
            throw new Error("Out of stock");
        }
    }

    // CREATE ORDER
    const order = await Order.create({
        user: userId,
        items,
        totalPrice,

        paymentMethod,
        paymentStatus: "PENDING",
        isPaid: false,

        // STATUS FLOW
        status: paymentMethod === "COD" ? "Confirmed" : "Pending",

        name,
        address,
        city,
        pincode,
        phone
    });

    // STOCK UPDATE 
    for (let item of items) {
        await Product.findByIdAndUpdate(
            item.product,
            {
                $inc: { stock: -item.quantity }
            }
        );
    }


    // COD → CLEAR CART
    if (!productId && paymentMethod === "COD") {
        await Cart.updateOne(
            { user: userId },
            { $set: { items: [] } }
        );
    }

    return order;
};

// RAZORPAY

export const razorpayService = async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    const amount = Math.round(Number(order.totalPrice) * 100);

    if (!amount || isNaN(amount) || amount < 100) {
        throw new Error("Invalid amount");
    }

    const razorpayOrder = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt: order._id.toString()
    });

    return razorpayOrder;
};

// VERIFY PAYMENT

export const verifyPaymentService = async (data) => {
    const {
        orderId,
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature
    } = data;

    if (!orderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        throw new Error("Missing payment data");
    }
    const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

    if (generatedSignature !== razorpay_signature) {
        throw new Error("Invalid signature");
    }

    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    if (order.isPaid) return order;

    // FINAL PAYMENT UPDATE
    order.paymentStatus = "PAID";
    order.isPaid = true;
    order.status = "Paid";
    order.razorpay = {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        signature: razorpay_signature
    };

    await order.save();

    // CLEAR CART AFTER PAYMENT
    if (order.paymentMethod === "ONLINE") {
        await Cart.updateOne(
            { user: order.user },
            { $set: { items: [] } }
        );
    }

    return order;
};

// ORDER TRACKING 

export const getOrderTrackingService = async (orderId) => {
    const order = await Order.findById(orderId);

    if (!order) throw new Error("Order not found");

    const steps = ["Pending", "Confirmed", "Paid", "Shipped", "Delivered"];

    const currentIndex = steps.includes(order.status)
        ? steps.indexOf(order.status)
        : 0;

    const timeLine = steps.map(step => ({
        step,
        done: steps.indexOf(step) <= currentIndex
    }));

    return {
        orderId: order._id,
        status: order.status,
        timeLine
    };
};

// GET MY ORDERS

export const getMyOrdersService = async (userId) => {
    return await Order.find({ user: userId })
        .populate("items.product")
        .sort({ createdAt: -1 });
};

// GET SINGLE ORDER


export const getOrderService = async (orderId) => {
    const order = await Order.findById(orderId)
        .populate("items.product");

    if (!order) throw new Error("Order not found");

    return order;
};

// UPDATE STATUS (ADMIN)

export const updateStatusService = async (orderId, status) => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    order.status = status;
    await order.save();

    return order;
};

// CANCEL ORDER

export const cancelOrderService = async (orderId) => {
    const order = await Order.findById(orderId);

    if (!order) throw new Error("Order not found");

    if (order.status === "Delivered") {
        throw new Error("Cannot cancel delivered");
    }

    if (order.status === "Cancelled") {
        throw new Error("Already cancelled");
    }

    if (order.isPaid) {
        order.paymentStatus = "REFUND_PENDING"; // future use
    }

    order.status = "Cancelled";
    order.cancelledAt = new Date();

    await order.save();
    return order;
};

// Get Orders

export const getAllOrderService = async () => {
    const orders = await Order.find({})
        .populate("user", "name email") 
        .populate("items.product")
        .sort({ createdAt: -1 })
        .lean();

    return orders;
};