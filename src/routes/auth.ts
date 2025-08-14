import { Router } from "express";
import { auth, login, logout, signup } from "../controllers/auth";
import {
  validateDisplayName,
  validateEmail,
  validatePassword,
  validateUsername,
} from "../middlewares/formValidation";
import { authenticateToken } from "../middlewares/auth";

export const authRoutes: Router = Router();

authRoutes.post("/", authenticateToken, auth);

authRoutes.post("/login", login);

authRoutes.post(
  "/signup",
  validateUsername,
  validateDisplayName,
  validateEmail,
  validatePassword,
  signup
);

authRoutes.post("/logout", authenticateToken, logout);
