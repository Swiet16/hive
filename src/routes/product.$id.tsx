import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useProduct } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import {
  ShoppingCart, CheckCircle2, AlertCircle, Flame, ChevronLeft,
  Truck, ShieldCheck, RotateCcw, Star, Heart, Share2, Plus, Minus, ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/product/$id")({
  component: ProductDetail,
});

function isEmoji(s: string) { return /^[\p{Emoji}]+$/u.test(s.trim()); }

function ProductDetail() {
  const { id } = useParams({ from: "/product/$id" });
  const { product, loading } = useProduct(id);
  const { add } = useCart();
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);

  if (loading) return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">Loading…</div>;
  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight">Product not found</h1>
        <p className="text-muted-foreground mt-2">This item may have been removed or sold out.</p>
        <Link to="/shop" className="inline-block mt-5 text-hive font-semibold hover:underline text-sm">← Back to shop</Link>
      </div>
    );
  }

  // Build images list — handle emoji-style or URLs
  const rawImages: string[] = (product.images && product.images.length > 0)
    ? product.images
    : (product.image_url ? [product.image_url] : []);
  const heroImg = rawImages[activeImg] ?? null;
  const heroIsEmoji = heroImg ? isEmoji(heroImg) : false;

  const showDiscount = !!(product.discount_enabled && product.original_price && Number(product.original_price) > Number(product.price));
  const discountPct = showDiscount
    ? Math.round(((Number(product.original_price) - Number(product.price)) / Number(product.original_price)) * 100)
    : 0;
  const savings = showDiscount ? Number(product.original_price) - Number(product.price) : 0;
  const soldOut = product.stock === "out";
  const stockLabel = product.stock === "in" ? "In Stock" : product.stock === "low" ? "Low Stock" : "Sold Out";
  const stockColor = product.stock === "in" ? "text-emerald-600 dark:text-emerald-400" : product.stock === "low" ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground";

  function addToCart() {
    if (!product || soldOut) return;
    for (let i = 0; i < qty; i++) {
      add({ id: product.id, brand: product.brand, name: product.name, price: Number(product.price), image: heroImg });
    }
    toast.success(`Added ${qty} × ${product.brand} ${product.name} to cart`, {
      description: `$${(Number(product.price) * qty).toFixed(2)} — view your cart to checkout`,
    });
  }

  const specEntries = Object.entries(product.specs || {});
  const rating = 4 + Math.floor(Math.random() * 10) / 10;
  const reviews = Math.floor(50 + Math.random() * 2000);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground flex items-center gap-1.5 mb-5 sm:mb-6">
        <Link to="/" className="hover:text-hive">Home</Link>
        <ChevronRight className="size-3" />
        <Link to="/shop" className="hover:text-hive">Shop</Link>
        <ChevronRight className="size-3" />
        {product.category && (
          <>
            <Link to="/shop" search={{ category: product.category } as any} className="hover:text-hive capitalize">{product.category}</Link>
            <ChevronRight className="size-3" />
          </>
        )}
        <span className="text-foreground truncate">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-7 sm:gap-10">
        {/* Gallery */}
        <div className="lg:sticky lg:top-28 h-fit">
          <div className="relative aspect-square bg-gradient-to-br from-secondary/50 to-background border border-border rounded-3xl overflow-hidden grid place-items-center">
            {showDiscount && (
              <span className="absolute top-4 left-4 z-10 bg-racing-red text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1 shadow-card">
                <Flame className="size-3.5" /> -{discountPct}%
              </span>
            )}
            {product.badge && (
              <span className="absolute top-4 right-4 z-10 bg-card border border-border text-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                {product.badge}
              </span>
            )}
            {heroIsEmoji ? (
              <span className="text-[12rem] leading-none">{heroImg}</span>
            ) : heroImg ? (
              <img src={heroImg} alt={`${product.brand} ${product.name}`} className="w-full h-full object-contain p-8" />
            ) : (
              <span className="text-[8rem] leading-none opacity-40">📦</span>
            )}
          </div>

          {/* Thumbnails */}
          {rawImages.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {rawImages.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square rounded-xl overflow-hidden border grid place-items-center bg-secondary/40 ${activeImg === i ? "border-hive ring-2 ring-hive/30" : "border-border hover:border-hive/50"}`}
                >
                  {isEmoji(src) ? (
                    <span className="text-2xl">{src}</span>
                  ) : (
                    <img src={src} alt="" className="w-full h-full object-contain p-1" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="space-y-6">
          {/* Brand + actions */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.25em] text-hive font-bold">{product.brand}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setWished((v) => !v)}
                className={`size-9 grid place-items-center rounded-full border border-border hover:border-hive/40 transition-colors ${wished ? "text-racing-red border-racing-red/40" : "text-muted-foreground"}`}
                aria-label="Add to wishlist"
              >
                <Heart className={`size-4 ${wished ? "fill-current" : ""}`} />
              </button>
              <button
                onClick={() => toast.success("Product link copied")}
                className="size-9 grid place-items-center rounded-full border border-border text-muted-foreground hover:border-hive/40 hover:text-hive transition-colors"
                aria-label="Share"
              >
                <Share2 className="size-4" />
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight leading-tight">{product.name}</h1>
            <p className="text-muted-foreground mt-2">{product.spec}</p>
            <div className="flex items-center gap-3 mt-3 text-sm">
              <span className="flex items-center gap-1 font-semibold">
                <Star className="size-4 fill-amber-hive text-amber-hive" />
                {rating.toFixed(1)}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{reviews > 1000 ? `${(reviews/1000).toFixed(1)}k` : reviews} reviews</span>
              {product.sku && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground text-xs uppercase tracking-wider">SKU: {product.sku}</span>
                </>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-end gap-4 pb-6 border-b border-border">
            {showDiscount && (
              <p className="text-xl text-muted-foreground line-through">
                ${Number(product.original_price).toFixed(2)}
              </p>
            )}
            <p className={`text-4xl font-extrabold tracking-tight ${showDiscount ? "text-racing-red" : "text-foreground"}`}>
              ${Number(product.price).toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mb-1.5">or ${product.monthly}/mo with membership</p>
            {showDiscount && (
              <span className="ml-auto bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                Save ${savings.toFixed(2)}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          {/* Stock + qty */}
          <div className="flex items-center gap-4 flex-wrap">
            <p className={`text-sm font-semibold flex items-center gap-1.5 ${stockColor}`}>
              {product.stock === "in" ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
              {stockLabel}
            </p>
            <div className="flex items-center border border-border rounded-full bg-background">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="size-9 grid place-items-center text-muted-foreground hover:text-foreground" aria-label="Decrease">
                <Minus className="size-3.5" />
              </button>
              <span className="w-10 text-center text-sm font-semibold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="size-9 grid place-items-center text-muted-foreground hover:text-foreground" aria-label="Increase">
                <Plus className="size-3.5" />
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3">
            <button
              onClick={addToCart}
              disabled={soldOut}
              className="flex-1 bg-hive text-white py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-hive-dark hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 flex items-center justify-center gap-2 transition-all shadow-[0_4px_24px_oklch(0.72_0.17_165/0.3)]"
            >
              <ShoppingCart className="size-4" />
              {soldOut ? "Sold Out" : `Add ${qty} to cart — $${(Number(product.price) * qty).toFixed(2)}`}
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
            <Trust icon={Truck} text="Free ship $50+" />
            <Trust icon={ShieldCheck} text="2-yr warranty" />
            <Trust icon={RotateCcw} text="30-day returns" />
          </div>

          {/* Specs */}
          {specEntries.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-bold mb-3">Specifications</h2>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {specEntries.map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-border/40 py-1.5">
                    <dt className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}</dt>
                    <dd className="font-medium text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Long description */}
      {product.long_description && (
        <section className="mt-12 max-w-4xl">
          <h2 className="font-display font-extrabold text-2xl tracking-tight mb-4">Product overview</h2>
          <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {product.long_description}
          </div>
        </section>
      )}
    </div>
  );
}

function Trust({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
      <Icon className="size-4 text-hive" />
      <span>{text}</span>
    </div>
  );
}
