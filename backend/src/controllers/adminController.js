import { getDashboardService } from "../services/adminService.js";


export const getDashboard = async (req, res) => {
    try {
        const data = await getDashboardService();
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error: Could not fetch dashboard data"
        });
    }
};