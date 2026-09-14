import dotenv from "dotenv";
dotenv.config();
import express from "express";

import connectDB from "./config/db.js";
import cors from "cors";
import userRoute from "./routes/userRoute.js";
import propertyRoute from "./routes/propertyRoute.js";
import applicationRoute from "./routes/applicationRoute.js";
import adminRoute from "./routes/adminRoute.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import favoriteRoutes from "./routes/favoriteRoute.js";
import bookingRoutes from "./routes/bookingRoute.js";
import notificationRoutes from "./routes/notificationRoute.js";
import reviewRoutes from "./routes/reviewRoute.js";
import contractRoute from "./routes/contractRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import maintenanceRoute from "./routes/maintenanceRoute.js";
import complaintRoute from "./routes/complaintRoute.js";

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// Routes
app.use("/api/v1/user", userRoute);

app.use("/api/v1/property", propertyRoute);
app.use("/api/v1/contract", contractRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/maintenance", maintenanceRoute);
app.use("/api/v1/complaint", complaintRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/favorite", favoriteRoutes);
app.use("/api/v1/booking", bookingRoutes);
app.use("/api/v1/notification", notificationRoutes);
app.use("/api/v1/review", reviewRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("RentEase API is running...");
});

// Database Connect
connectDB();

app.listen(PORT, () => {
  console.log(`Server is listening at port: ${PORT}`);
});
