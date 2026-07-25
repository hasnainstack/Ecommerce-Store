"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useUIStore } from "@/stores/ui";
import { api } from "@/lib/api";

export default function NewCMSPage() {
  const router = useRouter();
  const { showToast } = useUIStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    meta_description: "",
    published: false,
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast("Title is required", "error");
      return;
    }
    if (!form.slug.trim()) {
      showToast("Slug is required", "error");
      return;
    }

    setSaving(true);
    try {
      const page = await api.post<{ id: number }>("/admin/cms/pages", form);
      showToast("Page created", "success");
      router.push(`/admin/cms/${page.id}/edit`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create page";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

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
            <h1 className="text-2xl font-heading font-bold text-text">New Page</h1>
            <p className="text-text-secondary text-sm mt-1">Create a new content page</p>
          </div>
        </div>
        <Button variant="primary" type="submit" loading={saving}>
          <Save size={16} className="mr-1.5" />
          {saving ? "Saving..." : "Save Page"}
        </Button>
      </div>

      <div className="bg-card border border-border rounded-[var(--radius-lg)] p-5 lg:p-6 space-y-4">
          <Input
            id="title"
            label="Page Title"
            value={form.title}
            onChange={handleTitleChange}
            placeholder="About Us"
          />
          <Input
            id="slug"
            label="URL Slug"
            value={form.slug}
            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
            placeholder="about-us"
          />
          <Textarea
            id="content"
            label="Content (HTML)"
            value={form.content}
            onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
            placeholder="<h1>About Our Store</h1><p>Write your content here...</p>"
            className="min-h-[300px] font-mono text-sm"
          />
          <Input
            id="meta_description"
            label="Meta Description (SEO)"
            value={form.meta_description}
            onChange={(e) => setForm((prev) => ({ ...prev, meta_description: e.target.value }))}
            placeholder="Learn about our store and mission..."
          />
          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.checked }))}
              className="w-4 h-4 rounded border-border accent-primary"
            />
            <span className="text-sm text-text">Publish immediately</span>
          </label>
        </div>
    </form>
  );
}
