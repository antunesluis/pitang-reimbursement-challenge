import { Router } from "express"
import { create, list } from "../controllers/user.controller.ts"
import { validate } from "../middlewares/validate.middleware.ts"
import { createUserSchema } from "../schemas/user.schema.ts"

export const userRoutes = Router()

userRoutes.post("/", validate({ body: createUserSchema }), create)
userRoutes.get("/", list)
