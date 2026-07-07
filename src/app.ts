import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import { AuthRoutes } from "./modules/auth/auth.route.js";
import { UserRoutes } from "./modules/user/user.route.js";
import { CategoryRoutes } from "./modules/category/category.route.js";

const app: Application = express();

// Parsers & Middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth", AuthRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/categories", CategoryRoutes);

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
