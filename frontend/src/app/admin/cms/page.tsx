"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Edit, Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui";
import { useUIStore } from "@/stores/ui";
import { api } from "@/lib/api";

interface PageItem {
  id: number;
  title: string;
  slug: string;
  content: string;
  meta_description: string;
  published: boolean;
  created_at: string;
  updated_at: string;
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

export default function CMSPage() {
  const { showToast } = useUIStore();
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<PageItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<PageItem[]>("/admin/cms/pages");
      setPages(data);
    } catch {
      showToast("Failed to load pages", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/cms/pages/${deleteTarget.id}`);
      setPages((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Page deleted", "success");
    } catch {
      showToast("Failed to delete page", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text">CMS Pages</h1>
          <p className="text-text-secondary text-sm mt-1">Manage content pages for your store</p>
        </div>
        <Link href="/admin/cms/new">
          <Button variant="primary">
            <Plus size={16} className="mr-1.5" />
            New Page
          </Button>
        </Link>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-[var(--radius-lg)]" />
          ))}
        </div>
      ) : pages.length === 0 ? (
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-16 text-center">
          <Edit size={40} className="mx-auto mb-3 text-text-secondary/40" />
          <p className="text-text-secondary">No pages yet.</p>
          <p className="text-text-secondary/60 text-sm mt-1">
            Create a page to get started — About Us, Shipping Policy, etc.
          </p>
          <Link href="/admin/cms/new">
            <Button variant="primary" className="mt-4">
              <Plus size={16} className="mr-1.5" />
              Create Your First Page
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="text-left px-5 py-3.5 font-medium text-text-secondary">Title</th>
                <th className="text-left px-5 py-3.5 font-medium text-text-secondary hidden sm:table-cell">Slug</th>
                <th className="text-center px-5 py-3.5 font-medium text-text-secondary hidden md:table-cell">Status</th>
                <th className="text-right px-5 py-3.5 font-medium text-text-secondary hidden md:table-cell">Updated</th>
                <th className="text-right px-5 py-3.5 font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-surface/30 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-text">{page.title}</p>
                  </td>
                  <td className="px-5 py-4 text-text-secondary hidden sm:table-cell">
                    /{page.slug}
                  </td>
                  <td className="px-5 py-4 text-center hidden md:table-cell">
                    {page.published ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-success/10 text-success">
                        <Eye size={12} />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-warning/10 text-warning">
                        <EyeOff size={12} />
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-text-secondary text-right hidden md:table-cell">
                    {formatDate(page.updated_at)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/cms/${page.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit size={14} />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(page)}
                      >
                        <Trash2 size={14} className="text-danger" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Modal */}
      <Modal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} title="Delete Page">
        <p className="text-text-secondary mb-6">
          Delete <strong>{deleteTarget?.title}</strong>? This will remove the page and its content permanently.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
