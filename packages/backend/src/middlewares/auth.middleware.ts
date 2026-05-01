import type { Request, Response, NextFunction } from "express"

// TODO: implement JWT verification
export function authMiddleware(_req: Request, _res: Response, next: NextFunction) {
  next()
}
