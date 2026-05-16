import Order from "../models/Order.js";
import Review from "../models/Review.js";
import Product from "../models/Product.js";

// Add Review (Only Once, No Update)
export const addReviewService = async (userId, data) => {
    const { product, rating, comment } = data;

    // 1. ચેક કરો કે યુઝરે આ પ્રોડક્ટ ખરીદી છે અને તે ડિલિવર થઈ ગઈ છે?
    const order = await Order.findOne({
        user: userId,
        status: "Delivered",
        "items.product": product
    });

    if (!order) {
        throw new Error("You can only review products you have purchased and received.");
    }

    // 2. ચેક કરો કે યુઝરે પહેલા રિવ્યૂ આપેલો છે? (Duplicate Check)
    const existingReview = await Review.findOne({ user: userId, product });
    if (existingReview) {
        throw new Error("You have already reviewed this product.");
    }

    // 3. નવો રિવ્યૂ બનાવો
    const review = await Review.create({
        user: userId,
        product,
        rating,
        comment
    });

    return review;
};

// Get Reviews for a specific product
export const getReviewService = async (productId) => {
    const reviews = await Review.find({ product: productId }).populate("user", "name");

    let avg = 0;
    if (reviews.length > 0) {
        const total = reviews.reduce((sum, r) => sum + r.rating, 0);
        avg = total / reviews.length;
    }

    return {
        reviews,
        averageRating: Number(avg.toFixed(1)) // 4.5 જેવું ફોર્મેટ રાખવા
    };
};

// Admin: Get All Reviews
export const getAllReviewsAdminService = async () => {
    return await Review.find()
        .populate("user", "name email")
        .populate("product", "name images")
        .sort({ createdAt: -1 });
};

// Admin: Delete a Review
export const deleteReviewAdminService = async (reviewId) => {
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) throw new Error("Review not found");
    return review;
};