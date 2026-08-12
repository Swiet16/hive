import { createFileRoute, Link } from "@tanstack/react-router";
import { useProducts } from "@/hooks/use-products";
import { useMemo } from "react";
import { ArrowRight, Award } from "lucide-react";

export const Route = createFileRoute("/brands")({
  component: BrandsPage,
});

function BrandsPage() {
  const { products, loading } = useProducts();
  const brands = useMemo(() => {
    const map = new Map<string, { count: number; cat: string }>();
    for (const p of products) {
      const cur = map.get(p.brand);
      if (cur) cur.count += 1;
      else map.set(p.brand, { count: 1, cat: p.category });
    }
    return Array.from(map.entries())
      .map(([brand, info]) => ({ brand, ...info }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8 sm:mb-10">
        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-hive font-bold">
          <Award className="size-3" />
          Top Brands
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight mt-2">
          200+ brands, <span className="text-gradient-hive">one marketplace</span>
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl text-sm sm:text-base">
          Aurora, ZenBook, Glow, Coast, Trail and more — premium brands across every category, all at hive-direct prices.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[5/3] rounded-2xl border border-border bg-secondary/40 animate-pulse" />
          ))}
        </div>
      ) : brands.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">No brands found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {brands.map(({ brand, count, cat }) => (
            <Link
              key={brand}
              to="/shop"
              search={{ brand } as any}
              className="group relative bg-card border border-border rounded-2xl p-5 sm:p-6 card-hover flex flex-col justify-between min-h-[140px] overflow-hidden"
            >
              {/* Big initial */}
              <div className="absolute -bottom-4 -right-4 text-7xl font-display font-extrabold opacity-5 select-none">
                {brand.slice(0, 2).toUpperCase()}
              </div>
              <div className="relative">
                <div className="font-display font-bold text-xl sm:text-2xl tracking-tight group-hover:text-hive transition-colors">
                  {brand}
                </div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1 capitalize">
                  {cat}
                </div>
              </div>
              <div className="relative flex justify-between items-end text-[10px] uppercase tracking-widest text-muted-foreground mt-3">
                <span>{count} {count === 1 ? "product" : "products"}</span>
                <span className="group-hover:text-hive flex items-center gap-1">
                  Shop <ArrowRight className="size-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
