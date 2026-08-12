import { useEffect, useState } from "react";
import { Search, ArrowRight, Sparkles, TrendingUp, Truck, ShieldCheck } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

const HERO_SLIDES = [
  {
    badge: "Member-only deals",
    title: "Everything you need,",
    titleAccent: "all in one hive",
    sub: "Shop millions of products across 10+ categories. Fast shipping, secure checkout, member-only prices.",
    cta: "Start Shopping",
    image: "🛍️",
    bg: "from-emerald-50 via-sky-50 to-amber-50",
  },
  {
    badge: "Up to 60% off",
    title: "Big brands,",
    titleAccent: "smaller prices",
    sub: "Aurora, ZenBook, Glow, Coast, Trail and 200+ premium brands — all at hive-direct pricing.",
    cta: "Explore Deals",
    image: "💼",
    bg: "from-amber-50 via-rose-50 to-emerald-50",
  },
  {
    badge: "Free shipping $50+",
    title: "Delivered fast,",
    titleAccent: "worldwide",
    sub: "Ships across USA, Canada, UK, AU, India, UAE, Singapore, EU and Japan. Track every step.",
    cta: "Shop Electronics",
    image: "🚚",
    bg: "from-sky-50 via-indigo-50 to-emerald-50",
  },
];

const QUICK_TAGS = ["Wireless Headphones", "Smartwatch", "Sneakers", "Yoga Mat", "Coffee Beans", "LED Strip"];

export function Hero() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const id = setInterval(() => setCurrent((c) => (c + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);

  const slide = HERO_SLIDES[current];

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    navigate({ to: "/shop", search: q ? ({ q } as any) : ({} as any) });
  }

  return (
    <section className={`relative overflow-hidden bg-gradient-to-br ${slide.bg} transition-colors duration-700`}>
      {/* Decorative hex pattern */}
      <div className="absolute inset-0 bg-hive-pattern opacity-40 pointer-events-none" />
      {/* Floating hex ornaments */}
      <div className="absolute top-20 right-[8%] size-24 opacity-30 animate-float-slow pointer-events-none">
        <Hex />
      </div>
      <div className="absolute bottom-12 left-[12%] size-16 opacity-20 animate-float-slow pointer-events-none" style={{ animationDelay: "1.5s" }}>
        <Hex />
      </div>
      <div className="absolute top-1/2 right-[20%] size-12 opacity-25 animate-float-slow pointer-events-none" style={{ animationDelay: "0.8s" }}>
        <Hex />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-16 sm:pb-24 grid lg:grid-cols-2 gap-10 items-center">
        {/* Left content */}
        <div className="text-center lg:text-left">
          <span
            key={slide.badge}
            className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur text-hive text-[11px] font-bold uppercase tracking-[0.18em] px-3 py-1.5 rounded-full border border-hive/20 animate-scale-in"
          >
            <Sparkles className="size-3" />
            {slide.badge}
          </span>

          <h1
            key={slide.title}
            className="mt-5 font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-ink animate-scale-in"
          >
            {slide.title}
            <br />
            <span className="text-gradient-hive">{slide.titleAccent}</span>
          </h1>

          <p key={slide.sub} className="mt-5 text-base sm:text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 animate-scale-in">
            {slide.sub}
          </p>

          {/* Search bar */}
          <form onSubmit={onSearch} className="mt-8 max-w-xl mx-auto lg:mx-0">
            <div className="relative flex items-center bg-white rounded-full shadow-card border border-border overflow-hidden">
              <Search className="absolute left-5 size-5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for headphones, sneakers, coffee…"
                className="flex-1 pl-12 pr-3 py-4 text-sm bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                className="m-1.5 bg-hive hover:bg-hive-dark text-white px-5 sm:px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
              >
                Search
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </form>

          {/* Quick tags */}
          <div className="mt-5 flex flex-wrap gap-2 justify-center lg:justify-start">
            <span className="text-xs text-muted-foreground self-center">Trending:</span>
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => navigate({ to: "/shop", search: { q: tag } as any })}
                className="text-xs px-3 py-1.5 rounded-full bg-white/60 hover:bg-white border border-border hover:border-hive/40 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap gap-5 justify-center lg:justify-start text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Truck className="size-4 text-hive" /> Free over $50
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-hive" /> Secure checkout
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="size-4 text-hive" /> 200+ brands
            </span>
          </div>

          {/* Slide dots */}
          <div className="mt-8 flex items-center gap-2 justify-center lg:justify-start">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? "w-8 h-2 bg-hive" : "w-2 h-2 bg-hive/30 hover:bg-hive/50"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right — visual */}
        <div className="relative hidden lg:block">
          <div className="relative aspect-square max-w-md mx-auto">
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-hive/40 via-sky-hive/30 to-amber-hive/40 blur-3xl rounded-full" />
            {/* Big emoji circle */}
            <div
              key={slide.image}
              className="relative size-full grid place-items-center bg-white rounded-[3rem] shadow-card border border-border animate-scale-in"
            >
              <span className="text-[18rem] leading-none animate-float-slow">{slide.image}</span>
            </div>

            {/* Floating cards */}
            <div className="absolute -top-4 -left-6 bg-white rounded-2xl shadow-card border border-border p-3 flex items-center gap-2 animate-float-slow">
              <span className="size-9 rounded-xl bg-hive/10 grid place-items-center text-lg">🎧</span>
              <div>
                <div className="text-xs font-semibold">Bestseller</div>
                <div className="text-[10px] text-muted-foreground">$199</div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-2 bg-white rounded-2xl shadow-card border border-border p-3 flex items-center gap-2 animate-float-slow" style={{ animationDelay: "1s" }}>
              <span className="size-9 rounded-xl bg-amber-hive/15 grid place-items-center text-lg">⭐</span>
              <div>
                <div className="text-xs font-semibold">4.8 / 5</div>
                <div className="text-[10px] text-muted-foreground">12k reviews</div>
              </div>
            </div>

            <div className="absolute top-1/2 -right-10 bg-white rounded-2xl shadow-card border border-border p-3 flex items-center gap-2 animate-float-slow" style={{ animationDelay: "0.5s" }}>
              <span className="size-9 rounded-xl bg-emerald-100 grid place-items-center text-lg">🚚</span>
              <div>
                <div className="text-xs font-semibold">Free ship</div>
                <div className="text-[10px] text-muted-foreground">over $50</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Hex() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <polygon points="50,5 90,27 90,73 50,95 10,73 10,27" fill="none" stroke="#10b981" strokeWidth="3" />
      <polygon points="50,20 75,35 75,65 50,80 25,65 25,35" fill="#10b981" opacity="0.2" />
    </svg>
  );
}
