import { Router } from "express";

import { authMiddleware } from "../middlewares/auth.middleware.ts";

export const reimbursementRoutes = Router();

// TODO: implement controllers with per-action role checks
reimbursementRoutes.use(authMiddleware);

reimbursementRoutes.get("/", (_req, res) => {
  res.sendStatus(501);
});

reimbursementRoutes.post("/", (_req, res) => {
  res.sendStatus(501);
});

reimbursementRoutes.get("/:id", (_req, res) => {
  res.sendStatus(501);
});

reimbursementRoutes.put("/:id", (_req, res) => {
  res.sendStatus(501);
});

reimbursementRoutes.post("/:id/submit", (_req, res) => {
  res.sendStatus(501);
});

reimbursementRoutes.post("/:id/approve", (_req, res) => {
  res.sendStatus(501);
});

reimbursementRoutes.post("/:id/reject", (_req, res) => {
  res.sendStatus(501);
});

reimbursementRoutes.post("/:id/pay", (_req, res) => {
  res.sendStatus(501);
});

reimbursementRoutes.post("/:id/cancel", (_req, res) => {
  res.sendStatus(501);
});

reimbursementRoutes.get("/:id/history", (_req, res) => {
  res.sendStatus(501);
});

reimbursementRoutes.post("/:id/attachments", (_req, res) => {
  res.sendStatus(501);
});

reimbursementRoutes.get("/:id/attachments", (_req, res) => {
  res.sendStatus(501);
});
