import streamifier from "streamifier";
import cloudinary from "../configs/cloudinary.js";

export const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        streamifier
            .createReadStream(fileBuffer)
            .pipe(stream);
    });
};