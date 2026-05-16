import Wishlist from "../models/Wishlist.js";

export const getWishlistService = async (userId) => {
  try {
    return await Wishlist.findOne({ user: userId }).populate({
      path: "product",
      model: "Product",
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

export const togglewishlistService = async (userId, productId) => {
  try {
    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        product: [productId],
      });
    } else {
      const isExist = wishlist.product.some(
        (id) => id.toString() === productId.toString()
      );

      if (isExist) {
        wishlist.product = wishlist.product.filter(
          (id) => id.toString() !== productId.toString()
        );
      } else {
        wishlist.product.push(productId);
      }

      await wishlist.save();
    }

    return await Wishlist.findOne({ user: userId }).populate({
      path: "product",
      model: "Product",
    });

  } catch (error) {
    throw new Error(error.message);
  }
};