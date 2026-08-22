import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { NAV_LINKS } from "@/data/site";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-4 flex items-center justify-between rounded-full border border-black/5 bg-white/70 backdrop-blur-xl px-5 py-3 shadow-sm">
          <Link to="/" data-testid="nav-logo" className="flex items-center gap-2">
            <img src="/logo.png" alt="Manofox" className="h-8 w-8 rounded-full object-cover" />
            <span className="font-display text-lg font-extrabold tracking-tight text-obsidian">
              MANO<span className="text-fox">FOX</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" data-testid="nav-links">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `relative rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                    isActive ? "text-fox" : "text-obsidian/70 hover:text-obsidian"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/contact"
              data-testid="nav-cta-button"
              className="hidden lg:inline-flex items-center gap-1.5 rounded-full bg-fox px-5 py-2.5 text-sm font-semibold text-white transition-transform duration-200 hover:scale-105 hover:bg-fox-dark"
            >
              Start a Project <ArrowUpRight className="h-4 w-4" />
            </Link>
            <button
              data-testid="nav-mobile-toggle"
              onClick={() => setOpen(!open)}
              className="lg:hidden grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden mx-4 mt-2 rounded-3xl border border-black/5 bg-white/95 backdrop-blur-xl p-4 shadow-xl"
            data-testid="nav-mobile-menu"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                data-testid={`nav-mobile-link-${link.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 font-display text-lg font-bold ${
                    isActive ? "bg-fox-light text-fox" : "text-obsidian"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              data-testid="nav-mobile-cta"
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-fox px-5 py-3 font-semibold text-white"
            >
              Start a Project <ArrowUpRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}