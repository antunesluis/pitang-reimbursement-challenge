import { Router } from "express";

import { Role } from "../../prisma/src/generated/prisma/enums.ts";
import { create, list } from "../controllers/user.controller.ts";
import { authMiddleware } from "../middlewares/auth.middleware.ts";
import { roleMiddleware } from "../middlewares/role.middleware.ts";
import { validate } from "../middlewares/validate.middleware.ts";
import { createUserSchema } from "../schemas/user.schema.ts";

export const userRoutes = Router();

userRoutes.post("/", validate({ body: createUserSchema }), create);
userRoutes.get("/", authMiddleware, roleMiddleware([Role.ADMIN]), list);
