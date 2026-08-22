import { Navigate, NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, FileText, Newspaper, Mail, ExternalLink, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/leads", label: "Leads", icon: Users },
  { to: "/admin/blogs", label: "Blog", icon: Newspaper },
  { to: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { to: "/admin/content", label: "Site Content", icon: FileText },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (user === null) {
    return (
      <div className="grid min-h-screen place-items-center bg-secondary" data-testid="admin-loading">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-fox border-t-transparent" />
      </div>
    );
  }
  if (user === false) return <Navigate to="/admin/login" replace />;

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-secondary" data-testid="admin-layout">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-black/5 bg-white">
        <div className="flex items-center gap-2 border-b border-black/5 px-6 py-5">
          <img src="/logo.png" alt="Manofox" className="h-8 w-8 rounded-full object-cover" />
          <span className="font-display text-lg font-extrabold tracking-tight text-obsidian">MANO<span className="text-fox">FOX</span></span>
        </div>
        <nav className="flex-1 space-y-1 p-4" data-testid="admin-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              data-testid={`admin-nav-${item.label.toLowerCase().replace(" ", "-")}`}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
                  isActive ? "bg-fox text-white" : "text-neutral-600 hover:bg-fox-light hover:text-fox"
                }`
              }
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </NavLink>
          ))}
          <Link
            to="/"
            data-testid="admin-view-site"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-neutral-600 transition-colors duration-200 hover:bg-fox-light hover:text-fox"
          >
            <ExternalLink className="h-4 w-4" /> View Site
          </Link>
        </nav>
        <div className="border-t border-black/5 p-4">
          <div className="rounded-xl bg-secondary px-4 py-3">
            <p className="text-sm font-bold text-obsidian">{user.name}</p>
            <p className="truncate text-xs text-neutral-500">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            data-testid="admin-logout-button"
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 transition-colors duration-200 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>
      <main className="ml-64 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}