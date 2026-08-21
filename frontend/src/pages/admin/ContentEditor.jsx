import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { DEFAULT_CONTENT } from "@/lib/content";

const FIELDS = [
  { key: "hero_overline", label: "Hero Overline", hint: "Small tagline above the main headline" },
  { key: "hero_title", label: "Hero Title", hint: "Main homepage headline" },
  { key: "hero_subtitle", label: "Hero Subtitle", hint: "Supporting line under the headline", textarea: true },
  { key: "about_heading", label: "About Page Heading", hint: "Main heading on the About page" },
  { key: "about_text", label: "About Page Text", hint: "Intro paragraph on the About page", textarea: true },
  { key: "cta_heading", label: "CTA Section Heading", hint: "Big call-to-action line on the homepage" },
  { key: "contact_email", label: "Contact Email", hint: "Shown in footer and contact page" },
  { key: "contact_phone", label: "Contact Phone", hint: "Shown in footer and contact page" },
  { key: "contact_address", label: "Contact Address", hint: "Shown in footer and contact page", textarea: true },
];

export default function ContentEditor() {
  const [content, setContent] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/content").then(({ data }) => setContent({ ...DEFAULT_CONTENT, ...data })).catch(() => setContent(DEFAULT_CONTENT));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/content", content);
      toast.success("Site content updated — live immediately");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (!content) {
    return <div className="grid h-64 place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-fox border-t-transparent" /></div>;
  }

  return (
    <div data-testid="admin-content-page">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-obsidian">Site Content</h1>
      <p className="mt-1 text-sm text-neutral-500">Edit key copy across the marketing site. Changes go live instantly.</p>

      <form onSubmit={save} className="mt-8 max-w-3xl space-y-6" data-testid="content-form">
        {FIELDS.map((f) => (
          <div key={f.key} className="rounded-2xl border border-black/5 bg-white p-6">
            <label className="text-sm font-bold text-obsidian">{f.label}</label>
            <p className="mt-0.5 text-xs text-neutral-400">{f.hint}</p>
            {f.textarea ? (
              <textarea
                rows={3}
                value={content[f.key]}
                onChange={(e) => setContent({ ...content, [f.key]: e.target.value })}
                data-testid={`content-field-${f.key}`}
                className="mt-3 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:border-fox focus:outline-none"
              />
            ) : (
              <input
                value={content[f.key]}
                onChange={(e) => setContent({ ...content, [f.key]: e.target.value })}
                data-testid={`content-field-${f.key}`}
                className="mt-3 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:border-fox focus:outline-none"
              />
            )}
          </div>
        ))}
        <button
          type="submit"
          disabled={saving}
          data-testid="content-save-button"
          className="inline-flex items-center gap-2 rounded-full bg-fox px-7 py-3.5 font-display font-bold text-white transition-transform duration-200 hover:scale-105 hover:bg-fox-dark disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
