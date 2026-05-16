import Product from "../models/Product.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import mongoose from "mongoose";

// Create Product
export const createService = async (data, files, userId) => {

    let imageUrls = [];

    if (files && files.length > 0) {
        for (let file of files) {
            const result = await uploadToCloudinary(file.buffer);
            imageUrls.push(result.secure_url);
        }
    }

    const product = await Product.create({
        ...data,
        images: imageUrls, // array store kar
        createdBy: userId
    });

    return product;
};

// Get nd Peginastion 

export const getService = async (query) => {
    const page = Number(query.page) || 1;
    const isAll = query.all === "true";

    const limit = isAll ? 0 : Number(query.limit) || 10;
    const skip = isAll ? 0 : (page - 1) * limit;

    const filter = {};

    if (query.search) {
        filter.name = { $regex: query.search, $options: "i" };
    }

    if (query.category) {
        filter.category = { $regex: `^${query.category}$`, $options: "i" };
    }

    if (query.minPrice || query.maxPrice) {
        filter.price = {};
        if (query.minPrice) filter.price.$gte = Number(query.minPrice);
        if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
    }

    let sort = { createdAt: -1 }; // Default new product
    if (query.sort === "price") sort = { price: 1 };
    if (query.sort === "-price") sort = { price: -1 };
    if (query.sort === "new") sort = { createdAt: -1 };

    let queryBuilder = Product.find(filter).sort(sort);

    if (!isAll) {
        queryBuilder = queryBuilder.skip(skip).limit(limit);
    }

    const products = await queryBuilder;
    const total = await Product.countDocuments(filter);

    return {
        products,
        total,
        page,
        totalPages: isAll ? 1 : Math.ceil(total / limit)
    };
};

// Fetch One Product 

export const fetchOneService = async (id) => {
    // 1. Check valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid product ID");
    }

    const product = await Product.findById(id)

    if (!product) {
        throw new Error("Product Not Found");
    }

    return product;
}

export const updateService = async (id, data, files) => {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid Product ID");
    }

    const product = await Product.findById(id);

    if (!product) {
        throw new Error("Product Not Found");
    }

    let imageUrls = [...product.images];

    if (files && files.length > 0) {

        imageUrls = [];

        for (let file of files) {

            const result = await uploadToCloudinary(file.buffer);

            imageUrls.push(result.secure_url);
        }
    }

    product.name = data.name || product.name;
    product.description = data.description || product.description;
    product.price = data.price || product.price;
    product.category = data.category || product.category;
    product.stock = data.stock || product.stock;
    product.images = imageUrls;

    await product.save();

    return product;
};


export const deleteService = async (id) => {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid Product ID");
    }

    const product = await Product.findById(id);

    if (!product) {
        throw new Error("Product Not Found");
    }

    await product.deleteOne();

    return true;
};