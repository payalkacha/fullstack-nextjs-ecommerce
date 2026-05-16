import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

export const getDashboardService = async () => {
    try {
        // 1. Basic Counts
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();

        // 2. Total Revenue Calculation
        const revenueData = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalPrice" }
                }
            }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        // 3. Status Counts (Database ના CAPITAL keys મુજબ)
        const paidOrders = await Order.countDocuments({ status: "Paid" });
        const confirmedOrders = await Order.countDocuments({ status: "Confirmed" });
        const shippedOrders = await Order.countDocuments({ status: "Shipped" });
        const deliveredOrders = await Order.countDocuments({ status: "Delivered" });
        const cancelledOrders = await Order.countDocuments({ status: "Cancelled" });

        // 4. Low Stock Alert (સ્ટોક 10 થી ઓછો હોય તેવા ટોપ 5 પ્રોડક્ટ્સ)
        const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
            .select("name stock")
            .limit(5);

        // 5. Recent Orders for Table
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("user", "name email");

        // 6. Dynamic Sales Graph Logic (છેલ્લા 7 દિવસનું Real-time વેચાણ)
        const startOfSevenDays = new Date();
        startOfSevenDays.setDate(startOfSevenDays.getDate() - 6);
        startOfSevenDays.setHours(0, 0, 0, 0);

        const salesStats = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfSevenDays },
                    status: { $ne: "Cancelled" } // કેન્સલ થયેલા ઓર્ડર રેવન્યુમાં ન ગણાય
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalSales: { $sum: "$totalPrice" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // ગ્રાફ માટે 7 દિવસનો એરે તૈયાર કરવો (જો કોઈ દિવસે 0 ઓર્ડર હોય તો પણ ગ્રાફ જળવાઈ રહે)
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const salesGraph = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = days[d.getDay()];

            const found = salesStats.find(s => s._id === dateStr);
            salesGraph.push({
                n: dayName,
                s: found ? found.totalSales : 0
            });
        }

        // બધો ડેટા એકસાથે રિટર્ન કરવો
        return {
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue,
            paidOrders,
            confirmedOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders,
            lowStockProducts,
            recentOrders,
            salesGraph
        };

    } catch (error) {
        console.error("Dashboard Service Error:", error);
        throw new Error("Failed to fetch dashboard statistics");
    }
};