import type { Request, Response } from "express"
import { prisma } from "../lib/prisma.ts"
import type { CreateUserInput } from "../schemas/user.schema.ts"

export async function create(req: Request, res: Response) {
  try {
    const { name, email, password, role } = req.body as CreateUserInput

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      res.status(409).json({ message: "Email already in use", statusCode: 409 })
      return
    }

    const hashedPassword = await Bun.password.hash(password)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    })

    res.status(201).json(user)
  } catch {
    res.status(500).json({ message: "Internal server error", statusCode: 500 })
  }
}

export async function list(_req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: "desc" },
    })

    res.json(users)
  } catch {
    res.status(500).json({ message: "Internal server error", statusCode: 500 })
  }
}
