import { Router } from 'express';

import { login } from '../controllers/auth.controller.ts';
import { validate } from '../middlewares/validate.middleware.ts';
import { loginSchema } from '../schemas/auth.schema.ts';

export const authRoutes = Router();

authRoutes.post('/login', validate({ body: loginSchema }), login);
