"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, Trash2, Copy, X, Loader2, Search } from "lucide-react";
import { Button, Modal } from "@/components/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import { useUIStore } from "@/stores/ui";
import { api } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface MediaItem {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  alt_text: string;
  url: string;
  created_at: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function MediaPage() {
  const { showToast } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<MediaItem[]>("/admin/media");
      setItems(data);
    } catch {
      showToast("Failed to load media", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  // ── Upload ───────────────────────────────────────────────────

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }

      const token = localStorage.getItem("auth-storage")
        ? JSON.parse(localStorage.getItem("auth-storage")!).state?.accessToken
        : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/admin/media/upload`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Upload failed");
      }

      const result = await res.json();
      setItems((prev) => [...result.items, ...prev]);
      showToast(`${result.items.length} file(s) uploaded`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Delete ───────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/media/${deleteTarget.id}`);
      setItems((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("File deleted", "success");
    } catch {
      showToast("Failed to delete file", "error");
    } finally {
      setDeleting(false);
    }
  };

  // ── Copy URL ─────────────────────────────────────────────────

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(`${API_BASE}${url}`);
      showToast("URL copied", "success");
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  // ── Filter ───────────────────────────────────────────────────

  const filtered = items.filter((m) =>
    m.original_name.toLowerCase().includes(search.toLowerCase())
  );

  // ── Render ───────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text">Media Library</h1>
          <p className="text-text-secondary text-sm mt-1">
            Upload and manage images for your store
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
            disabled={uploading}
          />
          <Button
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
          >
            <Upload size={16} className="mr-1.5" />
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-xs mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-4 bg-card border border-border rounded-[var(--radius-sm)] text-text placeholder:text-text-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-[var(--radius-lg)]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-16 text-center">
          <Upload size={40} className="mx-auto mb-3 text-text-secondary/40" />
          <p className="text-text-secondary">
            {search ? "No files match your search." : "No files uploaded yet."}
          </p>
          <p className="text-text-secondary/60 text-sm mt-1">
            {search ? "Try a different search term." : "Click Upload to add images."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden hover:shadow-hover transition-shadow"
            >
              {/* Preview */}
              <div className="relative aspect-square bg-surface">
                <Image
                  src={item.url.startsWith("http") ? item.url : `${API_BASE}${item.url}`}
                  alt={item.alt_text || item.original_name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => copyUrl(item.url)}
                    className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    title="Copy URL"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} className="text-danger" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-xs text-text truncate" title={item.original_name}>
                  {item.original_name}
                </p>
                <p className="text-xs text-text-secondary/60 mt-0.5">
                  {formatFileSize(item.file_size)} &middot; {formatDate(item.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete File"
      >
        <p className="text-text-secondary mb-6">
          Delete <strong>{deleteTarget?.original_name}</strong>? This will remove it from the
          server and any products using this image.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
