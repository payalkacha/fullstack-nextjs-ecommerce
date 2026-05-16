import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import errorHandler from "./middlewares/errorMiddleware.js";
import authRouter from "./routes/authRoutes.js";
import productRouter from "./routes/productRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
import wishrouter from "./routes/wishlistRoutes.js";
import orderrouter from "./routes/orderRoutes.js";
import reviewrouter from "./routes/reviewRoutes.js";
import adminrouter from "./routes/adminRoutes.js";
import contactrouter from "./routes/contactRoutes.js";

const app = express();

app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());
app.use(helmet({
    crossOriginResourcePolicy: false, // img load no thathi hoy to 
}));
app.use(cors({
    origin: [
        "http://localhost:3000",
        process.env.ORIGIN,
    ].filter(Boolean),

    credentials: true
}));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100, //100 try
    message: { success: false, message: "Too many attempts, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
});

const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 મિનિટ
    max: 100,
    message: { success: false, message: "Server is busy, slow down!" },
});

// Api
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/product", generalLimiter, productRouter);
app.use("/api/cart", generalLimiter, cartRouter);
app.use("/api/wishlist", generalLimiter, wishrouter);
app.use("/api/order", generalLimiter, orderrouter);
app.use("/api/contact", generalLimiter, contactrouter)
app.use("/api/review", generalLimiter, reviewrouter);
app.use("/api/admin", generalLimiter, adminrouter);

// Middlware
app.use(errorHandler);

export default app;