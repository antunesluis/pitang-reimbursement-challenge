import { api } from '@/lib/api.ts';

import type { Attachment } from '@/types/index.ts';

export const attachmentService = {
    create: (
        reimbursementId: string,
        data: { fileName: string; fileType: string; fileUrl: string },
    ) =>
        api.post<Attachment>(
            `/reimbursements/${reimbursementId}/attachments`,
            data,
        ),

    list: (reimbursementId: string) =>
        api.get<Attachment[]>(`/reimbursements/${reimbursementId}/attachments`),
};
