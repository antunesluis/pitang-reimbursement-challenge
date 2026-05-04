import crypto from 'node:crypto';
import path from 'node:path';

import multer from 'multer';

const UPLOAD_DIR = path.resolve(import.meta.dirname, '../../uploads');

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        const id = crypto.randomUUID();
        const ext = path.extname(file.originalname);
        cb(null, `${id}${ext}`);
    },
});

function fileFilter(
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
) {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
}

export const upload = multer({
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    storage,
});
