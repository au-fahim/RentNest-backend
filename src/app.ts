import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import { AuthRoutes } from "./modules/auth/auth.route.js";
import { UserRoutes } from "./modules/user/user.route.js";
import { CategoryRoutes } from "./modules/category/category.route.js";
import { PropertyRoutes } from "./modules/property/property.route.js";
import { RentalRequestRoutes } from "./modules/rentalRequest/rentalRequest.route.js";
import { PaymentRoutes } from "./modules/payment/payment.route.js";

const app: Application = express();

// Parsers & Middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth", AuthRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/categories", CategoryRoutes);
app.use("/api/properties", PropertyRoutes);
app.use("/api/requests", RentalRequestRoutes);

app.use("/api/payments", PaymentRoutes);

// Root / Test Route
app.get("/", (req: Request, res: Response) => {
  res.send("RentNest API is running properly!");
});

// 404 Not Found Handler (Catches all unmatched routes)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    errorDetails: `Cannot find ${req.originalUrl} on this server`,
  });
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
