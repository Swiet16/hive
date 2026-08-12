import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Send, ShieldCheck, Truck, RefreshCw, Headphones } from "lucide-react";
import { useEffect, useRef } from "react";
import { Logo } from "./Logo";

const DISPATCH_ITEMS = [
  "🚚 Free shipping over $50",
  "📦 Tracked & insured worldwide",
  "⚡ Same-day processing on all orders",
  "🔒 Secure checkout — your data is protected",
  "🌍 Delivering to 10+ regions",
  "🎁 Member-only deals every week",
  "↩️ 30-day easy returns",
  "💬 24/7 customer support",
];

function DispatchTicker() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let x = 0;
    let raf: number;
    const speed = 0.5;
    function step() {
      x -= speed;
      const half = track!.scrollWidth / 2;
      if (Math.abs(x) >= half) x = 0;
      track!.style.transform = `translateX(${x}px)`;
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const doubled = [...DISPATCH_ITEMS, ...DISPATCH_ITEMS];

  return (
    <div className="relative overflow-hidden bg-hive text-white py-3 select-none">
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-hive to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-hive to-transparent z-10 pointer-events-none" />
      <div ref={trackRef} className="flex whitespace-nowrap will-change-transform">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] mx-8">
            {item}
            <span className="text-amber-hive mx-2">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const TRUST = [
  { icon: Truck,       title: "Fast Shipping",      sub: "Free over $50, worldwide" },
  { icon: ShieldCheck, title: "Secure Checkout",    sub: "256-bit SSL encrypted" },
  { icon: RefreshCw,   title: "30-Day Returns",     sub: "Hassle-free, no questions" },
  { icon: Headphones,  title: "24/7 Support",       sub: "Real humans, every day" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-20">
      {/* Trust badges */}
      <div className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="grid place-items-center size-11 rounded-xl bg-hive/10 text-hive shrink-0">
                <Icon className="size-5" />
              </span>
              <div>
                <div className="text-sm font-semibold">{title}</div>
                <div className="text-xs text-muted-foreground">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DispatchTicker />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
        <div className="lg:col-span-2 max-w-sm">
          <Logo to="/" />
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
            Life Hive is your one-stop online marketplace — everything you need,
            all in one place. From electronics to home, beauty, sports, grocery,
            and beyond, we deliver quality products to 10+ regions worldwide.
          </p>

          {/* Newsletter */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-6 flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pl-9 pr-3 py-2.5 rounded-full bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-hive/40"
              />
            </div>
            <button
              type="submit"
              className="bg-hive text-white size-10 grid place-items-center rounded-full hover:bg-hive-dark transition-colors"
              aria-label="Subscribe"
            >
              <Send className="size-4" />
            </button>
          </form>

          <div className="mt-6 space-y-2 text-xs text-muted-foreground">
            <a href="https://wa.me/15303505985" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-emerald-500 text-emerald-600 dark:text-emerald-400 transition-colors font-medium">
              <Phone className="size-3.5 shrink-0" />
              <span>+1 530 350 5985 (WhatsApp)</span>
            </a>
            <a href="mailto:hello@lifehive.shop" className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Mail className="size-3.5 shrink-0" />
              <span>hello@lifehive.shop</span>
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="size-3.5 shrink-0" />
              <span>Worldwide delivery — 10+ regions</span>
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4 font-bold">Shop</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/shop"     className="hover:text-hive transition-colors">All Products</Link></li>
            <li><Link to="/shop" search={{ category: "electronics" } as any} className="hover:text-hive transition-colors">Electronics</Link></li>
            <li><Link to="/shop" search={{ category: "fashion" } as any}     className="hover:text-hive transition-colors">Fashion</Link></li>
            <li><Link to="/shop" search={{ category: "home" } as any}        className="hover:text-hive transition-colors">Home & Living</Link></li>
            <li><Link to="/shop" search={{ category: "beauty" } as any}     className="hover:text-hive transition-colors">Beauty</Link></li>
            <li><Link to="/deals" className="hover:text-hive transition-colors">Today's Deals</Link></li>
            <li><Link to="/brands" className="hover:text-hive transition-colors">Top Brands</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4 font-bold">Support</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/dashboard"      className="hover:text-hive transition-colors">My Account</Link></li>
            <li><Link to="/track-order"    className="hover:text-hive transition-colors">Track Order</Link></li>
            <li><Link to="/financing"       className="hover:text-hive transition-colors">Membership</Link></li>
            <li><Link to="/contact"         className="hover:text-hive transition-colors">Contact Us</Link></li>
            <li><Link to="/wheels"          className="hover:text-hive transition-colors">All Categories</Link></li>
            <li><a href="#"                className="hover:text-hive transition-colors">Returns & Warranty</a></li>
            <li><a href="#"                className="hover:text-hive transition-colors">Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Life Hive. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span>We accept</span>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-1 rounded text-[10px] font-bold bg-secondary border border-border">VISA</span>
              <span className="px-2 py-1 rounded text-[10px] font-bold bg-secondary border border-border">MC</span>
              <span className="px-2 py-1 rounded text-[10px] font-bold bg-secondary border border-border">AMEX</span>
              <span className="px-2 py-1 rounded text-[10px] font-bold bg-secondary border border-border">PAYPAL</span>
              <span className="px-2 py-1 rounded text-[10px] font-bold bg-secondary border border-border">APPLE PAY</span>
            </div>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
