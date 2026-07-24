"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button, Input, Textarea, Select } from "@/components/ui";
import { Save, ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { getProductPlaceholder } from "@/lib/placeholders";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ProductFormProps {
  productId?: number; // present = edit mode, absent = create mode
  initialData?: {
    name: string;
    slug: string;
    description: string;
    base_price: number;
    category_id: number | null;
    is_active: boolean;
  };
}

interface UploadedImage {
  id: number;
  url: string;
  position: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export function ProductForm({ productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    base_price: initialData?.base_price ?? 0,
    category_id: initialData?.category_id ?? null,
    stock: 0,
    discount: 0,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    api.get<Category[]>("/categories/")
      .then(setCategories)
      .catch(() => {
        // Fallback categories if endpoint doesn't exist yet
        setCategories([
          { id: 1, name: "Electronics", slug: "electronics" },
          { id: 2, name: "Fashion", slug: "fashion" },
          { id: 3, name: "Shoes", slug: "shoes" },
          { id: 4, name: "Beauty", slug: "beauty" },
          { id: 5, name: "Sports", slug: "sports" },
          { id: 6, name: "Furniture", slug: "furniture" },
        ]);
      });
  }, []);

  // Fetch existing images in edit mode
  useEffect(() => {
    if (productId) {
      api.get<{ images: UploadedImage[] }>(`/products/${productId}`)
        .then((product) => {
          if (product.images) setUploadedImages(product.images);
        })
        .catch(() => {});
    }
  }, [productId]);

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [field]: e.target.value });

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles((prev) => [...prev, ...files]);

    // Create preview URLs
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeSelectedFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Delete an already-uploaded image
  const handleDeleteImage = async (imageId: number) => {
    if (!productId) return;
    try {
      await api.deleteImage(productId, imageId);
      setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      setError("Failed to delete image");
    }
  };

  // Submit: create/update product + upload images
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let targetProductId = productId;

      if (productId) {
        // Edit mode — update existing product
        await api.patch(`/products/${productId}`, {
          name: form.name,
          slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
          description: form.description,
          base_price: Number(form.base_price),
          category_id: form.category_id ? Number(form.category_id) : null,
        });
      } else {
        // Create mode — create the product first
        const created = await api.post<{ id: number }>("/products/", {
          name: form.name,
          slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
          description: form.description,
          base_price: Number(form.base_price),
          category_id: form.category_id ? Number(form.category_id) : null,
        });
        targetProductId = created.id;
      }

      // Upload images if any were selected
      if (targetProductId && selectedFiles.length > 0) {
        setIsUploading(true);
        await api.uploadImages(targetProductId, selectedFiles);
        setIsUploading(false);
        // Clean up previews
        previews.forEach((p) => URL.revokeObjectURL(p));
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const isEditMode = !!productId;

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger text-sm px-4 py-3 rounded-[var(--radius-sm)]">
          {error}
        </div>
      )}

      {/* Product Images */}
      <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
        <h3 className="font-heading font-semibold text-text mb-4">Product Images</h3>

        {/* Uploaded images (edit mode) */}
        {uploadedImages.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {uploadedImages.map((img) => (
              <div key={img.id} className="relative w-24 h-24 rounded-[var(--radius-sm)] overflow-hidden border border-border group">
                <Image
                  src={img.url.startsWith("http") ? img.url : `${API_BASE}${img.url}`}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(img.id)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New file previews */}
        {previews.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {previews.map((preview, i) => (
              <div key={i} className="relative w-24 h-24 rounded-[var(--radius-sm)] overflow-hidden border border-border group">
                <Image
                  src={preview}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
                />
                <button
                  type="button"
                  onClick={() => removeSelectedFile(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload button */}
        <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-border rounded-[var(--radius-sm)] cursor-pointer hover:border-primary/50 transition-colors">
          <Upload size={24} className="text-text-secondary mb-2" />
          <span className="text-sm text-text-secondary">
            {isUploading ? "Uploading..." : "Click to upload images"}
          </span>
          <span className="text-xs text-text-secondary/60 mt-1">JPG, PNG, WebP, SVG — max 5MB each</span>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
        </label>
      </div>

      {/* Basic Info */}
      <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6 space-y-5">
        <h3 className="font-heading font-semibold text-text">Basic Information</h3>
        <div className="grid sm:grid-cols-2 gap-5">
          <Input id="name" label="Product Name" value={form.name} onChange={updateField("name")} required />
          <Input
            id="slug"
            label="Slug"
            value={form.slug}
            onChange={updateField("slug")}
            placeholder="Auto-generated from name"
            required
          />
        </div>
        <Select
          id="category"
          label="Category"
          value={form.category_id?.toString() || ""}
          onChange={updateField("category_id")}
          options={[
            { value: "", label: "Select category" },
            ...categories.map((c) => ({ value: c.id.toString(), label: c.name })),
          ]}
        />
        <Textarea id="description" label="Description" value={form.description} onChange={updateField("description")} />
      </div>

      {/* Pricing & Stock */}
      <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6 space-y-5">
        <h3 className="font-heading font-semibold text-text">Pricing & Inventory</h3>
        <div className="grid sm:grid-cols-3 gap-5">
          <Input id="price" label="Base Price ($)" type="number" step="0.01" value={form.base_price} onChange={updateField("base_price")} required />
          <Input id="discount" label="Discount (%)" type="number" value={form.discount} onChange={updateField("discount")} />
          <Input id="stock" label="Stock Quantity" type="number" value={form.stock} onChange={updateField("stock")} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              {isUploading ? "Uploading Images..." : "Saving..."}
            </>
          ) : (
            <>
              <Save size={18} className="mr-2" />
              {isEditMode ? "Update Product" : "Save Product"}
            </>
          )}
        </Button>
        <Button type="button" variant="secondary" size="lg" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}