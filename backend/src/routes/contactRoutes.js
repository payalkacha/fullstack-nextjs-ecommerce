
import express from "express";
import { createContact, deleteContact, getAllContacts, getMyTickets, updateContactStatus } from "../controllers/contactController.js";
import { Protect } from "../middlewares/authMiddleware.js"
const contactrouter = express.Router();

// USER
contactrouter.post("/create", Protect, createContact);
contactrouter.get("/my-tickets", Protect, getMyTickets);
// ADMIN
contactrouter.get("/all", Protect, getAllContacts);
contactrouter.put("/update/:id", Protect, updateContactStatus);
contactrouter.delete("/delete/:id", Protect, deleteContact);

export default contactrouter;