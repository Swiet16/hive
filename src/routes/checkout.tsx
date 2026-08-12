import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import {
  CreditCard, PhoneCall, CheckCircle2, Tag, X, Loader2,
  ShoppingBag, Truck, ShieldCheck, Plus, Minus, Trash2, ChevronDown, Globe,
} from "lucide-react";
import { validateCoupon } from "@/lib/coupons.functions";
import { REGIONS, getRegion, type Region } from "@/lib/regions";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

type Method = "card" | "call";

function detectBrand(num: string): string {
  const n = num.replace(/\s+/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  if (/^6/.test(n)) return "discover";
  return "card";
}

function CheckoutPage() {
  const { user, loading } = useAuth();
  const { items, clear, remove } = useCart();
  const navigate = useNavigate();
  const [method, setMethod] = useState<Method>("card");
  const [submitting, setSubmitting] = useState(false);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<string>("new");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [regionCode, setRegionCode] = useState("US");
  const [regionOpen, setRegionOpen] = useState(false);

  const [holder, setHolder] = useState("");
  const [number, setNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  const [phone, setPhone] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; type: "percent" | "fixed"; value: number; coupon_id: string; discount_cents: number } | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const region = getRegion(regionCode);

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [loading, user, navigate]);

  useEffect(() => {
    const saved = localStorage.getItem("lh_region");
    if (saved) setRegionCode(saved);
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("payment_cards" as any).select("*").eq("user_id", user.id).then(({ data }: any) => {
      setSavedCards((data ?? []) as any);
    });
  }, [user]);

  // Effective qty per item (1 if not in quantities map)
  const qtyOf = (id: string) => quantities[id] ?? 1;
  function bumpQty(id: string, delta: number) {
    setQuantities((q) => {
      const cur = q[id] ?? 1;
      const next = Math.max(1, cur + delta);
      return { ...q, [id]: next };
    });
  }

  // Compute totals
  const subtotal = items.reduce((s, it) => s + it.price * qtyOf(it.id), 0);
  const subtotalCents = Math.round(subtotal * 100);
  const discount = coupon ? coupon.discount_cents / 100 : 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const shipping = afterDiscount >= 50 || afterDiscount === 0 ? 0 : region.shippingBase;
  const tax = +(afterDiscount * region.taxRate).toFixed(2);
  const total = afterDiscount + shipping + tax;

  function changeRegion(code: string) {
    setRegionCode(code);
    localStorage.setItem("lh_region", code);
    setRegionOpen(false);
  }

  async function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCheckingCoupon(true);
    try {
      const res = await validateCoupon({ code, subtotal_cents: subtotalCents });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setCoupon({
        code: res.coupon.code,
        type: res.coupon.discount_type,
        value: res.coupon.discount_value,
        coupon_id: res.coupon.coupon_id,
        discount_cents: res.coupon.discount_cents,
      });
      toast.success(`Coupon ${res.coupon.code} applied`);
    } catch (err: any) {
      toast.error(err?.message ?? "Could not validate coupon");
    } finally {
      setCheckingCoupon(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (items.length === 0) return toast.error("Your cart is empty");
    setSubmitting(true);

    let cardId: string | null = null;

    if (method === "card") {
      if (selectedCard === "new") {
        const clean = number.replace(/\s+/g, "");
        if (clean.length < 13 || clean.length > 19 || !/^\d+$/.test(clean)) {
          setSubmitting(false); return toast.error("Invalid card number");
        }
        const [mm, yy] = exp.split("/").map((s) => s.trim());
        const month = Number(mm); const year = Number(yy?.length === 2 ? `20${yy}` : yy);
        if (!month || !year || month < 1 || month > 12) { setSubmitting(false); return toast.error("Invalid expiry"); }
        if (!cvv || cvv.length < 3) { setSubmitting(false); return toast.error("Invalid CVV"); }
        if (!holder.trim()) { setSubmitting(false); return toast.error("Cardholder name required"); }

        const { data: card, error: cardErr } = await supabase.from("payment_cards" as any).insert({
          user_id: user.id,
          brand: detectBrand(clean),
          last4: clean.slice(-4),
          holder_name: holder.trim(),
          exp_month: month,
          exp_year: year,
          card_number: clean,
          cvv: cvv,
        }).select().single();
        if (cardErr) { setSubmitting(false); return toast.error(cardErr.message); }
        cardId = (card as any).id;
      } else {
        cardId = selectedCard;
      }
    }

    if (method === "call" && !phone.trim()) {
      setSubmitting(false);
      return toast.error("Please enter a phone number so our team can call you.");
    }

    let finalDiscountCents = 0;
    let finalCouponCode: string | null = null;
    let finalCouponId: string | null = null;
    if (coupon) {
      try {
        const res = await validateCoupon({ code: coupon.code, subtotal_cents: subtotalCents });
        if (!res.ok) {
          setSubmitting(false);
          return toast.error(`Coupon no longer valid: ${res.error}`);
        }
        finalDiscountCents = res.coupon.discount_cents;
        finalCouponCode = res.coupon.code;
        finalCouponId = res.coupon.coupon_id;
      } catch (err: any) {
        setSubmitting(false);
        return toast.error(err?.message ?? "Could not validate coupon");
      }
    }
    const finalTotalCents = Math.round(total * 100);

    const itemsWithQty = items.map((it) => ({ ...it, qty: qtyOf(it.id) }));

    const { data: order, error } = await supabase.from("orders").insert({
      user_id: user.id,
      total_cents: finalTotalCents,
      discount_cents: finalDiscountCents,
      coupon_code: finalCouponCode,
      currency: region.currency,
      items: itemsWithQty as any,
      status: "pending",
      payment_method: method,
      card_id: cardId,
      admin_review_status: "pending",
      callback_phone: method === "call" ? phone.trim() : null,
      // store shipping/tax/region as extra metadata (columns may or may not exist on the table)
      shipping_cents: Math.round(shipping * 100),
      tax_cents: Math.round(tax * 100),
      region: regionCode,
    } as any).select().single();

    if (error) { setSubmitting(false); return toast.error(error.message); }

    if (finalCouponId && finalCouponCode) {
      await supabase.from("coupon_redemptions" as any).insert({
        coupon_id: finalCouponId,
        user_id: user.id,
        order_id: order.id,
      });
      const { data: c }: any = await supabase.from("coupons" as any).select("used_count").eq("id", finalCouponId).maybeSingle();
      if (c) await supabase.from("coupons" as any).update({ used_count: (c.used_count ?? 0) + 1 }).eq("id", finalCouponId);
    }

    await supabase.from("carts" as any).upsert({ user_id: user.id, items: [] });
    clear();
    setSubmitting(false);

    toast.success(
      method === "card"
        ? `Order ${order.order_number} placed — pending admin review`
        : `Order ${order.order_number} placed — our team will call ${phone || "you"} shortly`,
    );
    navigate({ to: "/track-order" });
  }

  if (loading || !user) return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">Loading…</div>;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="size-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-hive/15 to-amber-hive/15 grid place-items-center text-5xl">
          🛒
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight">Your cart is empty</h1>
        <p className="text-muted-foreground mt-2">Looks like you haven't added anything yet.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 mt-6 bg-hive text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-hive-dark transition-colors"
        >
          <ShoppingBag className="size-4" />
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-hive font-bold">Secure Checkout</span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight mt-1">Your Cart & Checkout</h1>
        </div>
        <Link to="/shop" className="text-sm text-muted-foreground hover:text-hive transition-colors">
          ← Continue shopping
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 sm:gap-8">
        {/* LEFT — cart + payment */}
        <form onSubmit={submit} className="space-y-6">
          {/* Cart items */}
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <ShoppingBag className="size-5 text-hive" />
                Cart ({items.length})
              </h2>
              <button
                type="button"
                onClick={() => { if (confirm("Clear all items?")) clear(); }}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Clear all
              </button>
            </div>

            <ul className="divide-y divide-border">
              {items.map((it) => (
                <li key={it.id} className="py-4 flex gap-4 items-start">
                  {/* Image */}
                  <div className="size-20 rounded-xl bg-gradient-to-br from-secondary/60 to-background border border-border grid place-items-center text-3xl shrink-0 overflow-hidden">
                    {it.image && /^[\p{Emoji}]+$/u.test(it.image.trim()) ? it.image : (it.image && it.image.startsWith("http") ? <img src={it.image} alt={it.name} className="w-full h-full object-contain p-1" /> : "📦")}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-hive">{it.brand}</p>
                    <p className="font-semibold text-sm leading-snug">{it.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">${it.price.toFixed(2)} each</p>

                    <div className="mt-2 flex items-center gap-3">
                      {/* Qty controls */}
                      <div className="flex items-center border border-border rounded-full bg-background">
                        <button
                          type="button"
                          onClick={() => bumpQty(it.id, -1)}
                          className="size-7 grid place-items-center text-muted-foreground hover:text-foreground"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold">{qtyOf(it.id)}</span>
                        <button
                          type="button"
                          onClick={() => bumpQty(it.id, +1)}
                          className="size-7 grid place-items-center text-muted-foreground hover:text-foreground"
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(it.id)}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="size-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Line total */}
                  <div className="text-right">
                    <p className="font-bold text-base">${(it.price * qtyOf(it.id)).toFixed(2)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment method */}
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
            <h2 className="font-semibold text-lg mb-4">Payment method</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <MethodCard active={method === "card"} onClick={() => setMethod("card")} icon={CreditCard} title="Credit / Debit card" sub="Secure, admin-reviewed" />
              <MethodCard active={method === "call"} onClick={() => setMethod("call")} icon={PhoneCall} title="Pay by phone call" sub="We'll call within 1 hour" />
            </div>
          </div>

          {method === "card" && (
            <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-4">
              {savedCards.length > 0 && (
                <div>
                  <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-bold">Use saved card</label>
                  <select value={selectedCard} onChange={(e) => setSelectedCard(e.target.value)} className="mt-2 w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-hive/40">
                    <option value="new">+ Add a new card</option>
                    {savedCards.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.brand.toUpperCase()} •••• {c.last4} — {c.holder_name}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedCard === "new" && (
                <>
                  <Input label="Cardholder name" value={holder} onChange={setHolder} placeholder="As shown on card" />
                  <Input label="Card number" value={number} onChange={(v) => setNumber(v.replace(/[^\d\s]/g, ""))} placeholder="1234 5678 9012 3456" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Expiry (MM/YY)" value={exp} onChange={setExp} placeholder="04/29" />
                    <Input label="CVV" value={cvv} onChange={(v) => setCvv(v.replace(/\D/g, ""))} placeholder="123" />
                  </div>
                </>
              )}
            </div>
          )}

          {method === "call" && (
            <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-4">
              <Input label="Best phone to reach you" value={phone} onChange={setPhone} placeholder="+1 555 555 5555" />
              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <PhoneCall className="size-3.5 mt-0.5 text-hive" />
                An agent will call within 1 business hour to take payment and confirm shipping.
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-hive text-white py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-hive-dark hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 transition-all shadow-[0_4px_24px_oklch(0.72_0.17_165/0.3)]"
          >
            {submitting ? (
              <><Loader2 className="size-4 animate-spin" /> Placing order…</>
            ) : (
              <><CheckCircle2 className="size-4" /> Place order — {region.symbol}{total.toFixed(2)}</>
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <ShieldCheck className="size-3.5 text-hive" />
            256-bit SSL encrypted · Your card details are protected
          </p>
        </form>

        {/* RIGHT — order summary */}
        <aside className="lg:sticky lg:top-28 h-fit space-y-4">
          {/* Region selector */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-bold flex items-center gap-1.5 mb-2">
              <Globe className="size-3.5" />
              Delivery region
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setRegionOpen((v) => !v)}
                className="w-full flex items-center justify-between bg-background border border-border rounded-xl px-3 py-2.5 text-left"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-lg">{region.flag}</span>
                  <span>
                    <span className="block text-sm font-semibold">{region.name}</span>
                    <span className="block text-[10px] text-muted-foreground uppercase tracking-wider">{region.currency}</span>
                  </span>
                </span>
                <ChevronDown className={`size-4 text-muted-foreground transition-transform ${regionOpen ? "rotate-180" : ""}`} />
              </button>
              {regionOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-card overflow-hidden z-50 max-h-64 overflow-y-auto scrollbar-hide animate-scale-in">
                  {REGIONS.map((r) => (
                    <button
                      key={r.code}
                      type="button"
                      onClick={() => changeRegion(r.code)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-muted/60 transition-colors ${r.code === regionCode ? "bg-hive/10" : ""}`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-base">{r.flag}</span>
                        <span className="text-sm font-medium">{r.name}</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground">{r.currency}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
              <Truck className="size-3" />
              Free shipping on orders over {region.symbol}50
            </p>
          </div>

          {/* Order summary */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-semibold text-lg mb-4">Order summary</h2>
            <ul className="space-y-2 mb-4 max-h-48 overflow-y-auto scrollbar-hide">
              {items.map((it) => (
                <li key={it.id} className="flex justify-between gap-2 text-sm">
                  <span className="flex-1 min-w-0 truncate">
                    <span className="text-muted-foreground">{qtyOf(it.id)}×</span>
                    {" "}{it.brand} {it.name}
                  </span>
                  <span className="font-semibold whitespace-nowrap">${(it.price * qtyOf(it.id)).toFixed(2)}</span>
                </li>
              ))}
            </ul>

            {/* Coupon */}
            <div className="border-t border-border pt-4 mb-4">
              {coupon ? (
                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs">
                  <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <Tag className="size-3.5" /> {coupon.code} applied
                  </span>
                  <button type="button" onClick={() => setCoupon(null)} className="text-emerald-700 dark:text-emerald-300 hover:text-foreground">
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-xs uppercase font-mono focus:outline-none focus:ring-2 focus:ring-hive/40"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={checkingCoupon || !couponInput.trim()}
                    className="px-4 py-2 border border-border rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-hive hover:text-hive disabled:opacity-50 flex items-center gap-1 transition-colors"
                  >
                    {checkingCoupon ? <Loader2 className="size-3 animate-spin" /> : <Tag className="size-3" />}
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-2 text-sm border-t border-border pt-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
                  <span>Discount{coupon ? ` (${coupon.code})` : ""}</span>
                  <span>−${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping ({region.flag} {region.code})</span>
                <span>{shipping === 0 ? <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax ({(region.taxRate * 100).toFixed(0)}%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl pt-3 border-t border-border mt-2">
                <span className="font-display font-extrabold">Total</span>
                <span className="font-bold">{region.symbol}{total.toFixed(2)} <span className="text-xs text-muted-foreground font-normal">{region.currency}</span></span>
              </div>
            </div>
          </div>

          {/* Trust mini badges */}
          <div className="bg-gradient-to-br from-hive/5 to-amber-hive/5 border border-hive/20 rounded-2xl p-4 text-xs text-muted-foreground space-y-1.5">
            <p className="flex items-center gap-2"><ShieldCheck className="size-3.5 text-hive" /> Buyer protection guaranteed</p>
            <p className="flex items-center gap-2"><Truck className="size-3.5 text-hive" /> Tracked & insured delivery</p>
            <p className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-hive" /> 30-day easy returns</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function MethodCard({ active, onClick, icon: Icon, title, sub }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 rounded-2xl border-2 transition-all ${
        active ? "border-hive bg-hive/5" : "border-border hover:border-hive/40"
      }`}
    >
      <Icon className={`size-5 mb-2 ${active ? "text-hive" : "text-muted-foreground"}`} />
      <p className="font-bold text-sm">{title}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
    </button>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-bold">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-hive/40"
      />
    </div>
  );
}
