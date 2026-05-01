import express from "express"
import { authRoutes } from "./routes/auth.routes.ts"
import { userRoutes } from "./routes/user.routes.ts"
import { categoryRoutes } from "./routes/category.routes.ts"
import { reimbursementRoutes } from "./routes/reimbursement.routes.ts"

const app = express()

app.use(express.json())

app.get("/", (_req, res) => {
  res.json({ message: "API running" })
})

app.use("/auth", authRoutes)
app.use("/users", userRoutes)
app.use("/categories", categoryRoutes)
app.use("/reimbursements", reimbursementRoutes)

export { app }
