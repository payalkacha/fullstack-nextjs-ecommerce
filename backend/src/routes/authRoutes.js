import express from "express";
import { deleteProfilePicController, forgotController, getAllUsersController, getProfileController, loginController, logoutController, meController, otpVerifiedController, resetController, signupController, updateProfileController } from "../controllers/authController.js";
import { Protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
const authRouter = express.Router();

authRouter.post("/signup", signupController);
authRouter.post("/login", loginController);
authRouter.post("/verify", otpVerifiedController);
authRouter.post("/forgot", forgotController);
authRouter.post("/reset", resetController);
authRouter.get("/me", Protect, meController);
authRouter.post("/logout", logoutController);
authRouter.get("/profile", Protect, getProfileController);
authRouter.put("/update-profile",
    Protect,
    upload.single("image"),
    updateProfileController
)
authRouter.delete("/delete-profile-pic", Protect, deleteProfilePicController);
authRouter.get("/users", Protect, getAllUsersController);

export default authRouter;