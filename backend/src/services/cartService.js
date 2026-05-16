import Cart from "../models/Cart.js";

export const addToCartService = async (userId, productId) => {

    // 1. Find cart
    let cart = await Cart.findOne({ user: userId });

    // 2. If cart not exist → create
    if (!cart) {
        cart = await Cart.create({
            user: userId,
            items: [{ product: productId, quantity: 1 }],
        });

        return cart;
    }

    // 3. Check product already exists
    const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
        // 4. Increase quantity
        cart.items[itemIndex].quantity += 1;
    } else {
        // 5. Add new product
        cart.items.push({ product: productId, quantity: 1 });
    }

    await cart.save();

    return cart;
};

// Remove Cart

export const removeService = async (userId, productId) => {

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
        throw new Error("Cart not found");
    }

    cart.items = cart.items.filter((item) => {

        const id = item.product._id
            ? item.product._id.toString()
            : item.product.toString();

        return id !== productId;
    });

    await cart.save();

    return cart;
};

// Update Cart

export const updateService = async (userId, productId, quantity) => {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
        throw new Error("Cart not found");
    }

    const item = cart.items.find(
        (item) => item.product.toString() === productId
    );

    if (!item) {
        throw new Error("Product not in cart");

    }
    item.quantity = quantity;

    await cart.save();

    return cart;
}

// Get cart

export const getCartService = async (userId) => {
    const cart = await Cart.findOne({ user: userId })
        .populate("items.product");

    return cart;
};

// Clear

export const clearCartService = async (userId) => {
    return await Cart.findOneAndUpdate(
        { user: userId },
        { $set: { items: [] } },
        { new: true }
    );
    return cart;
};