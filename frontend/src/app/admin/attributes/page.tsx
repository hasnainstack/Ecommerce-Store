"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Save, Trash2, Edit3, X, ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import { Button, Input, Badge, Modal } from "@/components/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import { useUIStore } from "@/stores/ui";
import { api } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────

interface AttributeValue {
  id: number;
  attribute_id: number;
  value: string;
  sort_order: number;
  extra_data: string;
}

interface Attribute {
  id: number;
  name: string;
  type: string;
  created_at: string;
  values: AttributeValue[];
}

// ── Helpers ─────────────────────────────────────────────────────

const ATTR_TYPES = [
  { value: "select", label: "Select (single)" },
  { value: "multiselect", label: "Multi-select" },
  { value: "text", label: "Text input" },
];

const ATTR_TYPE_COLORS: Record<string, "default" | "success" | "warning" | "info"> = {
  select: "info",
  multiselect: "warning",
  text: "success",
};

// ── Page ────────────────────────────────────────────────────────

export default function AttributesPage() {
  const { showToast } = useUIStore();

  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);

  // New attribute modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAttrName, setNewAttrName] = useState("");
  const [newAttrType, setNewAttrType] = useState("select");

  // Editing
  const [editingAttr, setEditingAttr] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  // Values
  const [expandedAttr, setExpandedAttr] = useState<number | null>(null);
  const [newValueText, setNewValueText] = useState("");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ type: "attr" | "value"; id: number; name: string } | null>(null);

  const fetchAttributes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<Attribute[]>("/admin/attributes");
      setAttributes(data);
    } catch {
      showToast("Failed to load attributes", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchAttributes(); }, [fetchAttributes]);

  // ── Create attribute ──────────────────────────────────────────

  const handleCreate = async () => {
    if (!newAttrName.trim()) return;
    try {
      const created = await api.post<Attribute>("/admin/attributes", {
        name: newAttrName.trim(),
        type: newAttrType,
        values: [],
      });
      setAttributes((prev) => [...prev, created]);
      setShowCreateModal(false);
      setNewAttrName("");
      setNewAttrType("select");
      showToast(`Attribute "${created.name}" created`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create attribute", "error");
    }
  };

  // ── Update attribute name ────────────────────────────────────

  const handleUpdateName = async (attrId: number) => {
    if (!editName.trim()) return;
    try {
      const updated = await api.patch<Attribute>(`/admin/attributes/${attrId}`, {
        name: editName.trim(),
      });
      setAttributes((prev) => prev.map((a) => (a.id === attrId ? updated : a)));
      setEditingAttr(null);
      showToast("Attribute updated", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update attribute", "error");
    }
  };

  // ── Delete attribute ──────────────────────────────────────────

  const handleDeleteAttribute = async () => {
    if (!deleteTarget || deleteTarget.type !== "attr") return;
    try {
      await api.delete(`/admin/attributes/${deleteTarget.id}`);
      setAttributes((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Attribute deleted", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete", "error");
    }
  };

  // ── Add value ─────────────────────────────────────────────────

  const handleAddValue = async (attrId: number) => {
    if (!newValueText.trim()) return;
    try {
      const created = await api.post<AttributeValue>(`/admin/attributes/${attrId}/values`, {
        value: newValueText.trim(),
        sort_order: 0,
      });
      setAttributes((prev) =>
        prev.map((a) =>
          a.id === attrId ? { ...a, values: [...a.values, created] } : a
        )
      );
      setNewValueText("");
      showToast("Value added", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add value", "error");
    }
  };

  // ── Delete value ──────────────────────────────────────────────

  const handleDeleteValue = async () => {
    if (!deleteTarget || deleteTarget.type !== "value") return;
    try {
      await api.delete(`/admin/attributes/values/${deleteTarget.id}`);
      setAttributes((prev) =>
        prev.map((a) => ({
          ...a,
          values: a.values.filter((v) => v.id !== deleteTarget.id),
        }))
      );
      setDeleteTarget(null);
      showToast("Value deleted", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete value", "error");
    }
  };

  // ── Loading state ─────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
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
          <h1 className="text-2xl font-heading font-bold text-text">Attributes</h1>
          <p className="text-text-secondary text-sm mt-1">
            Define attributes like Size, Color, Volume and map them to categories
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} className="mr-1.5" />
          Add Attribute
        </Button>
      </div>

      {/* Attribute list */}
      <div className="space-y-3">
        {attributes.length === 0 && (
          <div className="bg-card border border-border rounded-[var(--radius-lg)] p-10 text-center">
            <p className="text-text-secondary">No attributes defined yet.</p>
            <p className="text-text-secondary/60 text-sm mt-1">
              Create your first attribute like &quot;Size&quot; or &quot;Color&quot;
            </p>
          </div>
        )}

        {attributes.map((attr) => {
          const isExpanded = expandedAttr === attr.id;
          return (
            <div
              key={attr.id}
              className="bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden"
            >
              {/* Attribute row */}
              <div className="flex items-center gap-3 px-5 py-4">
                {/* Expand/collapse */}
                <button
                  onClick={() => setExpandedAttr(isExpanded ? null : attr.id)}
                  className="p-1 hover:bg-border rounded transition-colors text-text-secondary"
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  {editingAttr === attr.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8 py-1 text-sm"
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdateName(attr.id)}
                        className="p-1 text-success hover:bg-success/10 rounded transition-colors"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={() => setEditingAttr(null)}
                        className="p-1 text-text-secondary hover:bg-border rounded transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text">{attr.name}</span>
                      <Badge variant={ATTR_TYPE_COLORS[attr.type] || "default"}>
                        {attr.type}
                      </Badge>
                      <span className="text-xs text-text-secondary/60">
                        ({attr.values.length} values)
                      </span>
                      <button
                        onClick={() => {
                          setEditingAttr(attr.id);
                          setEditName(attr.name);
                        }}
                        className="p-1 text-text-secondary hover:text-text hover:bg-border rounded transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingAttr(attr.id);
                      setEditName(attr.name);
                    }}
                    className="p-1.5 text-text-secondary hover:text-text hover:bg-border rounded transition-colors"
                    title="Edit name"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() =>
                      setDeleteTarget({ type: "attr", id: attr.id, name: attr.name })
                    }
                    className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded transition-colors"
                    title="Delete attribute"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Values section (expandable) */}
              {isExpanded && (
                <div className="border-t border-border px-5 py-4 bg-surface">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {attr.values.length === 0 && (
                      <span className="text-xs text-text-secondary/60">No values yet</span>
                    )}
                    {attr.values.map((v) => (
                      <span
                        key={v.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-card border border-border rounded-full text-sm text-text"
                      >
                        {v.value}
                        <button
                          onClick={() =>
                            setDeleteTarget({ type: "value", id: v.id, name: v.value })
                          }
                          className="p-0.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-full transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Add value…"
                      value={newValueText}
                      onChange={(e) => setNewValueText(e.target.value)}
                      className="h-8 py-1 text-sm max-w-xs"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddValue(attr.id);
                        }
                      }}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAddValue(attr.id)}
                      disabled={!newValueText.trim()}
                    >
                      <Plus size={14} className="mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Create Modal ─────────────────────────────────────── */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Attribute">
        <div className="space-y-4">
          <Input
            label="Attribute Name"
            value={newAttrName}
            onChange={(e) => setNewAttrName(e.target.value)}
            placeholder="e.g. Size, Color, Material"
            autoFocus
          />
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Input Type</label>
            <select
              value={newAttrType}
              onChange={(e) => setNewAttrType(e.target.value)}
              className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-border bg-card text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            >
              {ATTR_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} disabled={!newAttrName.trim()}>
              Create
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirmation Modal ─────────────────────────── */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Delete"
      >
        <p className="text-text-secondary mb-6">
          {deleteTarget?.type === "attr"
            ? `Delete attribute "${deleteTarget.name}" and all its values? This cannot be undone.`
            : `Delete value "${deleteTarget?.name}"?`}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={deleteTarget?.type === "attr" ? handleDeleteAttribute : handleDeleteValue}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
