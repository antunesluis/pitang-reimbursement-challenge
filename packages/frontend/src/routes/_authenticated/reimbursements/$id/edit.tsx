import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { AttachmentUpload } from '@/components/reimbursements/AttachmentUpload.tsx';
import { ReimbursementForm } from '@/components/reimbursements/ReimbursementForm.tsx';
import { Delayed } from '@/components/shared/Delayed.tsx';
import { ErrorAlert } from '@/components/shared/ErrorAlert.tsx';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { useReimbursementEdit } from '@/hooks/use-reimbursement-edit.ts';
import {
    type UpdateReimbursementFormData,
    updateReimbursementSchema,
} from '@/schemas/reimbursement.schema.ts';
import { attachmentService } from '@/services/attachment.service.ts';
import { reimbursementService } from '@/services/reimbursement.service.ts';

export const Route = createFileRoute(
    '/_authenticated/reimbursements/$id/edit',
)({
    component: EditReimbursementPage,
    staticData: { breadcrumb: 'Edit' },
});

function EditReimbursementPage() {
    const { id } = Route.useParams();
    const router = useRouter();
    const { data, loadError, loading } = useReimbursementEdit(id);

    const {
        formState: { errors, isSubmitting },
        handleSubmit,
        register,
        setError,
        setValue,
        watch,
    } = useForm<UpdateReimbursementFormData>({
        mode: 'onBlur',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(updateReimbursementSchema) as any,
        values: data
            ? {
                  amount: data.amount,
                  categoryId: data.category.id,
                  description: data.description,
                  expenseDate:
                      data.expenseDate.split('T')[0] ?? '',
              }
            : undefined,
    });

    // eslint-disable-next-line react-hooks/incompatible-library
    const categoryId = watch('categoryId');

    async function onSubmit(formData: UpdateReimbursementFormData) {
        try {
            const payload: Record<string, unknown> = {};
            if (formData.description !== data?.description)
                payload.description = formData.description;
            if (formData.amount !== data?.amount)
                payload.amount = formData.amount;
            if (formData.categoryId !== data?.category.id)
                payload.categoryId = formData.categoryId;
            if (
                formData.expenseDate !==
                data?.expenseDate?.split('T')[0]
            ) {
                payload.expenseDate = new Date(
                    formData.expenseDate ?? '',
                ).toISOString();
            }

            await reimbursementService.update(id, payload);
            toast.success('Reimbursement updated');
            router.navigate({
                params: { id },
                to: '/reimbursements/$id',
            });
        } catch (err) {
            setError('root', {
                message:
                    err instanceof Error
                        ? err.message
                        : 'Failed to update',
            });
        }
    }

    if (loading) {
        return (
            <Delayed>
                <div className="mx-auto max-w-xl space-y-6">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-64" />
                </div>
            </Delayed>
        );
    }

    if (loadError) {
        return (
            <div className="mx-auto max-w-xl space-y-4">
                <ErrorAlert message={loadError} />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-xl space-y-6">
            <h1 className="text-2xl font-bold">Edit Reimbursement</h1>

            <ReimbursementForm
                categoryId={categoryId ?? ''}
                errors={errors}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit(onSubmit)}
                register={register}
                rootError={errors.root?.message}
                setValue={setValue}
                submitLabel="Save Changes"
            />

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                    <AttachmentUpload
                        onUpload={async (file) => {
                            await attachmentService.create(id, file);
                            toast.success('Attachment added');
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
