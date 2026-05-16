export const isAdminRole = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403);
        console.log("Access Deniend,Admin only");

    }


}