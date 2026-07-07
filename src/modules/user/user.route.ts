import { Router } from "express";
import { getUserProfileController } from "./user.controller.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

// Endpoint: GET /api/users/profile
// Protected route: Requires a valid JWT token
router.get("/profile", auth(), getUserProfileController);

export const UserRoutes = router;
