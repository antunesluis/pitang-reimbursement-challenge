import { Router } from "express";

import { login, me } from "../controllers/auth.controller.ts";
import { authMiddleware } from "../middlewares/auth.middleware.ts";
import { validate } from "../middlewares/validate.middleware.ts";
import { loginSchema } from "../schemas/auth.schema.ts";

export const authRoutes = Router();

authRoutes.post("/login", validate({ body: loginSchema }), login);
authRoutes.get("/me", authMiddleware, me);
