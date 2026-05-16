import bcrypt from "bcryptjs";

export const comparePasswords = async (enterPassword, storePassword) => {
    return await bcrypt.compare(enterPassword, storePassword);
}