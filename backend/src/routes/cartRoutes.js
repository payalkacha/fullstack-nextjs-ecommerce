import express from "express";
import { Protect } from "../middlewares/authMiddleware.js";
import { addToCartController, clearCartController, getCartController, removeController, updateController } from "../controllers/cartController.js";

const cartRouter = express.Router();

cartRouter.post("/addtocart", Protect, addToCartController);
cartRouter.delete("/remove/:productId", Protect, removeController);
cartRouter.put("/update", Protect, updateController);
cartRouter.get("/get", Protect, getCartController);
cartRouter.delete("/clear", Protect, clearCartController);

export default cartRouter;