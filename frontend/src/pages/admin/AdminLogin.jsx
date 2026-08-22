import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLogin() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) navigate("/admin");
    else setError(result.error);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-obsidian bg-noise px-4" data-testid="admin-login-page">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md rounded-3xl bg-white p-10 shadow-2xl"
      >
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Manofox" className="h-9 w-9 rounded-full object-cover" />
          <span className="font-display text-xl font-extrabold tracking-tight text-obsidian">MANO<span className="text-fox">FOX</span></span>
        </div>
        <h1 className="mt-8 font-display text-3xl font-extrabold tracking-tight text-obsidian">Admin Panel</h1>
        <p className="mt-2 text-sm text-neutral-500">Sign in to manage leads and site content.</p>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600" data-testid="admin-login-error">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="mt-8 space-y-6" data-testid="admin-login-form">
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Email</label>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-neutral-200 px-4 focus-within:border-fox">
              <Mail className="h-4 w-4 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@manofox.com"
                data-testid="admin-email-input"
                className="w-full py-3 text-sm focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Password</label>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-neutral-200 px-4 focus-within:border-fox">
              <Lock className="h-4 w-4 text-neutral-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                data-testid="admin-password-input"
                className="w-full py-3 text-sm focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            data-testid="admin-login-submit"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-fox py-3.5 font-display font-bold text-white transition-transform duration-200 hover:scale-[1.02] hover:bg-fox-dark disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"} <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}