import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const ALLOWED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png";

type Props = {
  onUpload: (file: File) => Promise<void>;
};

export function AttachmentUpload({ onUpload }: Props) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError("Invalid file type. Allowed: PDF, JPG, PNG");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File too large. Maximum size is 5MB");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError("");
    }
  }

  return (
    <form className="rounded-md border p-4" onSubmit={handleSubmit}>
      <p className="mb-3 text-sm font-medium">Add Attachment</p>

      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-1">
          <Label htmlFor="att-file">File</Label>
          <Input
            accept={ALLOWED_EXTENSIONS}
            id="att-file"
            onChange={handleFileChange}
            type="file"
          />
        </div>

        <Button disabled={!selectedFile || loading} size="sm" type="submit">
          <Plus className="mr-1 size-4" />
          {loading ? "Uploading..." : "Add"}
        </Button>
      </div>

      {selectedFile && (
        <p className="text-muted-foreground mt-2 text-xs">
          Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
        </p>
      )}

      {error && <p className="text-destructive mt-1 text-xs">{error}</p>}
    </form>
  );
}
