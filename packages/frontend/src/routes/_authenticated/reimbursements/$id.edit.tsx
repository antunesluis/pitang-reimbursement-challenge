 
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { BackButton } from "@/components/BackButton.tsx";
import { CategorySelect } from "@/components/CategorySelect.tsx";
import { ErrorAlert } from "@/components/ErrorAlert.tsx";
import { FieldError } from '@/components/FieldError.tsx';
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
  type UpdateReimbursementFormData,
  updateReimbursementSchema,
} from "@/schemas/reimbursement.schema.ts";
import { reimbursementService } from "@/services/reimbursement.service.ts";

import type { Reimbursement } from "@/types/index.ts";

export const Route = createFileRoute("/_authenticated/reimbursements/$id/edit")({
  component: EditReimbursementPage,
});

function EditReimbursementPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const [data, setData] = useState<null | Reimbursement>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const reimbursement = await reimbursementService.getById(id);
      if (reimbursement.status !== "DRAFT") {
        setLoadError("Only DRAFT reimbursements can be edited");
        setLoading(false);
        return;
      }
      setData(reimbursement);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setValue,
    watch,
  } = useForm<UpdateReimbursementFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(updateReimbursementSchema) as any,
    values: data
      ? {
          amount: data.amount,
          categoryId: data.category.id,
          description: data.description,
          expenseDate: data.expenseDate.split("T")[0] ?? "",
        }
      : undefined,
  });

  const categoryId = watch("categoryId");

  async function onSubmit(formData: UpdateReimbursementFormData) {
    try {
      const payload: Record<string, unknown> = {};
      if (formData.description !== data?.description) payload.description = formData.description;
      if (formData.amount !== data?.amount) payload.amount = formData.amount;
      if (formData.categoryId !== data?.category.id) payload.categoryId = formData.categoryId;
      if (formData.expenseDate !== data?.expenseDate?.split("T")[0]) {
        payload.expenseDate = new Date(formData.expenseDate ?? "").toISOString();
      }

      await reimbursementService.update(id, payload);
      router.navigate({ params: { id }, to: "/reimbursements/$id" });
    } catch (err) {
      setError("root", { message: err instanceof Error ? err.message : "Failed to update" });
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <BackButton params={{ id }} to="/reimbursements/$id" />
        <ErrorAlert message={loadError} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-4">
        <BackButton params={{ id }} to="/reimbursements/$id" />
        <h1 className="text-2xl font-bold">Edit Reimbursement</h1>
      </div>

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
                value={categoryId ?? ""}
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
