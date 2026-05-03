import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AttachmentUpload } from "@/components/AttachmentUpload.tsx";
import { CategorySelect } from "@/components/CategorySelect.tsx";
import { FieldError } from '@/components/FieldError.tsx';
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  type CreateReimbursementFormData,
  createReimbursementSchema,
} from "@/schemas/reimbursement.schema.ts";
import { attachmentService } from "@/services/attachment.service.ts";
import { reimbursementService } from "@/services/reimbursement.service.ts";

type PendingAttachment = { fileName: string; fileType: string; fileUrl: string };

export const Route = createFileRoute("/_authenticated/reimbursements/new")({
  component: NewReimbursementPage,
});

function NewReimbursementPage() {
  const router = useRouter();
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setValue,
  } = useForm<CreateReimbursementFormData>({
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

      if (pendingAttachments.length > 0) {
        await Promise.all(
          pendingAttachments.map((att) =>
            attachmentService.create(reimbursement.id, att),
          ),
        );
      }

      router.navigate({ params: { id: reimbursement.id }, to: "/reimbursements/$id" });
    } catch (err) {
      setError("root", { message: err instanceof Error ? err.message : "Failed to create" });
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">New Reimbursement</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Lunch with client" {...register("description")} />
              <FieldError message={errors.description?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input id="amount" placeholder="0.00" step="0.01" type="number" {...register("amount")} />
              <FieldError message={errors.amount?.message} />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <CategorySelect
                onChange={(value) => setValue("categoryId", value)}
                value=""
              />
              <FieldError message={errors.categoryId?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expenseDate">Expense Date</Label>
              <Input id="expenseDate" type="date" {...register("expenseDate")} />
              <FieldError message={errors.expenseDate?.message} />
            </div>

            <FieldError message={errors.root?.message} />

            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creating..." : "Create Reimbursement"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attachments ({pendingAttachments.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingAttachments.length > 0 && (
            <div className="space-y-2">
              {pendingAttachments.map((att, i) => (
                <div className="flex items-center justify-between rounded-md border p-3" key={i}>
                  <div>
                    <p className="font-medium">{att.fileName}</p>
                    <p className="text-muted-foreground text-sm">{att.fileType}</p>
                  </div>
                  <Button onClick={() => setPendingAttachments((prev) => prev.filter((_, j) => j !== i))} size="sm" variant="ghost">Remove</Button>
                </div>
              ))}
            </div>
          )}
          <AttachmentUpload
            onUpload={async (formData) => {
              setPendingAttachments((prev) => [...prev, formData]);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
