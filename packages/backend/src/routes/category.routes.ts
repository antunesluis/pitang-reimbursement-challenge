import { Router } from "express";

import { Role } from "../../prisma/src/generated/prisma/enums.ts";
import { create, list, update } from "../controllers/category.controller.ts";
import { authMiddleware } from "../middlewares/auth.middleware.ts";
import { roleMiddleware } from "../middlewares/role.middleware.ts";
import { validate } from "../middlewares/validate.middleware.ts";
import { createCategorySchema, updateCategorySchema } from "../schemas/category.schema.ts";
import { paramsWithId } from "../schemas/common.schema.ts";

export const categoryRoutes = Router();

categoryRoutes.get("/", authMiddleware, list);

categoryRoutes.post(
  "/",
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  validate({ body: createCategorySchema }),
  create,
);

categoryRoutes.put(
  "/:id",
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  validate({ body: updateCategorySchema, params: paramsWithId }),
  update,
);
