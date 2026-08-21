import { useEffect, useState } from "react";
import { Trash2, RefreshCw, Inbox } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TABS = ["all", "new", "contacted", "converted", "closed"];
const STATUS_COLORS = { new: "#FF5C00", contacted: "#F59E0B", converted: "#10B981", closed: "#9CA3AF" };

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);

  const fetchLeads = async (status = tab) => {
    setLoading(true);
    try {
      const { data } = await api.get("/leads", { params: status === "all" ? {} : { status } });
      setLeads(data);
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(tab);
  }, [tab]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/leads/${id}`, { status });
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      toast.success("Status updated");
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/leads/${toDelete.id}`);
      setLeads((prev) => prev.filter((l) => l.id !== toDelete.id));
      toast.success("Lead deleted");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div data-testid="admin-leads-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-obsidian">Leads</h1>
          <p className="mt-1 text-sm text-neutral-500">Every enquiry from your website, in one place.</p>
        </div>
        <button
          onClick={() => fetchLeads()}
          data-testid="leads-refresh-button"
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-obsidian transition-colors duration-200 hover:border-fox hover:text-fox"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="mt-6 flex gap-2" data-testid="leads-filter-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            data-testid={`leads-tab-${t}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors duration-200 ${
              tab === t ? "bg-fox text-white" : "bg-white text-neutral-600 hover:bg-fox-light hover:text-fox"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white">
        {loading ? (
          <div className="grid h-48 place-items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-fox border-t-transparent" />
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center" data-testid="leads-empty-state">
            <Inbox className="h-10 w-10 text-neutral-300" />
            <p className="mt-4 font-semibold text-neutral-500">No leads in this bucket yet</p>
            <p className="text-sm text-neutral-400">New enquiries from the contact form will show up here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" data-testid="leads-table">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-widest text-neutral-400">
                  <th className="px-6 py-4 font-bold">Contact</th>
                  <th className="px-6 py-4 font-bold">Service</th>
                  <th className="px-6 py-4 font-bold">Message</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {leads.map((lead) => (
                  <tr key={lead.id} className="transition-colors duration-150 hover:bg-fox-light/40" data-testid={`lead-row-${lead.id}`}>
                    <td className="px-6 py-4">
                      <p className="font-bold text-obsidian">{lead.name}</p>
                      <p className="text-xs text-neutral-500">{lead.email}</p>
                      {lead.phone && <p className="text-xs text-neutral-500">{lead.phone}</p>}
                    </td>
                    <td className="px-6 py-4 font-medium text-neutral-700">{lead.service}</td>
                    <td className="max-w-xs px-6 py-4">
                      <p className="truncate text-neutral-600" title={lead.message}>{lead.message}</p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-neutral-500">
                      {new Date(lead.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <Select value={lead.status} onValueChange={(v) => updateStatus(lead.id, v)}>
                        <SelectTrigger
                          className="h-9 w-32 rounded-full border-black/10 text-xs font-bold capitalize"
                          style={{ color: STATUS_COLORS[lead.status] }}
                          data-testid={`lead-status-select-${lead.id}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TABS.slice(1).map((s) => (
                            <SelectItem key={s} value={s} className="capitalize" data-testid={`status-option-${s}`}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setToDelete(lead)}
                        data-testid={`lead-delete-${lead.id}`}
                        className="inline-grid h-9 w-9 place-items-center rounded-full text-red-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete lead"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <AlertDialogContent data-testid="delete-lead-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the enquiry from <strong>{toDelete?.name}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="delete-lead-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600" data-testid="delete-lead-confirm">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
