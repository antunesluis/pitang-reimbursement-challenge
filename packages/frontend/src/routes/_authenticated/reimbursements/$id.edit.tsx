/* eslint-disable react-hooks/set-state-in-effect */
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
  type UpdateReimbursementFormData,
  updateReimbursementSchema,
} from "@/schemas/reimbursement.schema.ts";
import { categoryService } from "@/services/category.service.ts";
import { reimbursementService } from "@/services/reimbursement.service.ts";

import type { Reimbursement } from "@/types/index.ts";

export const Route = createFileRoute("/_authenticated/reimbursements/$id/edit")({
  component: EditReimbursementPage,
});

function EditReimbursementPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const [data, setData] = useState<null | Reimbursement>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [reimbursement, cats] = await Promise.all([
        reimbursementService.getById(id),
        categoryService.list(),
      ]);
      if (reimbursement.status !== "DRAFT") {
        setLoadError("Only DRAFT reimbursements can be edited");
        setLoading(false);
        return;
      }
      setData(reimbursement);
      setCategories(cats.filter((c) => c.active));
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
      setError("root", {
        message: err instanceof Error ? err.message : "Failed to update",
      });
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
        <Button asChild variant="ghost">
          <Link params={{ id }} to="/reimbursements/$id">
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Link>
        </Button>
        <div className="text-destructive rounded-md border p-4">
          <p>{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost">
          <Link params={{ id }} to="/reimbursements/$id">
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Link>
        </Button>
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
              <Input
                id="description"
                placeholder="Lunch with client"
                {...register("description")}
              />
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
