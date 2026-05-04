import { api } from "@/lib/api.ts";

import type { Attachment } from "@/types/index.ts";

export const attachmentService = {
    create: (reimbursementId: string, file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return api.uploadFile<Attachment>(
            `/reimbursements/${reimbursementId}/attachments`,
            formData,
        );
    },

    list: (reimbursementId: string) =>
        api.get<Attachment[]>(`/reimbursements/${reimbursementId}/attachments`),
};
