import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },

            quantity: {
                type: Number,
                required: true
            }
        }
    ],

    totalPrice: {
        type: Number,
        required: true
    },

    paymentMethod: {
        type: String,
        enum: ["COD", "ONLINE"],
        required: true
    },

    // 🔥 ORDER STATUS
    status: {
        type: String,
        enum: ["Pending", "Confirmed", "Paid", "Shipped", "Delivered", "Cancelled"],
        default: "Pending",
    },

    // 🔥 PAYMENT STATUS (NEW)
    paymentStatus: {
        type: String,
        enum: ["PENDING", "PAID", "FAILED"],
        default: "PENDING"
    },

    // 🔥 BOOLEAN FLAG (NEW)
    isPaid: {
        type: Boolean,
        default: false
    },

    // 🔥 RAZORPAY DETAILS (NEW)
    razorpay: {
        paymentId: {
            type: String
        },
        orderId: {
            type: String
        },
        signature: {
            type: String
        }
    },

    // 🔥 SHIPPING INFO
    name: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: true
    },

    city: {
        type: String,
        required: true
    },

    pincode: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    }

}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;