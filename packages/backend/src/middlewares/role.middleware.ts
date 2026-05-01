import type { Request, Response, NextFunction } from "express"

// TODO: implement role-based authorization
export function roleMiddleware(_roles: string[]) {
  return (_req: Request, _res: Response, next: NextFunction) => {
    next()
  }
}
