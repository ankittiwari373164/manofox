import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { NAV_LINKS, SERVICES, SOCIALS } from "@/data/site";
import { useSiteContent } from "@/lib/content";

export default function Footer() {
  const content = useSiteContent();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/newsletter", { email });
      toast.success(data.message);
      setEmail("");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-obsidian text-white" data-testid="site-footer">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Manofox" className="h-9 w-9 rounded-full object-cover" />
              <span className="font-display text-xl font-extrabold tracking-tight">MANO<span className="text-fox">FOX</span></span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              Empower your brand with data-driven insights, creative solutions, and cutting-edge technology.
            </p>
            <form onSubmit={subscribe} className="mt-8 flex max-w-sm items-center gap-2" data-testid="newsletter-form">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                data-testid="newsletter-email-input"
                className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm placeholder:text-white/40 focus:border-fox focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                data-testid="newsletter-subscribe-button"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-fox transition-transform duration-200 hover:scale-110 disabled:opacity-50"
                aria-label="Subscribe"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white/40">Company</h4>
            <ul className="mt-5 space-y-3 text-sm">
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-white/70 transition-colors duration-200 hover:text-fox">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white/40">Services</h4>
            <ul className="mt-5 space-y-3 text-sm">
              {SERVICES.slice(0, 5).map((s) => (
                <li key={s.slug}>
                  <Link to="/services" className="text-white/70 transition-colors duration-200 hover:text-fox">{s.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white/40">Contact</h4>
            <ul className="mt-5 space-y-4 text-sm text-white/70">
              <li className="flex items-start gap-3"><Phone className="mt-0.5 h-4 w-4 text-fox" /> {content.contact_phone}</li>
              <li className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 text-fox" /> {content.contact_email}</li>
              <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 text-fox" /> {content.contact_address}</li>
            </ul>
            <div className="mt-6 flex gap-4">
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" data-testid={`footer-social-${s.label.toLowerCase()}`} className="text-xs font-bold uppercase tracking-widest text-white/50 transition-colors duration-200 hover:text-fox">
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-white/40">© 2026 Manofox Pvt. Ltd. All rights reserved.</p>
          <Link to="/admin/login" data-testid="footer-admin-link" className="text-xs font-semibold text-white/40 transition-colors duration-200 hover:text-fox">
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
}