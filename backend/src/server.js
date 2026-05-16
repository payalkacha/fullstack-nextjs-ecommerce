import dotenv from "dotenv";
dotenv.config();
console.log("EMAIL_USER CHECK:", process.env.BREVO_USER);

import app from "./app.js";
import connectDB from "./configs/db.js";


const PORT = process.env.PORT || 8000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server is running in Port ${PORT}`);
        });

    } catch (error) {
        console.log("Server Start Failed", error);
    }
};

startServer();