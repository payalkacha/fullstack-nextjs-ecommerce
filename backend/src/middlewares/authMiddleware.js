import jwt from "jsonwebtoken";
import User from "../models/User.js";


export const Protect = async (req, res, next) => {
    let token;
  
    // 1. Cookie token get
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        res.status(401);
        throw new Error("Not Authrozied");
    }

    try {
        //  2.verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. get user
        req.user = await User.findById(decoded.id).select("-password")
        next();

    } catch (error) {
        res.status(401);
        throw new Error("token failed");
    }
}