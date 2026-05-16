import {
    deleteProfilePicService,
    forgotService,
    getAllUsersService,
    getProfileService,
    loginService,
    logoutService,
    meService,
    otpVerifictionService,
    resetPasswordService,
    signupServices,
    updateProfileService
} from "../services/authService.js";

// Signup
export const signupController = async (req, res, next) => {
    try {
        const user = await signupServices(req.body);
        res.status(201).json({
            success: true,
            message: "Otp send in mail, please verify",
        });
    } catch (error) {
        res.status(400);
        next(error);
    }
};

// Login
export const loginController = async (req, res, next) => {
    try {
        const { user, token } = await loginService(req.body);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            message: "Login Successfully",
            user,
        });
    } catch (error) {
        res.status(400);
        next(error);
    }
};

// OTP Verified
export const otpVerifiedController = async (req, res, next) => {
    try {
        await otpVerifictionService(req.body);
        res.status(200).json({
            success: true,
            message: "OTP Verified Successfully",
        });
    } catch (error) {
        res.status(400);
        next(error);
    }
};

// Forgot Password
export const forgotController = async (req, res, next) => {
    try {
        await forgotService(req.body);
        res.status(200).json({
            success: true,
            message: "OTP Send to your email",
        });
    } catch (error) {
        res.status(400);
        next(error);
    }
};

// Reset Password
export const resetController = async (req, res, next) => {
    try {
        await resetPasswordService(req.body);
        res.status(200).json({
            success: true,
            message: "Reset Password Successfully",
        });
    } catch (error) {
        res.status(400);
        next(error);
    }
};

// ME CONTROLLER
export const meController = async (req, res, next) => {
    try {
        const user = await getProfileService(req.user.id);
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500);
        next(error);
    }
};

// LOGOUT CONTROLLER
export const logoutController = async (req, res, next) => {
    try {
        await logoutService();
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        res.status(500);
        next(error);
    }
};

// GET PROFILE
export const getProfileController = async (req, res, next) => {
    try {
        const user = await getProfileService(req.user.id);
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(400);
        next(error);
    }
};

// UPDATE PROFILE
export const updateProfileController = async (req, res, next) => {
    try {
        const file = req.file ? req.file : null;
        const updateData = { ...req.body };

        const updatedUser = await updateProfileService(
            req.user.id,
            updateData,
            file
        );

        res.status(200).json({
            success: true,
            message: "Profile Updated Successfully",
            user: updatedUser
        });
    } catch (error) {
        res.status(400);
        next(error);
    }
};

// DELETE PROFILE PIC CONTROLLER
export const deleteProfilePicController = async (req, res, next) => {
    try {
        const user = await deleteProfilePicService(req.user.id);
        res.status(200).json({
            success: true,
            message: "Profile picture deleted successfully",
            user
        });
    } catch (error) {
        res.status(400);
        next(error);
    }
};

// GET ALL USERS CONTROLLER
export const getAllUsersController = async (req, res, next) => {
    try {
        const users = await getAllUsersService();
        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        res.status(500);
        next(error);
    }
};