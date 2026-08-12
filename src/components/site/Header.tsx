import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ShoppingCart, User, Menu, X, LayoutDashboard, Shield, LogOut,
  Search, ChevronDown, Globe, Heart, Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRole } from "@/hooks/use-role";
import { useCart } from "@/hooks/use-cart";
import { NotificationsBell } from "./NotificationsBell";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "./Logo";
import { REGIONS, getRegion } from "@/lib/regions";

const NAV = [
  { to: "/",            label: "Home" },
  { to: "/shop",        label: "Shop" },
  { to: "/deals",       label: "Deals" },
  { to: "/brands",      label: "Brands" },
  { to: "/wheels",      label: "Categories" },
  { to: "/financing",   label: "Membership" },
  { to: "/track-order", label: "Track Order" },
  { to: "/contact",     label: "Contact" },
] as const;

const QUICK_CATEGORIES = [
  { id: "electronics", label: "Electronics", icon: "💻" },
  { id: "fashion",     label: "Fashion",     icon: "👗" },
  { id: "home",        label: "Home",        icon: "🛋️" },
  { id: "beauty",      label: "Beauty",      icon: "💄" },
  { id: "sports",      label: "Sports",      icon: "⚽" },
  { id: "grocery",     label: "Grocery",     icon: "🛒" },
  { id: "toys",        label: "Toys & Baby", icon: "🧸" },
  { id: "books",       label: "Books",       icon: "📚" },
  { id: "auto",        label: "Automotive",  icon: "🚗" },
  { id: "garden",      label: "Garden",       icon: "🌱" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [region, setRegion] = useState<string>("US");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const regionRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { isAdmin } = useRole();
  const { count: cartCount } = useCart();

  // Load saved region from localStorage or user metadata
  useEffect(() => {
    const saved = localStorage.getItem("lh_region") || "US";
    setRegion(saved);
  }, []);

  // Close region dropdown on outside click
  useEffect(() => {
    if (!regionOpen) return;
    function onDown(e: MouseEvent) {
      if (regionRef.current && !regionRef.current.contains(e.target as Node)) {
        setRegionOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [regionOpen]);

  function changeRegion(code: string) {
    setRegion(code);
    localStorage.setItem("lh_region", code);
    setRegionOpen(false);
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    navigate({ to: "/shop", search: q ? { q } : {} as any });
    setOpen(false);
  }

  const r = getRegion(region);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Utility bar */}
        <div className="flex justify-between items-center h-9 border-b border-border text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-hive" />
            <span className="hidden sm:inline font-medium">Free shipping over $50 · Member-only deals every week</span>
            <span className="sm:hidden font-medium">Free shipping $50+</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Region selector */}
            <div className="relative" ref={regionRef}>
              <button
                onClick={() => setRegionOpen((v) => !v)}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                aria-label="Select region"
              >
                <Globe className="size-3.5" />
                <span className="font-medium">{r.flag} {region}</span>
                <ChevronDown className={`size-3 transition-transform ${regionOpen ? "rotate-180" : ""}`} />
              </button>
              {regionOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-card overflow-hidden animate-scale-in z-50">
                  <div className="px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground border-b border-border bg-muted/40">
                    Select your region
                  </div>
                  <div className="max-h-72 overflow-y-auto scrollbar-hide">
                    {REGIONS.map((reg) => (
                      <button
                        key={reg.code}
                        onClick={() => changeRegion(reg.code)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-muted/60 transition-colors ${
                          reg.code === region ? "bg-hive/10 text-hive font-semibold" : ""
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">{reg.flag}</span>
                          <span>{reg.name}</span>
                        </span>
                        <span className="text-[10px] text-muted-foreground">{reg.currency}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <a
              href="https://wa.me/15303505985"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors font-medium"
              aria-label="Chat on WhatsApp"
            >
              <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor">
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.518 5.26l-.999 3.648 3.97-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
              </svg>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Main nav */}
        <div className="flex justify-between items-center h-16 sm:h-[72px] gap-3">
          <div className="flex items-center gap-6 lg:gap-10 flex-1 min-w-0">
            <Logo to="/" className="shrink-0" />
            <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-muted-foreground">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="hover:text-foreground transition-colors whitespace-nowrap"
                  activeProps={{ className: "text-foreground font-semibold" }}
                  activeOptions={{ exact: item.to === "/" }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <form onSubmit={onSearch} className="hidden md:flex items-center relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="w-44 lg:w-64 pl-9 pr-3 py-2 rounded-full bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-hive/40 focus:border-hive/40 transition"
              />
            </form>

            <NotificationsBell />

            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3.5 py-2 border border-hive/40 text-hive rounded-full hover:bg-hive/10 transition-colors">
                    <Shield className="size-3.5" />
                    <span>Admin</span>
                  </Link>
                )}
                <Link to="/dashboard" className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3.5 py-2 border border-border rounded-full hover:bg-secondary transition-colors">
                  <LayoutDashboard className="size-3.5" />
                  <span>Dashboard</span>
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 sm:px-4 py-2 border border-border rounded-full hover:bg-secondary transition-colors"
              >
                <User className="size-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            <Link
              to="/checkout"
              className="relative bg-hive text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-full group cursor-pointer overflow-hidden hover-glow flex items-center gap-1.5 sm:gap-2"
            >
              <span className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold">
                <ShoppingCart className="size-4" />
                <span className="hidden sm:inline">Cart</span>
                <span className="bg-white/25 rounded-full px-1.5 py-0.5 text-[10px] leading-none">
                  {cartCount}
                </span>
              </span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 size-4 rounded-full bg-amber-hive text-ink text-[9px] font-bold grid place-items-center animate-scale-in">
                  •
                </span>
              )}
            </Link>

            <button
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden p-2 -mr-1"
              aria-label="Menu"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Quick categories strip */}
        <div className="hidden lg:flex items-center gap-1 h-11 border-t border-border overflow-x-auto scrollbar-hide">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground pr-3 shrink-0">Shop by category</span>
          {QUICK_CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to="/shop"
              search={{ category: c.id } as any}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <span>{c.icon}</span>
              <span>{c.label}</span>
            </Link>
          ))}
        </div>

        {/* Mobile nav */}
        {open && (
          <div className="lg:hidden pb-6 flex flex-col gap-1">
            {/* Mobile search */}
            <form onSubmit={onSearch} className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full pl-9 pr-3 py-2.5 rounded-full bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-hive/40"
              />
            </form>

            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
                activeProps={{ className: "text-foreground bg-secondary font-semibold" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile categories */}
            <div className="border-t border-border my-2 pt-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-3 mb-2">Categories</div>
              <div className="grid grid-cols-2 gap-1">
                {QUICK_CATEGORIES.map((c) => (
                  <Link
                    key={c.id}
                    to="/shop"
                    search={{ category: c.id } as any}
                    onClick={() => setOpen(false)}
                    className="px-3 py-2 rounded-lg hover:bg-secondary text-sm flex items-center gap-2"
                  >
                    <span>{c.icon}</span>
                    <span>{c.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-border my-2" />

            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-hive hover:bg-hive/10 font-semibold"
                  >
                    <Shield className="size-4" /> Admin Console
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-secondary"
                >
                  <LayoutDashboard className="size-4" /> Dashboard
                </Link>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-secondary text-left"
                >
                  <LogOut className="size-4" /> Sign out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-hive text-white font-semibold justify-center"
              >
                <User className="size-4" /> Sign In / Create Account
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
