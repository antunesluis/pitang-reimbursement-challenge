import { Router } from "express"

export const userRoutes = Router()

// TODO: implement controller and auth
userRoutes.post("/", (_req, res) => {
  res.sendStatus(501)
})

userRoutes.get("/", (_req, res) => {
  res.sendStatus(501)
})
