import { useEffect, useState } from "react";
import { Trash2, RefreshCw, Mail, Download } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Newsletter() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/subscribers");
      setSubs(data);
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const confirmDelete = async () => {
    try {
      await api.delete(`/admin/subscribers/${toDelete.id}`);
      setSubs((prev) => prev.filter((s) => s.id !== toDelete.id));
      toast.success("Subscriber removed");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setToDelete(null);
    }
  };

  const exportCsv = () => {
    const rows = [["Email", "Subscribed On"], ...subs.map((s) => [s.email, s.created_at])];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "manofox-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div data-testid="admin-newsletter-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-obsidian">Newsletter</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {subs.length} subscriber{subs.length === 1 ? "" : "s"} collected from the footer signup form.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCsv}
            disabled={!subs.length}
            data-testid="newsletter-export-button"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-obsidian transition-colors duration-200 hover:border-fox hover:text-fox disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={fetchSubs}
            data-testid="newsletter-refresh-button"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-obsidian transition-colors duration-200 hover:border-fox hover:text-fox"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white">
        {loading ? (
          <div className="grid h-48 place-items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-fox border-t-transparent" />
          </div>
        ) : subs.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center" data-testid="newsletter-empty-state">
            <Mail className="h-10 w-10 text-neutral-300" />
            <p className="mt-4 font-semibold text-neutral-500">No subscribers yet</p>
            <p className="text-sm text-neutral-400">Emails collected from the site footer will show up here.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm" data-testid="newsletter-table">
            <thead>
              <tr className="border-b border-black/5 text-xs uppercase tracking-widest text-neutral-400">
                <th className="px-6 py-4 font-bold">Email</th>
                <th className="px-6 py-4 font-bold">Subscribed</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {subs.map((s) => (
                <tr key={s.id} className="transition-colors duration-150 hover:bg-fox-light/40" data-testid={`sub-row-${s.id}`}>
                  <td className="px-6 py-4 font-semibold text-obsidian">{s.email}</td>
                  <td className="px-6 py-4 text-neutral-500">
                    {new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setToDelete(s)}
                      data-testid={`sub-delete-${s.id}`}
                      className="inline-grid h-9 w-9 place-items-center rounded-full text-red-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-600"
                      aria-label="Remove subscriber"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <AlertDialogContent data-testid="delete-sub-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this subscriber?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{toDelete?.email}</strong> will no longer be counted as subscribed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="delete-sub-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600" data-testid="delete-sub-confirm">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
