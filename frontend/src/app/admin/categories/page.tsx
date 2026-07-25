"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Save, Trash2, Edit3, X, Search } from "lucide-react";
import { Button, Input, Textarea, Badge, Modal } from "@/components/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import { useUIStore } from "@/stores/ui";
import { api } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

interface AttributeBrief {
  id: number;
  name: string;
  type: string;
  values: { id: number; value: string }[];
}

interface CategoryAttribute {
  id: number;
  category_id: number;
  attribute_id: number;
  attribute?: AttributeBrief;
}

// ── Page ────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const { showToast } = useUIStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // All attributes (for mapping)
  const [allAttributes, setAllAttributes] = useState<AttributeBrief[]>([]);

  // Create/Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // Attribute mapping — tracked per category
  const [mappingCategory, setMappingCategory] = useState<number | null>(null);
  const [mappedAttrIds, setMappedAttrIds] = useState<Set<number>>(new Set());
  const [mappingAttrs, setMappingAttrs] = useState<CategoryAttribute[]>([]);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<Category[]>("/admin/categories");
      setCategories(data);
    } catch {
      showToast("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Fetch all attributes
  const fetchAttributes = useCallback(async () => {
    try {
      const data = await api.get<AttributeBrief[]>("/admin/attributes");
      setAllAttributes(data);
    } catch {
      // silently
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchAttributes();
  }, [fetchCategories, fetchAttributes]);

  // ── Open mapping modal ────────────────────────────────────────

  const openMappingModal = async (catId: number) => {
    setMappingCategory(catId);
    try {
      const mappings = await api.get<CategoryAttribute[]>(`/admin/categories/${catId}/attributes`);
      setMappingAttrs(mappings);
      setMappedAttrIds(new Set(mappings.map((m) => m.attribute_id)));
      setShowMappingModal(true);
    } catch {
      showToast("Failed to load attribute mappings", "error");
    }
  };

  // ── Toggle attribute mapping ──────────────────────────────────

  const toggleMapping = async (attrId: number) => {
    if (mappingCategory === null) return;
    const isMapped = mappedAttrIds.has(attrId);
    try {
      if (isMapped) {
        await api.delete(`/admin/categories/${mappingCategory}/attributes/${attrId}`);
        setMappedAttrIds((prev) => {
          const next = new Set(prev);
          next.delete(attrId);
          return next;
        });
        setMappingAttrs((prev) => prev.filter((m) => m.attribute_id !== attrId));
        showToast("Attribute unmapped", "success");
      } else {
        const mapping = await api.post<CategoryAttribute>(
          `/admin/categories/${mappingCategory}/attributes`,
          { attribute_id: attrId }
        );
        // Fetch the full attribute object for display
        const attr = allAttributes.find((a) => a.id === attrId);
        setMappedAttrIds((prev) => new Set(prev).add(attrId));
        setMappingAttrs((prev) => [
          ...prev,
          { ...mapping, attribute: attr },
        ]);
        showToast("Attribute mapped", "success");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update mapping", "error");
    }
  };

  // ── Create / Update category ──────────────────────────────────

  const handleSave = async () => {
    if (!formName.trim() || !formSlug.trim()) {
      showToast("Name and slug are required", "error");
      return;
    }
    try {
      const payload = {
        name: formName.trim(),
        slug: formSlug.trim(),
        description: formDescription.trim(),
      };

      if (editingCategory) {
        const updated = await api.patch<Category>(
          `/admin/categories/${editingCategory.id}`,
          payload
        );
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? updated : c))
        );
        showToast("Category updated", "success");
      } else {
        const created = await api.post<Category>("/admin/categories", payload);
        setCategories((prev) => [...prev, created]);
        showToast("Category created", "success");
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save category", "error");
    }
  };

  // ── Delete category ───────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/categories/${deleteTarget.id}`);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Category deleted", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete category", "error");
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDescription(cat.description);
    setShowModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  // ── Loading ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-[var(--radius-lg)]" />
          ))}
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text">Categories</h1>
          <p className="text-text-secondary text-sm mt-1">
            Manage categories and map attributes to them
          </p>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          <Plus size={16} className="mr-1.5" />
          Add Category
        </Button>
      </div>

      {/* Category cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.length === 0 && (
          <div className="col-span-full bg-card border border-border rounded-[var(--radius-lg)] p-10 text-center">
            <p className="text-text-secondary">No categories yet.</p>
          </div>
        )}

        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-card border border-border rounded-[var(--radius-lg)] p-5 flex flex-col"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-heading font-semibold text-text truncate">{cat.name}</h3>
                <p className="text-xs text-text-secondary/60 mt-0.5">/{cat.slug}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-1.5 text-text-secondary hover:text-text hover:bg-border rounded transition-colors"
                  title="Edit"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  onClick={() => setDeleteTarget(cat)}
                  className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {cat.description && (
              <p className="text-sm text-text-secondary mb-3 line-clamp-2">{cat.description}</p>
            )}

            <div className="mt-auto pt-3 border-t border-border">
              <button
                onClick={() => openMappingModal(cat.id)}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Manage Attributes →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Create/Edit Modal ─────────────────────────────────── */}
      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingCategory ? "Edit Category" : "Create Category"}
      >
        <div className="space-y-4">
          <Input
            id="cat-name"
            label="Category Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="e.g. Fashion, Electronics"
            autoFocus
          />
          <Input
            id="cat-slug"
            label="Slug"
            value={formSlug}
            onChange={(e) => setFormSlug(e.target.value)}
            placeholder="e.g. fashion, electronics"
          />
          <Textarea
            id="cat-desc"
            label="Description (optional)"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Describe this category…"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {editingCategory ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Attribute Mapping Modal ──────────────────────────── */}
      <Modal
        open={showMappingModal}
        onClose={() => setShowMappingModal(false)}
        title="Manage Attribute Mapping"
        className="max-w-xl"
      >
        <div className="space-y-4">
          <Input
            placeholder="Search attributes…"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />

          <div className="max-h-80 overflow-y-auto space-y-1">
            {allAttributes
              .filter((a) =>
                !searchFilter || a.name.toLowerCase().includes(searchFilter.toLowerCase())
              )
              .map((attr) => (
                <label
                  key={attr.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] hover:bg-border/50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={mappedAttrIds.has(attr.id)}
                    onChange={() => toggleMapping(attr.id)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-text">{attr.name}</span>
                    <span className="text-xs text-text-secondary/60 ml-2">
                      ({attr.type} — {attr.values.length} values)
                    </span>
                  </div>
                  {mappedAttrIds.has(attr.id) && (
                    <Badge variant="success">Mapped</Badge>
                  )}
                </label>
              ))}

            {allAttributes.length === 0 && (
              <p className="text-sm text-text-secondary py-4 text-center">
                No attributes defined yet. Create attributes first.
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <Button variant="secondary" onClick={() => setShowMappingModal(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirmation ───────────────────────────────── */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Delete"
      >
        <p className="text-text-secondary mb-6">
          Delete category <strong>{deleteTarget?.name}</strong>? Products assigned to this category
          may be affected.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
