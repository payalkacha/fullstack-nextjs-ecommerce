import {
    createContactService,
    deleteContactService,
    getAllContactsService,
    updateContactStatusService,
    getUserContactsService // AA navi service add karvi padse
} from "../services/contactService.js";

// ✅ CREATE CONTACT (User Side)
export const createContact = async (req, res) => {
    try {
        // Name ane Email body mathi nai pan auth middleware mathi levana
        const { message, subject } = req.body;

        // Validation: Message khali na hovo joie
        if (!message) {
            return res.json({
                success: false,
                message: "Message is required!"
            });
        }

        const contact = await createContactService({
            user: req.user._id,        // Logged-in user ni ID
            name: req.user.name,       // Auth mathi automatic name
            email: req.user.email,     // Auth mathi automatic email
            message,
            subject: subject || "General Inquiry"
        });

        res.json({
            success: true,
            message: "Support request sent successfully",
            data: contact
        });

    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// ✅ GET USER SPECIFIC TICKETS (User Side)
export const getMyTickets = async (req, res) => {
    try {
        // Fakt eja tickets fetch thase je aa user e banavi hoy
        const tickets = await getUserContactsService(req.user._id);
        res.json({
            success: true,
            data: tickets
        });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// ✅ GET ALL (ADMIN ONLY)
export const getAllContacts = async (req, res) => {
    try {
        // Admin panel mate badhi tickets fetch karva
        const contacts = await getAllContactsService();
        res.json({
            success: true,
            data: contacts
        });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// ✅ UPDATE STATUS & ADMIN REPLY (Admin Side)
export const updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminReply } = req.body;

        // Admin jyare reply ape tyare status 'REPLIED' thai jase
        const updated = await updateContactStatusService(id, status, adminReply);

        res.json({
            success: true,
            message: "Admin response saved!",
            data: updated
        });

    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// ✅ DELETE TICKET
export const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteContactService(id);
        res.json({
            success: true,
            message: "Ticket removed"
        });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};