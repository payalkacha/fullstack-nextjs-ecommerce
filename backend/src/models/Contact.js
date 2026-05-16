import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
    {
        // LOGIN USER
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // AUTO FROM USER ACCOUNT
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        // MESSAGE
        message: {
            type: String,
            required: true
        },

        // SUBJECT
        subject: {
            type: String,
            trim: true,
            default: "General Inquiry"
        },

        // STATUS
        status: {
            type: String,
            enum: ["NEW", "REPLIED"],
            default: "NEW"
        },

        // ADMIN REPLY
        adminReply: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const Contact =
    mongoose.models.Contact ||
    mongoose.model("Contact", contactSchema);

export default Contact;