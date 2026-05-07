import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { AttachmentUpload } from '@/components/reimbursements/AttachmentUpload.tsx';
import { ReimbursementForm } from '@/components/reimbursements/ReimbursementForm.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx';
import {
    type CreateReimbursementFormData,
    createReimbursementSchema,
} from '@/schemas/reimbursement.schema.ts';
import { attachmentService } from '@/services/attachment.service.ts';
import { reimbursementService } from '@/services/reimbursement.service.ts';

export const Route = createFileRoute('/_authenticated/reimbursements/new')({
    component: NewReimbursementPage,
    staticData: { breadcrumb: 'New' },
});

function NewReimbursementPage() {
    const router = useRouter();
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);

    const {
        formState: { errors, isSubmitting },
        handleSubmit,
        register,
        setError,
        setValue,
        watch,
    } = useForm<CreateReimbursementFormData>({
        mode: 'onBlur',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(createReimbursementSchema) as any,
    });

    async function onSubmit(data: CreateReimbursementFormData) {
        try {
            const reimbursement = await reimbursementService.create({
                amount: data.amount,
                categoryId: data.categoryId,
                description: data.description,
                expenseDate: new Date(data.expenseDate).toISOString(),
            });

            if (pendingFiles.length > 0) {
                await Promise.all(
                    pendingFiles.map((file) =>
                        attachmentService.create(reimbursement.id, file),
                    ),
                );
            }

            router.navigate({
                params: { id: reimbursement.id },
                to: '/reimbursements/$id',
            });
        } catch (err) {
            setError('root', {
                message:
                    err instanceof Error
                        ? err.message
                        : 'Failed to create',
            });
        }
    }

    return (
        <div className="mx-auto max-w-xl space-y-6">
            <h1 className="text-2xl font-bold">New Reimbursement</h1>

            <ReimbursementForm
                categoryId={watch('categoryId') ?? ''}
                errors={errors}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit(onSubmit)}
                register={register}
                rootError={errors.root?.message}
                setValue={setValue}
                submitLabel="Create Reimbursement"
            />

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Attachments ({pendingFiles.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {pendingFiles.length > 0 && (
                        <div className="space-y-2">
                            {pendingFiles.map((file, i) => (
                                <div
                                    className="flex items-center justify-between rounded-md border p-3"
                                    key={i}
                                >
                                    <div>
                                        <p className="font-medium">
                                            {file.name}
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            {file.type} —{' '}
                                            {(file.size / 1024).toFixed(
                                                1,
                                            )}{' '}
                                            KB
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() =>
                                            setPendingFiles((prev) =>
                                                prev.filter(
                                                    (_, j) => j !== i,
                                                ),
                                            )
                                        }
                                        size="sm"
                                        variant="ghost"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    <AttachmentUpload
                        onUpload={async (file) => {
                            setPendingFiles((prev) => [...prev, file]);
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
