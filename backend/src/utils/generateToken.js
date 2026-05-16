import jwt from "jsonwebtoken";

export const genarateToken = async (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: "2d" }
    )
}