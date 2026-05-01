import type { Request, Response, NextFunction } from "express"
import type { ZodSchema } from "zod"

type ValidationSchemas = {
  body?: ZodSchema
  params?: ZodSchema
  query?: ZodSchema
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params)
      if (!result.success) {
        res.status(400).json(formatZodError(result.error))
        return
      }
      req.params = result.data
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query)
      if (!result.success) {
        res.status(400).json(formatZodError(result.error))
        return
      }
      req.query = result.data
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body)
      if (!result.success) {
        res.status(400).json(formatZodError(result.error))
        return
      }
      req.body = result.data
    }

    next()
  }
}

function formatZodError(error: { issues: { path: (string | number)[]; message: string }[] }) {
  return {
    message: "Validation error",
    statusCode: 400,
    errors: error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  }
}
