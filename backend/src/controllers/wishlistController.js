import { getWishlistService, togglewishlistService } from "../services/wishlistService.js";

export const getWishlistController = async (req, res) => {
    try {
        const wishlist = await getWishlistService(req.user._id);

        res.status(200).json({
            success: true,
            wishlist: wishlist || { product: [] } // ફ્રન્ટએન્ડ 'wishlist' કી એક્સપેક્ટ કરે છે
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const togglewishlistController = async (req, res) => {
    try {
        const wishlist = await togglewishlistService(
            req.user._id,
            req.body.productId
        );

        res.status(200).json({
            success: true,
            message: "Wishlist Updated",
            wishlist: wishlist // ડેટા સીધો મોકલો જેથી ફ્રન્ટએન્ડ અપડેટ થાય
        });

    } catch (error) {
        // અહીં 'res.json' મોકલવું જરૂરી છે
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};