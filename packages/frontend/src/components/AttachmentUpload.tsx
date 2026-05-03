import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  type CreateAttachmentFormData,
  createAttachmentSchema,
} from "@/schemas/attachment.schema.ts";

type Props = {
  onUpload: (data: CreateAttachmentFormData) => Promise<void>;
};

export function AttachmentUpload({ onUpload }: Props) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<CreateAttachmentFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createAttachmentSchema) as any,
  });

  async function onSubmit(data: CreateAttachmentFormData) {
    await onUpload(data);
    reset();
  }

  return (
    <form className="space-y-3 rounded-md border p-4" onSubmit={handleSubmit(onSubmit)}>
      <p className="text-sm font-medium">Add Attachment</p>

      <div className="flex flex-wrap gap-3">
        <div className="min-w-[200px] flex-1 space-y-1">
          <Label htmlFor="att-fileName">File Name</Label>
          <Input id="att-fileName" placeholder="receipt.pdf" {...register("fileName")} />
          {errors.fileName && (
            <p className="text-destructive text-xs">{errors.fileName.message}</p>
          )}
        </div>

        <div className="w-32 space-y-1">
          <Label htmlFor="att-fileType">Type</Label>
          <select
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            id="att-fileType"
            {...register("fileType")}
          >
            <option value="">Select</option>
            <option value="application/pdf">PDF</option>
            <option value="image/jpeg">JPG</option>
            <option value="image/png">PNG</option>
          </select>
          {errors.fileType && (
            <p className="text-destructive text-xs">{errors.fileType.message}</p>
          )}
        </div>

        <div className="min-w-[200px] flex-1 space-y-1">
          <Label htmlFor="att-fileUrl">URL</Label>
          <Input
            id="att-fileUrl"
            placeholder="https://example.com/receipt.pdf"
            {...register("fileUrl")}
          />
          {errors.fileUrl && (
            <p className="text-destructive text-xs">{errors.fileUrl.message}</p>
          )}
        </div>

        <div className="flex items-end pb-0.5">
          <Button disabled={isSubmitting} size="sm" type="submit">
            <Plus className="mr-1 size-4" />
            {isSubmitting ? "Uploading..." : "Add"}
          </Button>
        </div>
      </div>
    </form>
  );
}
