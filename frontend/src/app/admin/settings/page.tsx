"use client";

import { useEffect, useState, useCallback } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Skeleton } from "@/components/ui/Skeleton";
import { useUIStore } from "@/stores/ui";
import { api } from "@/lib/api";

interface SiteSettings {
  id: number;
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  currency: string;
  tax_rate: number;
  shipping_fee: number;
  free_shipping_min: number;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  logo_url: string;
  favicon_url: string;
  updated_at: string;
}

const defaults: SiteSettings = {
  id: 1,
  site_name: "Store",
  site_description: "",
  contact_email: "",
  contact_phone: "",
  address: "",
  currency: "USD",
  tax_rate: 0,
  shipping_fee: 0,
  free_shipping_min: 0,
  facebook_url: "",
  twitter_url: "",
  instagram_url: "",
  logo_url: "",
  favicon_url: "",
  updated_at: "",
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-[var(--radius-lg)] p-5 lg:p-6">
      <h3 className="text-lg font-heading font-semibold text-text mb-5 pb-3 border-b border-border">
        {title}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { showToast } = useUIStore();
  const [form, setForm] = useState<SiteSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<SiteSettings>("/admin/settings");
      setForm(data);
    } catch {
      showToast("Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateField = (field: keyof SiteSettings) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.patch<SiteSettings>("/admin/settings", {
        site_name: form.site_name,
        site_description: form.site_description,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        address: form.address,
        currency: form.currency,
        tax_rate: form.tax_rate,
        shipping_fee: form.shipping_fee,
        free_shipping_min: form.free_shipping_min,
        facebook_url: form.facebook_url,
        twitter_url: form.twitter_url,
        instagram_url: form.instagram_url,
        logo_url: form.logo_url,
        favicon_url: form.favicon_url,
      });
      setForm(updated);
      showToast("Settings saved", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save settings";
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
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-[var(--radius-lg)]" />
          <Skeleton className="h-48 rounded-[var(--radius-lg)]" />
          <Skeleton className="h-48 rounded-[var(--radius-lg)]" />
          <Skeleton className="h-48 rounded-[var(--radius-lg)]" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text">Settings</h1>
          <p className="text-text-secondary text-sm mt-1">Manage your store configuration</p>
        </div>
        <Button variant="primary" onClick={handleSubmit} loading={saving}>
          <Save size={16} className="mr-1.5" />
          Save Changes
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* General */}
        <SectionCard title="General">
          <Input
            id="site_name"
            label="Store Name"
            value={form.site_name}
            onChange={updateField("site_name")}
          />
          <Textarea
            id="site_description"
            label="Store Description"
            value={form.site_description}
            onChange={updateField("site_description")}
          />
          <Input
            id="logo_url"
            label="Logo URL"
            value={form.logo_url}
            onChange={updateField("logo_url")}
            placeholder="/uploads/logo.png"
          />
          <Input
            id="favicon_url"
            label="Favicon URL"
            value={form.favicon_url}
            onChange={updateField("favicon_url")}
            placeholder="/uploads/favicon.ico"
          />
        </SectionCard>

        {/* Contact */}
        <SectionCard title="Contact">
          <Input
            id="contact_email"
            label="Contact Email"
            type="email"
            value={form.contact_email}
            onChange={updateField("contact_email")}
          />
          <Input
            id="contact_phone"
            label="Phone Number"
            value={form.contact_phone}
            onChange={updateField("contact_phone")}
          />
          <Textarea
            id="address"
            label="Business Address"
            value={form.address}
            onChange={updateField("address")}
          />
        </SectionCard>

        {/* Social */}
        <SectionCard title="Social Links">
          <Input
            id="facebook_url"
            label="Facebook URL"
            value={form.facebook_url}
            onChange={updateField("facebook_url")}
            placeholder="https://facebook.com/your-store"
          />
          <Input
            id="twitter_url"
            label="Twitter URL"
            value={form.twitter_url}
            onChange={updateField("twitter_url")}
            placeholder="https://twitter.com/your-store"
          />
          <Input
            id="instagram_url"
            label="Instagram URL"
            value={form.instagram_url}
            onChange={updateField("instagram_url")}
            placeholder="https://instagram.com/your-store"
          />
        </SectionCard>

        {/* Business */}
        <SectionCard title="Business Settings">
          <Input
            id="currency"
            label="Currency"
            value={form.currency}
            onChange={updateField("currency")}
            placeholder="USD"
          />
          <Input
            id="tax_rate"
            label="Tax Rate (%)"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={form.tax_rate}
            onChange={updateField("tax_rate")}
          />
          <Input
            id="shipping_fee"
            label="Shipping Fee"
            type="number"
            step="0.01"
            min="0"
            value={form.shipping_fee}
            onChange={updateField("shipping_fee")}
          />
          <Input
            id="free_shipping_min"
            label="Free Shipping Minimum"
            type="number"
            step="0.01"
            min="0"
            value={form.free_shipping_min}
            onChange={updateField("free_shipping_min")}
          />
        </SectionCard>
      </form>
    </div>
  );
}
