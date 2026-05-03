import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { AttachmentUpload } from "@/components/AttachmentUpload.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
  type CreateReimbursementFormData,
  createReimbursementSchema,
} from "@/schemas/reimbursement.schema.ts";
import { attachmentService } from "@/services/attachment.service.ts";
import { categoryService } from "@/services/category.service.ts";
import { reimbursementService } from "@/services/reimbursement.service.ts";

type PendingAttachment = {
  fileName: string;
  fileType: string;
  fileUrl: string;
};

export const Route = createFileRoute("/_authenticated/reimbursements/new")({
  component: NewReimbursementPage,
});

function NewReimbursementPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<CreateReimbursementFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createReimbursementSchema) as any,
  });

  useEffect(() => {
    categoryService
      .list()
      .then((data) => setCategories(data.filter((c) => c.active)))
      .finally(() => setLoadingCategories(false));
  }, []);

  async function onSubmit(data: CreateReimbursementFormData) {
    try {
      const reimbursement = await reimbursementService.create({
        amount: data.amount,
        categoryId: data.categoryId,
        description: data.description,
        expenseDate: new Date(data.expenseDate).toISOString(),
      });

      // Upload any pending attachments
      if (pendingAttachments.length > 0) {
        await Promise.all(
          pendingAttachments.map((att) =>
            attachmentService.create(reimbursement.id, {
              fileName: att.fileName,
              fileType: att.fileType,
              fileUrl: att.fileUrl,
            }),
          ),
        );
      }

      router.navigate({
        params: { id: reimbursement.id },
        to: "/reimbursements/$id",
      });
    } catch (err) {
      setError("root", {
        message: err instanceof Error ? err.message : "Failed to create",
      });
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
          <form className="space-y-4" id="reimbursement-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Lunch with client" {...register("description")} />
              {errors.description && (
                <p className="text-destructive text-sm">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                placeholder="0.00"
                step="0.01"
                type="number"
                {...register("amount")}
              />
              {errors.amount && (
                <p className="text-destructive text-sm">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              {loadingCategories ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <select
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  id="categoryId"
                  {...register("categoryId")}
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.categoryId && (
                <p className="text-destructive text-sm">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expenseDate">Expense Date</Label>
              <Input id="expenseDate" type="date" {...register("expenseDate")} />
              {errors.expenseDate && (
                <p className="text-destructive text-sm">{errors.expenseDate.message}</p>
              )}
            </div>

            {errors.root && (
              <p className="text-destructive text-sm">{errors.root.message}</p>
            )}

            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creating..." : "Create Reimbursement"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Attachments ({pendingAttachments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingAttachments.length > 0 && (
            <div className="space-y-2">
              {pendingAttachments.map((att, i) => (
                <div
                  className="flex items-center justify-between rounded-md border p-3"
                  key={i}
                >
                  <div>
                    <p className="font-medium">{att.fileName}</p>
                    <p className="text-muted-foreground text-sm">{att.fileType}</p>
                  </div>
                  <Button
                    onClick={() =>
                      setPendingAttachments((prev) => prev.filter((_, j) => j !== i))
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
            onUpload={async (formData) => {
              setPendingAttachments((prev) => [...prev, formData]);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
