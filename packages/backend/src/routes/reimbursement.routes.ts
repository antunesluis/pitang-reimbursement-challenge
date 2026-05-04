import { Router } from 'express';

import { Role } from '../../prisma/src/generated/prisma/enums.ts';
import {
    addAttachment,
    listAttachments,
} from '../controllers/attachment.controller.ts';
import {
    approve,
    cancel,
    create,
    getById,
    getHistory,
    list,
    pay,
    reject,
    submit,
    update,
} from '../controllers/reimbursement.controller.ts';
import { upload } from '../lib/upload.ts';
import { authMiddleware } from '../middlewares/auth.middleware.ts';
import { roleMiddleware } from '../middlewares/role.middleware.ts';
import { validate } from '../middlewares/validate.middleware.ts';
import { paramsWithId } from '../schemas/common.schema.ts';
import {
    createReimbursementSchema,
    rejectReimbursementSchema,
    updateReimbursementSchema,
} from '../schemas/reimbursement.schema.ts';

export const reimbursementRoutes = Router();

reimbursementRoutes.use(authMiddleware);

reimbursementRoutes.get('/', list);

reimbursementRoutes.post(
    '/',
    roleMiddleware([Role.EMPLOYEE]),
    validate({ body: createReimbursementSchema }),
    create,
);

reimbursementRoutes.get('/:id', validate({ params: paramsWithId }), getById);

reimbursementRoutes.put(
    '/:id',
    roleMiddleware([Role.EMPLOYEE]),
    validate({ body: updateReimbursementSchema, params: paramsWithId }),
    update,
);

reimbursementRoutes.post(
    '/:id/submit',
    roleMiddleware([Role.EMPLOYEE]),
    validate({ params: paramsWithId }),
    submit,
);

reimbursementRoutes.post(
    '/:id/approve',
    roleMiddleware([Role.MANAGER]),
    validate({ params: paramsWithId }),
    approve,
);

reimbursementRoutes.post(
    '/:id/reject',
    roleMiddleware([Role.MANAGER]),
    validate({ body: rejectReimbursementSchema, params: paramsWithId }),
    reject,
);

reimbursementRoutes.post(
    '/:id/pay',
    roleMiddleware([Role.FINANCE]),
    validate({ params: paramsWithId }),
    pay,
);

reimbursementRoutes.post(
    '/:id/cancel',
    roleMiddleware([Role.EMPLOYEE]),
    validate({ params: paramsWithId }),
    cancel,
);

reimbursementRoutes.get(
    '/:id/history',
    validate({ params: paramsWithId }),
    getHistory,
);

reimbursementRoutes.post(
    '/:id/attachments',
    roleMiddleware([Role.EMPLOYEE]),
    validate({ params: paramsWithId }),
    upload.single('file'),
    addAttachment,
);

reimbursementRoutes.get(
    '/:id/attachments',
    validate({ params: paramsWithId }),
    listAttachments,
);
