import { File, Image, Upload, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const ALLOWED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png";

type Props = {
  onUpload: (file: File) => Promise<void>;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentUpload({ onUpload }: Props) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function handleUpload() {
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

  const isImage = selectedFile?.type.startsWith("image/");

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Upload className="text-muted-foreground size-4" />
        <span className="text-sm font-medium">Add Attachment</span>
      </div>

      {!selectedFile ? (
        <div className="border-input has-[input:focus-visible]:ring-ring/20 flex items-center gap-3 rounded-md border p-4">
          <Label
            className="bg-muted hover:bg-muted/80 flex flex-1 cursor-pointer items-center gap-3 rounded-md px-4 py-3 transition-colors"
            htmlFor="att-file"
          >
            <Upload className="text-muted-foreground size-4" />
            <span className="text-muted-foreground text-sm">Select a file (PDF, JPG, PNG up to 5MB)</span>
          </Label>
          <Input
            accept={ALLOWED_EXTENSIONS}
            className="hidden"
            id="att-file"
            onChange={handleFileChange}
            type="file"
          />
        </div>
      ) : (
        <div className="rounded-md border p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-muted flex h-9 w-9 items-center justify-center rounded">
                {isImage ? (
                  <Image className="text-muted-foreground size-4" />
                ) : (
                  <File className="text-muted-foreground size-4" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                <p className="text-muted-foreground text-xs">{formatSize(selectedFile.size)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button disabled={loading} onClick={handleUpload} size="sm" type="button">
                <Upload className="mr-1 size-3" />
                {loading ? "Uploading..." : "Upload"}
              </Button>
              <Button
                disabled={loading}
                onClick={() => setSelectedFile(null)}
                size="icon"
                variant="ghost"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
