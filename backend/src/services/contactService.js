import Contact from "../models/Contact.js";

// CREATE
export const createContactService = async (data) => {
    return await Contact.create(data);
};

// USER TICKETS
export const getUserContactsService = async (userId) => {

    return await Contact.find({
        user: userId
    }).sort({ createdAt: -1 });

};

// ADMIN ALL CONTACTS
export const getAllContactsService = async () => {

    return await Contact.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 });

};

// UPDATE
export const updateContactStatusService = async (
    id,
    status,
    adminReply
) => {

    return await Contact.findByIdAndUpdate(
        id,
        {
            status,
            adminReply
        },
        {
            new: true,
            runValidators: true
        }
    );

};

// DELETE
export const deleteContactService = async (id) => {

    return await Contact.findByIdAndDelete(id);

};