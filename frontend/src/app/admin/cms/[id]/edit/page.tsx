"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save, ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Skeleton } from "@/components/ui/Skeleton";
import { useUIStore } from "@/stores/ui";
import { api } from "@/lib/api";

interface PageData {
  id: number;
  title: string;
  slug: string;
  content: string;
  meta_description: string;
  published: boolean;
}

export default function EditCMSPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PageData | null>(null);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<PageData>(`/admin/cms/pages/${params.id}`);
      setForm(data);
    } catch {
      showToast("Failed to load page", "error");
      router.push("/admin/cms");
    } finally {
      setLoading(false);
    }
  }, [params.id, showToast, router]);

  useEffect(() => { fetchPage(); }, [fetchPage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    setSaving(true);
    try {
      const updated = await api.patch<PageData>(`/admin/cms/pages/${params.id}`, {
        title: form.title,
        slug: form.slug,
        content: form.content,
        meta_description: form.meta_description,
        published: form.published,
      });
      setForm(updated);
      showToast("Page saved", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save page";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-6 max-w-3xl">
          <Skeleton className="h-64 rounded-[var(--radius-lg)]" />
        </div>
      </div>
    );
  }

  if (!form) return null;

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/cms"
            className="p-2 hover:bg-border/50 rounded-[var(--radius-sm)] transition-colors"
          >
            <ArrowLeft size={18} className="text-text-secondary" />
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-bold text-text">Edit Page</h1>
            <p className="text-text-secondary text-sm mt-1">{form.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {form.published && (
            <Link href={`/${form.slug}`} target="_blank">
              <Button variant="secondary" type="button">
                <Eye size={16} className="mr-1.5" />
                View Page
              </Button>
            </Link>
          )}
          <Button variant="primary" type="submit" loading={saving}>
            <Save size={16} className="mr-1.5" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[var(--radius-lg)] p-5 lg:p-6 space-y-4">
          <Input
            id="title"
            label="Page Title"
            value={form.title}
            onChange={(e) => setForm((prev) => prev ? { ...prev, title: e.target.value } : prev)}
          />
          <Input
            id="slug"
            label="URL Slug"
            value={form.slug}
            onChange={(e) => setForm((prev) => prev ? { ...prev, slug: e.target.value } : prev)}
          />
          <Textarea
            id="content"
            label="Content (HTML)"
            value={form.content}
            onChange={(e) => setForm((prev) => prev ? { ...prev, content: e.target.value } : prev)}
            className="min-h-[400px] font-mono text-sm"
          />
          <Input
            id="meta_description"
            label="Meta Description (SEO)"
            value={form.meta_description}
            onChange={(e) => setForm((prev) => prev ? { ...prev, meta_description: e.target.value } : prev)}
          />
          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm((prev) => prev ? { ...prev, published: e.target.checked } : prev)}
              className="w-4 h-4 rounded border-border accent-primary"
            />
            <span className="text-sm text-text">Published</span>
          </label>
        </div>
    </form>
  );
}
