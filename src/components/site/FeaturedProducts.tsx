import { ProductCard } from "./ProductCard";
import { useProducts } from "@/hooks/use-products";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";

export function FeaturedProducts() {
  const { products, loading } = useProducts({ featured: true });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      <div className="flex flex-wrap justify-between items-end gap-4 sm:gap-6 mb-8 sm:mb-12">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-hive font-bold">
            <Sparkles className="size-3" />
            Hand-picked for you
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight mt-2">
            Bestselling products, <span className="text-gradient-hive">hive-direct prices</span>
          </h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-md">
            Top-rated picks across every category — verified by thousands of happy shoppers.
          </p>
        </div>
        <Link
          to="/shop"
          className="flex items-center gap-1.5 text-sm font-semibold text-hive hover:gap-2.5 transition-all"
        >
          View entire shop
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl border border-border bg-secondary/40 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              p={{
                id: p.id,
                brand: p.brand,
                name: p.name,
                spec: p.spec,
                price: Number(p.price),
                originalPrice: p.original_price ? Number(p.original_price) : null,
                discountEnabled: p.discount_enabled,
                monthly: p.monthly,
                badge: p.badge,
                stock: p.stock,
                image: p.image_url,
                category: p.category,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 rounded-2xl border border-dashed border-border">
      <div className="text-5xl mb-3">🐝</div>
      <h3 className="font-semibold text-lg">Featured products coming soon</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
        No products have been marked as featured yet. Head to the admin console to add some.
      </p>
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-hive hover:gap-2.5 transition-all"
      >
        Open admin console <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
