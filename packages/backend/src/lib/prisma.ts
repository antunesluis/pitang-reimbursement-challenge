import { PrismaLibSql } from '@prisma/adapter-libsql';

import { PrismaClient } from '../../prisma/src/generated/prisma/client.ts';
import { env } from './env.vars.ts';

const adapter = new PrismaLibSql({ url: env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
