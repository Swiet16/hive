import { supabase } from "@/integrations/supabase/client";

export async function lookupOrderPublic(order_number: string): Promise<
  | { ok: false; error: string }
  | { ok: true; order: any; history: any[] }
> {
  const code = order_number.trim().toUpperCase();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id,order_number,status,total_cents,currency,created_at,updated_at,admin_review_status,tracking_number,admin_notes,expected_delivery_date",
    )
    .eq("order_number", code)
    .maybeSingle();

  if (error) return { ok: false, error: "Lookup failed" };
  if (!order) return { ok: false, error: "No order found with that number" };

  const { data: history } = await (supabase as any)
    .from("order_status_history")
    .select("id,status,note,created_at")
    .eq("order_id", order.id)
    .order("created_at");

  return { ok: true, order, history: history ?? [] };
}
