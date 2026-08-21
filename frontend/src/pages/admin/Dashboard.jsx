import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, TrendingUp, CheckCircle2, Mail, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import api from "@/lib/api";

const STATUS_COLORS = { new: "#FF5C00", contacted: "#F59E0B", converted: "#10B981", closed: "#9CA3AF" };

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/stats").then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  if (!stats) {
    return <div className="grid h-64 place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-fox border-t-transparent" /></div>;
  }

  const cards = [
    { label: "Total Leads", value: stats.total_leads, icon: Users, testId: "stat-total-leads" },
    { label: "New This Week", value: stats.leads_last_7_days, icon: TrendingUp, testId: "stat-week-leads" },
    { label: "Converted", value: stats.by_status.converted, icon: CheckCircle2, testId: "stat-converted" },
    { label: "Subscribers", value: stats.subscribers, icon: Mail, testId: "stat-subscribers" },
  ];

  const chartData = Object.entries(stats.by_status).map(([status, count]) => ({ status, count }));

  return (
    <div data-testid="admin-dashboard">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-obsidian">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">Overview of your leads and audience.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-black/5 bg-white p-6" data-testid={c.testId}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">{c.label}</p>
              <c.icon className="h-5 w-5 text-fox" />
            </div>
            <p className="mt-3 font-display text-4xl font-extrabold tracking-tight text-obsidian">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-black/5 bg-white p-6" data-testid="leads-chart">
          <h2 className="font-display text-lg font-bold text-obsidian">Leads by Status</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="status" tickLine={false} axisLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: "rgba(255,92,0,0.06)" }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-6" data-testid="recent-leads-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-obsidian">Recent Leads</h2>
            <Link to="/admin/leads" data-testid="view-all-leads-link" className="inline-flex items-center gap-1 text-sm font-semibold text-fox">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 divide-y divide-black/5">
            {stats.recent_leads.length === 0 && (
              <p className="py-8 text-center text-sm text-neutral-400">No leads yet. They'll appear here once the contact form is used.</p>
            )}
            {stats.recent_leads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-bold text-obsidian">{lead.name}</p>
                  <p className="text-xs text-neutral-500">{lead.service}</p>
                </div>
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold capitalize"
                  style={{ backgroundColor: `${STATUS_COLORS[lead.status]}1A`, color: STATUS_COLORS[lead.status] }}
                >
                  {lead.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
