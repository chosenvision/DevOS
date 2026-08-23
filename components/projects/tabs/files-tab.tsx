"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { File as FileIcon, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { createClient } from "@/lib/supabase/client";
import { formatShortDate } from "@/lib/utils";

interface ProjectFile {
  id: string;
  name: string;
  file_path: string;
  file_type: string | null;
  size_bytes: number | null;
  created_at: string;
}

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilesTab({ projectId, userId }: { projectId: string; userId: string }) {
  const queryClient = useQueryClient();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const { data: files = [] } = useQuery({
    queryKey: ["project-files", projectId],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("project_files")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      return (data ?? []) as ProjectFile[];
    },
  });

  async function handleUpload(file: File) {
    setUploading(true);
    const supabase = createClient();
    const path = `${userId}/${projectId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage.from("project-files").upload(path, file);
    if (uploadError) {
      toast.error(uploadError.message);
      setUploading(false);
      return;
    }

    const { error } = await supabase.from("project_files").insert({
      project_id: projectId,
      user_id: userId,
      name: file.name,
      file_path: path,
      file_type: file.type || null,
      size_bytes: file.size,
    });

    setUploading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("File uploaded.");
      queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });
    }
  }

  async function handleDownload(file: ProjectFile) {
    const supabase = createClient();
    const { data, error } = await supabase.storage.from("project-files").createSignedUrl(file.file_path, 60);
    if (error || !data) {
      toast.error("Could not generate a download link.");
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  async function handleDelete(file: ProjectFile) {
    const supabase = createClient();
    const { error: storageError } = await supabase.storage.from("project-files").remove([file.file_path]);
    if (storageError) {
      toast.error("Could not delete the file.");
      return;
    }
    const { error: dbError } = await supabase.from("project_files").delete().eq("id", file.id);
    if (dbError) {
      toast.error(dbError.message);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = "";
          }}
        />
        <Button size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
          <Upload className="size-4" /> {uploading ? "Uploading..." : "Upload file"}
        </Button>
      </div>

      {files.length === 0 ? (
        <EmptyState
          title="No files uploaded yet."
          description="Attach reference documents, exports, or screenshots to this project."
          actionLabel="Upload file"
          onAction={() => inputRef.current?.click()}
        />
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <Card key={file.id} className="flex-row items-center gap-3 px-4 py-2.5">
              <FileIcon className="size-4 shrink-0 text-muted-foreground" />
              <button
                onClick={() => handleDownload(file)}
                className="min-w-0 flex-1 truncate text-left text-sm hover:underline"
              >
                {file.name}
              </button>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatSize(file.size_bytes)} · {formatShortDate(file.created_at)}
              </span>
              <Button size="icon" variant="ghost" onClick={() => handleDelete(file)} aria-label="Delete file">
                <Trash2 className="size-3.5" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
