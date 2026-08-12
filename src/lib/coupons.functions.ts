import { supabase } from "@/integrations/supabase/client";

export type ValidatedCoupon = {
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  discount_cents: number;
  coupon_id: string;
};

export async function validateCoupon({
  code,
  subtotal_cents,
}: {
  code: string;
  subtotal_cents: number;
}): Promise<{ ok: false; error: string } | { ok: true; coupon: ValidatedCoupon }> {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;

  const normalizedCode = code.trim().toUpperCase();

  const { data: c, error } = await (supabase as any)
    .from("coupons")
    .select(
      "id,code,discount_type,discount_value,max_uses,used_count,active,expires_at,starts_at,min_order_cents,target_type,target_user_ids,first_order_only,max_uses_per_user",
    )
    .eq("code", normalizedCode)
    .maybeSingle();

  if (error || !c) return { ok: false, error: "Invalid coupon code" };

  const now = new Date();
  if (!c.active) return { ok: false, error: "Coupon is no longer active" };
  if (c.starts_at && new Date(c.starts_at) > now)
    return { ok: false, error: "Coupon is not yet active" };
  if (c.expires_at && new Date(c.expires_at) < now)
    return { ok: false, error: "Coupon has expired" };
  if (c.max_uses != null && (c.used_count ?? 0) >= c.max_uses)
    return { ok: false, error: "Coupon usage limit reached" };
  if ((c.min_order_cents ?? 0) > subtotal_cents) {
    const min = ((c.min_order_cents ?? 0) / 100).toFixed(2);
    return { ok: false, error: `Minimum order of $${min} required` };
  }

  if (c.target_type === "user") {
    const list: string[] = c.target_user_ids ?? [];
    if (!userId || !list.includes(userId))
      return { ok: false, error: "This coupon is not available for your account" };
  }

  if (userId) {
    const { count: ordersCount } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    const userOrders = ordersCount ?? 0;

    if (c.first_order_only && userOrders > 0)
      return { ok: false, error: "Coupon valid only on your first order" };
    if (c.target_type === "new_joiners" && userOrders > 0)
      return { ok: false, error: "Coupon is for new customers only" };
    if (c.target_type === "min_orders" && userOrders < 3)
      return { ok: false, error: "Coupon unlocks after a few orders" };

    if (c.max_uses_per_user != null) {
      const { count: myUses } = await (supabase as any)
        .from("coupon_redemptions")
        .select("id", { count: "exact", head: true })
        .eq("coupon_id", c.id)
        .eq("user_id", userId);
      if ((myUses ?? 0) >= c.max_uses_per_user)
        return { ok: false, error: "You've already used this coupon" };
    }
  }

  const value = Number(c.discount_value);
  const discount_cents =
    c.discount_type === "percent"
      ? Math.round(subtotal_cents * (value / 100))
      : Math.min(Math.round(value * 100), subtotal_cents);

  return {
    ok: true,
    coupon: {
      code: c.code,
      discount_type: c.discount_type as "percent" | "fixed",
      discount_value: value,
      discount_cents,
      coupon_id: c.id,
    } satisfies ValidatedCoupon,
  };
}
