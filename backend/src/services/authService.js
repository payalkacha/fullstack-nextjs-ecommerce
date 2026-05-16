import User from "../models/User.js";
import { comparePasswords } from "../utils/comparePassword.js";
import { generateOTP } from "../utils/genarateOtp.js";
import { genarateToken } from "../utils/generateToken.js";
import { hashPassword } from "../utils/hashPassword.js";
import { sendEmail } from "../utils/sendEmail.js";
import cloudinary from "../configs/cloudinary.js";
import streamifier from "streamifier";

// Signup 
export const signupServices = async (data) => {
    const { name, email, password } = data;

    // 1. Email check

    let role = "user"

    if (
        email === process.env.ADMIN_EMAIL &&
        password === process.env.ADMIN_PASSWORD
    ) {
        role = "admin";
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error("User Already Exits");
    }

    // 2. Password hash 
    const hashPasswords = await hashPassword(password);

    // 3. OTP Verifed

    const otp = generateOTP();

    const otpExpire = Date.now() + 10 * 60 * 1000;

    // 3. Create User

    const user = await User.create({
        name,
        email,
        password: hashPasswords,
        role,
        otp,
        otpExpire,
        isVerified: false
    })

    // Send Email
    // don't block signup flow
    sendEmail(email, "Verify Your Email - Cartify", otp)
        .then(() => console.log("OTP EMAIL SENT"))
        .catch(err => console.log("EMAIL ERROR:", err.message));



    return {
        _id: user._id,
        name: user.name,
        email: user.email
    };
}

// Login
export const loginService = async (data) => {
    const { email, password } = data;

    // 1. Email Find + Password
    const user = await User.findOne({ email }).select("+password")
    if (!user) {
        throw new Error("User Not Found");
    }

    // 2. Password Compare
    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) {
        throw new Error("Invaild Credident");
    }


    //3. OTP verified

    if (!user.isVerified) {
        throw new Error("Please Verifiy your email First");
    }

    //4. token genarte
    const token = await genarateToken(user.id)


    user.password = undefined;

    return { user, token };
}

// Email Verification

export const otpVerifictionService = async (data) => {
    const { email, otp } = data;

    const user = await User.findOne({ email })
    if (!user) {
        throw new Error("User Not Found");
    }

    if (user.otp !== otp.toString()) {
        throw new Error("Invaild OTP");
    }

    if (user.otpExpire < Date.now()) {
        throw new Error("OTP Exipred");
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpire = null;

    await user.save();

}

// Forgot Password

export const forgotService = async (data) => {
    const { email } = data;

    const user = await User.findOne({ email })
    if (!user) {
        throw new Error("User Not Found");
    }

    const otp = generateOTP();
    const otpExpire = Date.now() + 10 * 60 * 1000;

    user.otp = otp
    user.otpExpire = otpExpire

    await user.save();
    sendEmail(email, "Verify Your Email - Cartify", otp)
        .then(() => console.log("OTP SENT"))
        .catch(err => console.log("EMAIL ERROR:", err.message));



}

// Reset Password

export const resetPasswordService = async (data) => {
    const { email, otp, newPassword } = data;

    const user = await User.findOne({ email })
    if (!user) {
        throw new Error("User Not Found");
    }

    if (user.otp !== otp.toString()) {
        throw new Error("Invaild OTP");
    }

    if (user.otpExpire < Date.now()) {
        throw new Error("OTP Exipred");
    }

    const hashedPassword = await hashPassword(newPassword);

    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

}

// GET CURRENT USER
export const meService = async (user) => {
    return user; // middleware already user aapi dese
};

// LOGOUT SERVICE
export const logoutService = async () => {
    return true; // koi DB kaam nathi, just success
};

// GET PROFILE
export const getProfileService = async (userId) => {
    const user = await User.findById(userId).select("-password");
    if (!user) throw new Error("User Not Found");
    return user;
};

// UPDATE PROFILE 
export const updateProfileService = async (userId, data = {}, file) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User Not Found");

    // 1. new img upload kravi
    if (file && file.buffer) {
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "cartify_profiles" },
                (error, result) => error ? reject(error) : resolve(result)
            );
            streamifier.createReadStream(file.buffer).pipe(stream);
        });
        user.profilePic = result.secure_url;
    }

    const allowedUpdates = ["name", "phone", "address", "gender", "occupation", "city", "state"];

    allowedUpdates.forEach((field) => {

        if (data[field] !== undefined && data[field] !== null && data[field] !== "") {
            user[field] = data[field];
        }
    });

    await user.save();
    return user;
};

// DELETE PROFILE PICTURE SERVICE (Fixed Public ID)
export const deleteProfilePicService = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User Not Found");

    if (user.profilePic && user.profilePic !== "") {
        try {
            const parts = user.profilePic.split('/');
            const fileName = parts.pop().split('.')[0];
            const folderName = parts.pop();
            const publicId = `${folderName}/${fileName}`;

            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            console.log("Cloudinary Delete Error:", error.message);
        }

        user.profilePic = ""; // DB Ma clear karo
        await user.save();
    }

    return user;
};

// GET ALL USERS (Admin Only)
export const getAllUsersService = async () => {
    // all users password vagar fetch
    const users = await User.find().sort({ createdAt: -1 }).select("-password");
    return users;
};
