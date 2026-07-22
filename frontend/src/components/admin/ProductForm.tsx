"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea, Select } from "@/components/ui";
import { Save, ArrowLeft, Upload } from "lucide-react";

interface ProductFormProps {
  initialData?: {
    name: string;
    slug: string;
    description: string;
    base_price: number;
    category_id: number | null;
    is_active: boolean;
  };
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    base_price: initialData?.base_price || 0,
    category_id: initialData?.category_id || null,
    stock: 0,
    discount: 0,
  });

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Product saved! (Demo)");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {/* Image Upload */}
      <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
        <h3 className="font-heading font-semibold text-text mb-4">Product Images</h3>
        <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-border rounded-[var(--radius-sm)] cursor-pointer hover:border-primary/50 transition-colors">
          <Upload size={24} className="text-text-secondary mb-2" />
          <span className="text-sm text-text-secondary">Click to upload images</span>
          <input type="file" multiple accept="image/*" className="hidden" />
        </label>
      </div>

      {/* Basic Info */}
      <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6 space-y-5">
        <h3 className="font-heading font-semibold text-text">Basic Information</h3>
        <div className="grid sm:grid-cols-2 gap-5">
          <Input id="name" label="Product Name" value={form.name} onChange={updateField("name")} required />
          <Input id="slug" label="Slug" value={form.slug} onChange={updateField("slug")} required />
        </div>
        <Select
          id="category"
          label="Category"
          value={form.category_id?.toString() || ""}
          onChange={updateField("category_id")}
          options={[
            { value: "", label: "Select category" },
            { value: "1", label: "Electronics" },
            { value: "2", label: "Fashion" },
            { value: "3", label: "Shoes" },
            { value: "4", label: "Beauty" },
            { value: "5", label: "Sports" },
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
        <Button type="submit" size="lg">
          <Save size={18} className="mr-2" />
          {initialData ? "Update Product" : "Save Product"}
        </Button>
        <Button type="button" variant="secondary" size="lg" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
