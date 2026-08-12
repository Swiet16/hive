import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DbProduct {
  id: string;
  brand: string;
  name: string;
  spec: string;
  category: string;
  price: number;
  original_price: number | null;
  discount_enabled: boolean;
  monthly: number;
  badge: string;
  stock: "in" | "low" | "out";
  image_url: string | null;
  featured: boolean;
  sort_order: number;
  description: string;
  long_description: string;
  images: string[];
  specs: Record<string, string>;
  sku: string | null;
  weight_lbs: number | null;
}

export function useProducts(opts: { category?: string; featured?: boolean; dealsOnly?: boolean } = {}) {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      let q = supabase.from("products" as any).select("*").order("sort_order");
      if (opts.category) q = q.eq("category", opts.category);
      if (opts.featured) q = q.eq("featured", true);
      if (opts.dealsOnly) q = q.eq("discount_enabled", true);
      const { data, error } = await q;
      if (cancelled) return;
      if (error) setError(error.message);
      else setProducts((data as any as DbProduct[]) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.category, opts.featured, opts.dealsOnly]);

  return { products, loading, error };
}

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("products" as any).select("*").eq("id", id).maybeSingle();
      if (!cancelled) { setProduct((data as any) ?? null); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [id]);

  return { product, loading };
}
