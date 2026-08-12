import { CheckCircle2, AlertCircle, Flame, ShoppingCart, Eye, Star, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart";

const FALLBACK_EMOJI = "📦";

export interface Product {
  id?: string;
  brand: string;
  name: string;
  spec: string;
  price: number;
  originalPrice?: number | null;
  discountEnabled?: boolean;
  monthly: number;
  badge: string;
  stock: "in" | "low" | "out";
  image?: string | null;
  category?: string;
  rating?: number;
  reviews?: number;
}

export function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  const [adding, setAdding] = useState(false);
  const [qty, setQty] = useState(1);

  const showDiscount = !!(p.discountEnabled && p.originalPrice && p.originalPrice > p.price);
  const discountPct = showDiscount
    ? Math.round(((p.originalPrice! - p.price) / p.originalPrice!) * 100)
    : 0;
  const savings = showDiscount ? p.originalPrice! - p.price : 0;
  const soldOut = p.stock === "out";
  const stockLabel = p.stock === "in" ? "In Stock" : p.stock === "low" ? "Low Stock" : "Sold Out";
  const stockColor =
    p.stock === "in" ? "text-emerald-600 dark:text-emerald-400" : p.stock === "low" ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground";

  const rating = p.rating ?? (4 + Math.floor(Math.random() * 10) / 10);
  const reviews = p.reviews ?? Math.floor(50 + Math.random() * 2000);

  // If image_url is an emoji-style URL (we use emoji as fallback), display emoji instead.
  const isEmojiImage = p.image && /^[\p{Emoji}]+$/u.test(p.image.trim());
  const img = isEmojiImage ? p.image : (p.image && p.image.startsWith("http") ? p.image : null);

  function handleAdd() {
    if (soldOut) return toast.error("This product is sold out");
    setAdding(true);
    add({
      id: p.id ?? `${p.brand}-${p.name}`,
      brand: p.brand,
      name: p.name,
      price: p.price,
      image: p.image,
    });
    toast.success(`${p.brand} ${p.name} added to cart`, {
      description: `$${p.price.toFixed(2)} · ${qty} × item`,
    });
    setTimeout(() => setAdding(false), 900);
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border card-hover">
      {/* Badges top-left */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
        {p.badge && (
          <span className="bg-background/95 backdrop-blur text-foreground text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full border border-border">
            {p.badge}
          </span>
        )}
        {showDiscount && (
          <span className="bg-racing-red text-white text-[10px] font-bold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full flex items-center gap-1">
            <Flame className="size-3" />
            -{discountPct}%
          </span>
        )}
      </div>

      {/* Image area */}
      {p.id ? (
        <Link
          to="/product/$id"
          params={{ id: p.id }}
          className="block relative aspect-square bg-gradient-to-br from-secondary/60 to-background overflow-hidden"
        >
          {img ? (
            <img
              src={img}
              alt={`${p.brand} ${p.name}`}
              loading="lazy"
              className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-7xl sm:text-8xl group-hover:scale-105 transition-transform duration-300">
              {isEmojiImage ? p.image : FALLBACK_EMOJI}
            </div>
          )}

          {p.stock === "low" && (
            <div className="absolute bottom-2.5 left-2.5 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full">
              Only a few left
            </div>
          )}
        </Link>
      ) : (
        <div className="relative aspect-square bg-gradient-to-br from-secondary/60 to-background overflow-hidden">
          {img ? (
            <img src={img} alt={`${p.brand} ${p.name}`} loading="lazy" className="w-full h-full object-contain p-3" />
          ) : (
            <div className="w-full h-full grid place-items-center text-7xl sm:text-8xl">
              {isEmojiImage ? p.image : FALLBACK_EMOJI}
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Brand + rating */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-hive">{p.brand}</span>
          <span className="flex items-center gap-1 text-[11px] font-medium">
            <Star className="size-3 fill-amber-hive text-amber-hive" />
            {rating.toFixed(1)}
            <span className="text-muted-foreground">({reviews > 1000 ? `${(reviews/1000).toFixed(1)}k` : reviews})</span>
          </span>
        </div>

        {/* Name */}
        <h3 className="font-semibold text-sm leading-snug line-clamp-2">
          {p.id ? (
            <Link to="/product/$id" params={{ id: p.id }} className="hover:text-hive transition-colors">
              {p.name}
            </Link>
          ) : (
            <span>{p.name}</span>
          )}
        </h3>
        {p.spec && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.spec}</p>}

        {/* Price + stock */}
        <div className="mt-3 flex items-end justify-between">
          <div>
            {showDiscount && (
              <span className="text-xs text-muted-foreground line-through mr-1.5">
                ${p.originalPrice!.toFixed(2)}
              </span>
            )}
            <span className={`text-xl font-bold tracking-tight ${showDiscount ? "text-racing-red" : "text-foreground"}`}>
              ${p.price.toFixed(2)}
            </span>
            {showDiscount && (
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-600 dark:text-emerald-400 mt-0.5">
                Save ${savings.toFixed(2)}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className={`text-[10px] font-semibold flex items-center gap-1 justify-end ${stockColor}`}>
              {p.stock === "in" ? <CheckCircle2 className="size-3" /> : <AlertCircle className="size-3" />}
              {stockLabel}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">${p.monthly}/mo</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2 mt-auto">
          <button
            onClick={handleAdd}
            disabled={soldOut}
            className={`relative px-3 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] flex items-center justify-center gap-1.5 transition-all ${
              soldOut
                ? "bg-secondary text-muted-foreground cursor-not-allowed"
                : adding
                ? "bg-emerald-500 text-white"
                : "bg-hive text-white hover:bg-hive-dark hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {adding ? (
              <>
                <CheckCircle2 className="size-3.5" /> Added!
              </>
            ) : soldOut ? (
              "Sold Out"
            ) : (
              <>
                <ShoppingCart className="size-3.5" /> Add to Cart
              </>
            )}
          </button>

          {p.id ? (
            <Link
              to="/product/$id"
              params={{ id: p.id }}
              className="grid place-items-center w-10 rounded-full border border-border text-muted-foreground hover:text-hive hover:border-hive/40 transition-colors"
              aria-label="View details"
            >
              <Eye className="size-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
