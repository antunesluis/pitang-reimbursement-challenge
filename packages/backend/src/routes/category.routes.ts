import { Router } from "express";

import { Role } from "../../prisma/src/generated/prisma/enums.ts";
import { authMiddleware } from "../middlewares/auth.middleware.ts";
import { roleMiddleware } from "../middlewares/role.middleware.ts";

export const categoryRoutes = Router();

// TODO: implement controllers
categoryRoutes.get("/", authMiddleware, roleMiddleware([Role.ADMIN]), (_req, res) => {
  res.sendStatus(501);
});

categoryRoutes.post("/", authMiddleware, roleMiddleware([Role.ADMIN]), (_req, res) => {
  res.sendStatus(501);
});

categoryRoutes.put("/:id", authMiddleware, roleMiddleware([Role.ADMIN]), (_req, res) => {
  res.sendStatus(501);
});
