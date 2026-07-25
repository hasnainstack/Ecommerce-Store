"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button, Input, Textarea, Select } from "@/components/ui";
import { Save, ArrowLeft, Upload, X, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { getProductPlaceholder } from "@/lib/placeholders";
import { useUIStore } from "@/stores/ui";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Types ──────────────────────────────────────────────────────

interface ProductFormProps {
  productId?: number;
  initialData?: {
    name: string;
    slug: string;
    description: string;
    base_price: number;
    category_id: number | null;
    is_active: boolean;
    low_stock_threshold?: number;
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

interface AttributeValue {
  id: number;
  value: string;
  sort_order: number;
  extra_data: string;
}

interface AttributeBrief {
  id: number;
  name: string;
  type: string;
  values: AttributeValue[];
}

interface CategoryAttributesResponse {
  category_id: number;
  attributes: AttributeBrief[];
}

interface VariantRead {
  id: number;
  product_id: number;
  sku: string;
  price_override: number | null;
  stock_qty: number;
  attributes: string;
}

// ── Component ──────────────────────────────────────────────────

export function ProductForm({ productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const { showToast } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Basic form state
  const [form, setForm] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    base_price: initialData?.base_price ?? 0,
    category_id: initialData?.category_id ?? null,
    low_stock_threshold: initialData?.low_stock_threshold ?? 5,
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

  // Attribute / variant state
  const [categoryAttrs, setCategoryAttrs] = useState<AttributeBrief[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<number, number[]>>({});
  const [variants, setVariants] = useState<VariantRead[]>([]);
  const [generatingVariants, setGeneratingVariants] = useState(false);
  const [editVariantId, setEditVariantId] = useState<number | null>(null);
  const [editVariantData, setEditVariantData] = useState<{ sku: string; stock_qty: number; price_override: string }>({
    sku: "",
    stock_qty: 0,
    price_override: "",
  });

  // ── Fetch categories on mount ─────────────────────────────────

  useEffect(() => {
    api.get<Category[]>("/categories/")
      .then(setCategories)
      .catch(() => {
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

  // ── Fetch existing images + variants in edit mode ────────────

  useEffect(() => {
    if (!productId) return;

    // Get product details (for images)
    api.get<{ images: UploadedImage[] }>(`/products/${productId}`)
      .then((product) => {
        if (product.images) setUploadedImages(product.images);
      })
      .catch(() => {});

    // Get existing variants
    api.get<VariantRead[]>(`/admin/products/${productId}/variants`)
      .then(setVariants)
      .catch(() => {});
  }, [productId]);

  // ── Fetch attributes when category changes ───────────────────

  const fetchCategoryAttributes = useCallback(async (categoryId: number) => {
    try {
      const data = await api.get<CategoryAttributesResponse>(
        `/categories/${categoryId}/attributes`
      );
      setCategoryAttrs(data.attributes);
      // Reset selections when category changes
      setSelectedValues({});
    } catch {
      setCategoryAttrs([]);
    }
  }, []);

  useEffect(() => {
    if (form.category_id) {
      fetchCategoryAttributes(Number(form.category_id));
    } else {
      setCategoryAttrs([]);
      setSelectedValues({});
    }
  }, [form.category_id, fetchCategoryAttributes]);

  // ── Field update helper ──────────────────────────────────────

  const updateField = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    let value: string | number = e.target.value;
    if (e.target.type === "number") {
      value = parseFloat(e.target.value) || 0;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ── Image handling ───────────────────────────────────────────

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setSelectedFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeSelectedFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!productId) return;
    try {
      await api.deleteImage(productId, imageId);
      setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch {
      setError("Failed to delete image");
    }
  };

  // ── Attribute value selection (toggle) ───────────────────────

  const toggleValue = (attrId: number, valueId: number) => {
    setSelectedValues((prev) => {
      const current = prev[attrId] || [];
      const isSelected = current.includes(valueId);
      return {
        ...prev,
        [attrId]: isSelected
          ? current.filter((id) => id !== valueId)
          : [...current, valueId],
      };
    });
  };

  // ── Generate variants ───────────────────────────────────────

  const handleGenerateVariants = async () => {
    if (!productId) return;
    const selections = Object.entries(selectedValues)
      .filter(([, ids]) => ids.length > 0)
      .map(([attrId, ids]) => ({
        attribute_id: Number(attrId),
        value_ids: ids,
      }));

    if (selections.length === 0) {
      showToast("Select at least one attribute value", "error");
      return;
    }

    setGeneratingVariants(true);
    try {
      const created = await api.post<VariantRead[]>(
        `/admin/products/${productId}/variants/generate`,
        { selections }
      );
      setVariants(created);
      showToast(`${created.length} variants generated`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to generate variants", "error");
    } finally {
      setGeneratingVariants(false);
    }
  };

  // ── Edit variant inline ──────────────────────────────────────

  const startEditVariant = (v: VariantRead) => {
    setEditVariantId(v.id);
    setEditVariantData({
      sku: v.sku,
      stock_qty: v.stock_qty,
      price_override: v.price_override?.toString() || "",
    });
  };

  const cancelEditVariant = () => {
    setEditVariantId(null);
  };

  const saveEditVariant = async () => {
    if (!productId || editVariantId === null) return;
    try {
      const payload: Record<string, unknown> = {
        sku: editVariantData.sku,
        stock_qty: editVariantData.stock_qty,
      };
      if (editVariantData.price_override !== "") {
        payload.price_override = parseFloat(editVariantData.price_override);
      } else {
        payload.price_override = null;
      }

      const updated = await api.patch<VariantRead>(
        `/admin/products/${productId}/variants/${editVariantId}`,
        payload
      );
      setVariants((prev) => prev.map((v) => (v.id === editVariantId ? updated : v)));
      setEditVariantId(null);
      showToast("Variant updated", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update variant", "error");
    }
  };

  // ── Delete variant ───────────────────────────────────────────

  const deleteVariant = async (variantId: number) => {
    if (!productId) return;
    try {
      await api.delete(`/admin/products/${productId}/variants/${variantId}`);
      setVariants((prev) => prev.filter((v) => v.id !== variantId));
      showToast("Variant deleted", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete variant", "error");
    }
  };

  // ── Parse attributes JSON for display ────────────────────────

  const parseVariantAttrs = (attrsStr: string): Record<string, string> => {
    try {
      // The backend stores Python dict repr: "{'Size': 'S', 'Color': 'Red'}"
      // Replace single quotes with double quotes for JSON parsing
      const json = attrsStr.replace(/'/g, '"');
      return JSON.parse(json);
    } catch {
      return {};
    }
  };

  // ── Main submit ─────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let targetProductId = productId;

      if (productId) {
        await api.patch(`/products/${productId}`, {
          name: form.name,
          slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
          description: form.description,
          base_price: Number(form.base_price),
          category_id: form.category_id ? Number(form.category_id) : null,
          low_stock_threshold: form.low_stock_threshold,
        });
      } else {
        const created = await api.post<{ id: number }>("/products/", {
          name: form.name,
          slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
          description: form.description,
          base_price: Number(form.base_price),
          category_id: form.category_id ? Number(form.category_id) : null,
          low_stock_threshold: form.low_stock_threshold,
        });
        targetProductId = created.id;
      }

      // Upload images
      if (targetProductId && selectedFiles.length > 0) {
        setIsUploading(true);
        await api.uploadImages(targetProductId, selectedFiles);
        setIsUploading(false);
        previews.forEach((p) => URL.revokeObjectURL(p));
      }

      // If we have attribute selections and variants were generated, auto-generate
      if (targetProductId) {
        const selections = Object.entries(selectedValues)
          .filter(([, ids]) => ids.length > 0)
          .map(([attrId, ids]) => ({
            attribute_id: Number(attrId),
            value_ids: ids,
          }));

        if (selections.length > 0 && variants.length === 0) {
          try {
            const created = await api.post<VariantRead[]>(
              `/admin/products/${targetProductId}/variants/generate`,
              { selections }
            );
            setVariants(created);
          } catch {
            // Non-fatal — product was saved
          }
        }
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

  // ── Render ──────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger text-sm px-4 py-3 rounded-[var(--radius-sm)]">
          {error}
        </div>
      )}

      {/* Product Images */}
      <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
        <h3 className="font-heading font-semibold text-text mb-4">Product Images</h3>

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

        {previews.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {previews.map((preview, i) => (
              <div key={i} className="relative w-24 h-24 rounded-[var(--radius-sm)] overflow-hidden border border-border group">
                <Image src={preview} alt="" fill className="object-cover" sizes="96px" />
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

      {/* Dynamic Attribute Inputs (when category has mapped attributes) */}
      {categoryAttrs.length > 0 && (
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-text">Product Variants</h3>
            {isEditMode && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleGenerateVariants}
                loading={generatingVariants}
              >
                <RefreshCw size={14} className="mr-1" />
                Generate Variants
              </Button>
            )}
          </div>
          <p className="text-sm text-text-secondary">
            Select attribute values to define product variants.
            {!isEditMode && " Save the product first, then you can generate variants."}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryAttrs.map((attr) => (
              <div key={attr.id} className="space-y-2">
                <label className="block text-sm font-medium text-text">
                  {attr.name}
                  <span className="text-text-secondary/60 ml-1 text-xs">({attr.type})</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {attr.values.map((v) => {
                    const isSelected = (selectedValues[attr.id] || []).includes(v.id);
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => toggleValue(attr.id, v.id)}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                          isSelected
                            ? "bg-primary text-white border-primary"
                            : "bg-card text-text border-border hover:border-primary/50"
                        }`}
                      >
                        {v.value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Variant Table (edit mode only) */}
      {isEditMode && variants.length > 0 && (
        <div className="bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden">
          <div className="p-6 pb-3">
            <h3 className="font-heading font-semibold text-text">Generated Variants</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border bg-surface/50">
                  <th className="text-left px-4 py-2.5 text-text-secondary font-medium">Attributes</th>
                  <th className="text-left px-4 py-2.5 text-text-secondary font-medium">SKU</th>
                  <th className="text-left px-4 py-2.5 text-text-secondary font-medium">Stock</th>
                  <th className="text-left px-4 py-2.5 text-text-secondary font-medium">Price Override</th>
                  <th className="text-right px-4 py-2.5 text-text-secondary font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => (
                  <tr key={v.id} className="border-b border-border last:border-b-0">
                    {editVariantId === v.id ? (
                      <>
                        <td className="px-4 py-2.5">
                          <span className="text-text text-xs">
                            {Object.entries(parseVariantAttrs(v.attributes))
                              .map(([k, val]) => `${k}: ${val}`)
                              .join(", ")}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <input
                            value={editVariantData.sku}
                            onChange={(e) => setEditVariantData((p) => ({ ...p, sku: e.target.value }))}
                            className="w-32 px-2 py-1 border border-border rounded text-xs"
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <input
                            type="number"
                            min="0"
                            value={editVariantData.stock_qty}
                            onChange={(e) => setEditVariantData((p) => ({ ...p, stock_qty: parseInt(e.target.value) || 0 }))}
                            className="w-20 px-2 py-1 border border-border rounded text-xs"
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editVariantData.price_override}
                            onChange={(e) => setEditVariantData((p) => ({ ...p, price_override: e.target.value }))}
                            placeholder="Use base"
                            className="w-24 px-2 py-1 border border-border rounded text-xs"
                          />
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={saveEditVariant}
                            className="px-2 py-1 text-xs text-success hover:bg-success/10 rounded transition-colors"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditVariant}
                            className="px-2 py-1 text-xs text-text-secondary hover:bg-border rounded transition-colors ml-1"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(parseVariantAttrs(v.attributes)).map(([k, val]) => (
                              <span key={k} className="inline-flex items-center px-2 py-0.5 bg-border/50 rounded text-xs text-text">
                                <span className="text-text-secondary/70">{k}:</span>&nbsp;{val}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-text font-mono text-xs">{v.sku}</td>
                        <td className="px-4 py-2.5 text-text">{v.stock_qty}</td>
                        <td className="px-4 py-2.5 text-text">
                          {v.price_override != null ? `$${v.price_override.toFixed(2)}` : <span className="text-text-secondary/60">—</span>}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => startEditVariant(v)}
                            className="px-2 py-1 text-xs text-text-secondary hover:text-text hover:bg-border rounded transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteVariant(v.id)}
                            className="px-2 py-1 text-xs text-danger hover:bg-danger/10 rounded transition-colors ml-1"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pricing & Stock */}
      <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6 space-y-5">
        <h3 className="font-heading font-semibold text-text">Pricing & Inventory</h3>
        <div className="grid sm:grid-cols-3 gap-5">
          <Input id="price" label="Base Price ($)" type="number" step="0.01" value={form.base_price} onChange={updateField("base_price")} required />
          <Input id="discount" label="Discount (%)" type="number" value={form.discount} onChange={updateField("discount")} />
          {variants.length === 0 && (
            <Input id="stock" label="Stock Quantity" type="number" value={form.stock} onChange={updateField("stock")} />
          )}
          <Input
            id="low_stock_threshold"
            label="Low Stock Alert At"
            type="number"
            min="0"
            value={form.low_stock_threshold}
            onChange={updateField("low_stock_threshold")}
          />
        </div>
        {variants.length > 0 && (
          <p className="text-xs text-text-secondary/60">Stock is managed per variant above.</p>
        )}
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
