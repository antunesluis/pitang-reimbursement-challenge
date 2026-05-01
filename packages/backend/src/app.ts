import express from "express";
import { authRoutes } from "./routes/auth.routes.ts";
import { userRoutes } from "./routes/user.routes.ts";
import { categoryRoutes } from "./routes/category.routes.ts";
import { reimbursementRoutes } from "./routes/reimbursement.routes.ts";
import helmet from "helmet";
import cors from "cors";

const app = express();

app.use(express.json());

app.use(
  cors({
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    origin: "*",
  }),
);

app.use(helmet());

app.get("/", (_req, res) => {
  res.json({ message: "API running" });
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/reimbursements", reimbursementRoutes);

export { app };
