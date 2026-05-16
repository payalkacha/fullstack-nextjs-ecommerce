import express from "express";
import { createController, deleteController, fetchOneController, getController, updateController } from "../controllers/productController.js";
import { Protect } from "../middlewares/authMiddleware.js";
import { isAdminRole } from "../middlewares/roleMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const productRouter = express.Router();

productRouter.post("/create",
    Protect,
    isAdminRole,
    upload.array("images", 5),
    createController);
productRouter.get("/get", getController);
productRouter.get("/fetch/:id", fetchOneController);
productRouter.put(
    "/update/:id",
    Protect,
    isAdminRole,
    upload.array("images", 5),
    updateController
);

productRouter.delete(
    "/delete/:id",
    Protect,
    isAdminRole,
    deleteController);

export default productRouter;



