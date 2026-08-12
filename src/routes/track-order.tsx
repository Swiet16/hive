import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  Package, Search, CheckCircle2, Circle, Truck, ClipboardCheck,
  PackageCheck, Loader2, MapPin, Calendar, FileText, RefreshCw,
} from "lucide-react";
import { ORDER_STAGES, stageIndex } from "@/lib/catalog";
import { lookupOrderPublic } from "@/lib/track-order.functions";

export const Route = createFileRoute("/track-order")({
  component: TrackPage,
});

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  total_cents: number;
  currency: string;
  created_at: string;
  updated_at?: string;
  admin_review_status?: string;
  tracking_number?: string | null;
  admin_notes?: string | null;
  expected_delivery_date?: string | null;
};
type HistoryRow = { id: string; status: string; note: string | null; created_at: string };

const STAGE_ICONS = [ClipboardCheck, CheckCircle2, Package, Truck, PackageCheck];

const STAGE_COLORS = [
  { done: "bg-emerald-500/20 border-emerald-400 text-emerald-300", active: "bg-blue-600 border-blue-500 text-white shadow-blue-500/40" },
  { done: "bg-emerald-500/20 border-emerald-400 text-emerald-300", active: "bg-indigo-600 border-indigo-500 text-white shadow-indigo-500/40" },
  { done: "bg-emerald-500/20 border-emerald-400 text-emerald-300", active: "bg-amber-600 border-amber-500 text-white shadow-amber-500/40" },
  { done: "bg-emerald-500/20 border-emerald-400 text-emerald-300", active: "bg-racing-red border-racing-red text-white shadow-racing-red/40" },
  { done: "bg-emerald-500/20 border-emerald-400 text-emerald-300", active: "bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/40" },
];

function TruckAnimation({ stage }: { stage: number }) {
  const pct = Math.max(2, (stage / (ORDER_STAGES.length - 1)) * 100);
  return (
    <div className="relative h-10 mb-2">
      <div className="absolute inset-y-1/2 left-0 right-0 h-px bg-border" />
      <div
        className="absolute inset-y-1/2 left-0 h-0.5 bg-gradient-to-r from-racing-red/60 to-racing-red transition-all duration-1000 ease-out"
        style={{ width: `${pct}%` }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000 ease-out"
        style={{ left: `${pct}%` }}
      >
        <div className="relative">
          <span className="absolute -inset-3 rounded-full bg-racing-red/20 animate-ping" />
          <Truck className="size-7 text-racing-red drop-shadow-lg relative" />
        </div>
      </div>
      {ORDER_STAGES.map((_, i) => (
        <div
          key={i}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-2 rounded-full transition-colors duration-500"
          style={{ left: `${(i / (ORDER_STAGES.length - 1)) * 100}%` }}
        >
          <div className={`size-2 rounded-full ${i <= stage ? "bg-racing-red" : "bg-border"}`} />
        </div>
      ))}
    </div>
  );
}

function TrackPage() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [justUpdated, setJustUpdated] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!order?.id) return;
    const channel = supabase
      .channel(`order-${order.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${order.id}` },
        (payload: any) => {
          setOrder((prev) => (prev ? { ...prev, ...(payload.new as OrderRow) } : prev));
          setJustUpdated(true);
          setTimeout(() => setJustUpdated(false), 3000);
        })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "order_status_history", filter: `order_id=eq.${order.id}` },
        (payload: any) => setHistory((h) => [...h, payload.new as HistoryRow]))
      .subscribe();
    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [order?.id]);

  useEffect(() => {
    if (!user) { setRecent([]); return; }
    supabase
      .from("orders")
      .select("id,order_number,status,total_cents,currency,created_at,updated_at,admin_review_status,tracking_number,admin_notes,expected_delivery_date")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }: any) => setRecent((data ?? []) as any));
  }, [user]);

  async function doLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setOrder(null);
    setHistory([]);
    try {
      const res = await lookupOrderPublic(q.trim());
      if (!res.ok) setError(res.error);
      else {
        setOrder(res.order as OrderRow);
        setHistory((res.history ?? []) as HistoryRow[]);
      }
    } catch (err: any) {
      setError(err?.message || "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  function selectRecent(r: OrderRow) {
    setOrder(r);
    setQ(r.order_number);
    setError(null);
    supabase
      .from("order_status_history" as any)
      .select("*")
      .eq("order_id", r.id)
      .order("created_at")
      .then(({ data }: any) => setHistory((data ?? []) as any));
  }

  const idx = order ? stageIndex(order.status) : -1;
  const progressPct = order ? Math.max(2, (idx / (ORDER_STAGES.length - 1)) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="animate-fade-in mb-8 sm:mb-10">
        <span className="text-[10px] uppercase tracking-[0.3em] text-racing-red font-bold flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-emerald-400" />
          </span>
          Live Shipment Tracking
        </span>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl uppercase tracking-tight mt-2">Track Order</h1>
        <p className="text-silver/50 text-sm mt-3">Real-time updates — any order number, no login required.</p>
      </div>

      {user && recent.length > 0 && !order && (
        <div className="mb-8 animate-fade-in">
          <p className="text-[10px] uppercase tracking-widest text-silver/50 mb-3">Your recent orders</p>
          <div className="flex flex-wrap gap-2">
            {recent.map((r, i) => (
              <button
                key={r.id}
                onClick={() => selectRecent(r)}
                className="font-mono text-xs px-4 py-2.5 border border-border rounded-xl hover:border-racing-red hover:bg-racing-red/5 transition-all duration-200 flex items-center gap-2 group"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Package className="size-3 text-silver/40 group-hover:text-racing-red transition-colors" />
                {r.order_number}
                <span className="text-silver/40">·</span>
                <span className={`text-[10px] font-bold uppercase ${r.status === "delivered" ? "text-emerald-400" : r.status === "shipped" ? "text-blue-400" : "text-silver/60"}`}>
                  {r.status}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={doLookup} className="flex gap-2 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-silver/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value.toUpperCase())}
            placeholder="WD-XXXXXXXX"
            className="w-full pl-11 pr-4 py-3.5 bg-graphite/50 border border-border rounded-xl text-sm focus:outline-none focus:border-racing-red font-mono uppercase transition-colors"
            required
          />
        </div>
        <button
          className="bg-racing-red text-white px-6 rounded-xl text-xs font-bold uppercase tracking-widest hover-glow flex items-center gap-2 disabled:opacity-60 transition-all hover:scale-[1.02] active:scale-95"
          disabled={loading}
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          {loading ? "Searching…" : "Track"}
        </button>
      </form>

      {error && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm px-5 py-4 rounded-xl animate-fade-in flex items-center gap-3">
          <Package className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {justUpdated && (
        <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs px-4 py-2.5 rounded-lg animate-fade-in flex items-center gap-2">
          <RefreshCw className="size-3.5 animate-spin" />
          Order status just updated!
        </div>
      )}

      {order && (
        <div className="animate-fade-in space-y-6">
          {/* Header card */}
          <div className="relative bg-gradient-to-br from-graphite/80 to-onyx/60 border border-border rounded-2xl p-7 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.15),transparent_60%)] pointer-events-none" />
            <div className="absolute -bottom-8 -right-8 size-40 bg-racing-red/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex size-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full size-2.5 bg-emerald-400" />
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-bold">Live tracking active</span>
                </div>
                <p className="font-mono text-3xl font-bold">{order.order_number}</p>
                <p className="text-[11px] uppercase tracking-widest text-silver/50 mt-2">
                  Placed {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-silver/40">Total</p>
                <p className="text-3xl font-semibold mt-1">
                  {(order.total_cents / 100).toLocaleString("en-US", { style: "currency", currency: order.currency })}
                </p>
                <span className={`inline-block mt-2 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${
                  order.status === "delivered" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" :
                  order.status === "shipped" ? "bg-blue-500/15 text-blue-300 border-blue-500/30" :
                  "bg-racing-red/15 text-racing-red border-racing-red/30"
                }`}>
                  {ORDER_STAGES[idx]?.label ?? order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Truck progress animation */}
          <div className="bg-graphite/40 border border-border rounded-2xl p-7">
            <h2 className="font-display text-2xl uppercase tracking-tight mb-6 flex items-center gap-3">
              <Truck className="size-6 text-racing-red" />
              Shipment Progress
            </h2>

            <TruckAnimation stage={idx} />

            {/* Progress bar */}
            <div className="relative h-2 bg-secondary/40 rounded-full mb-8 mt-6 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-racing-red to-emerald-400 transition-all duration-1000 ease-out rounded-full"
                style={{ width: `${progressPct}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"
                style={{ left: `${progressPct - 10}%` }}
              />
            </div>

            <div className="grid sm:grid-cols-5 gap-3">
              {ORDER_STAGES.map((stage, i) => {
                const Icon = STAGE_ICONS[i] ?? Circle;
                const done = i < idx;
                const active = i === idx;
                const colors = STAGE_COLORS[i] ?? STAGE_COLORS[0];
                return (
                  <div
                    key={stage.key}
                    className="text-center"
                    style={{ animation: "fadeIn 0.5s ease both", animationDelay: `${i * 100}ms` }}
                  >
                    <div
                      className={[
                        "mx-auto size-14 rounded-2xl grid place-items-center mb-3 transition-all duration-500 border-2",
                        done && colors.done,
                        active && `${colors.active} shadow-lg scale-110`,
                        !done && !active && "bg-secondary/30 border-border/50 text-silver/30",
                      ].filter(Boolean).join(" ")}
                    >
                      {active ? (
                        <span className="relative grid place-items-center">
                          <span className="absolute inline-flex h-10 w-10 rounded-xl opacity-40 animate-ping" style={{ background: "currentColor" }} />
                          <Icon className="size-6 relative" />
                        </span>
                      ) : done ? (
                        <CheckCircle2 className="size-6 text-emerald-400" />
                      ) : (
                        <Icon className="size-5" />
                      )}
                    </div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest leading-tight ${
                      active ? "text-foreground" : done ? "text-emerald-300" : "text-silver/35"
                    }`}>
                      {stage.label}
                    </p>
                    {active && (
                      <p className="text-[9px] text-silver/50 mt-1 leading-relaxed">{stage.desc}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info cards */}
          {(order.tracking_number || order.expected_delivery_date || order.admin_notes) && (
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="bg-graphite/40 border border-border rounded-2xl p-5 flex items-start gap-3">
                <div className="size-9 rounded-xl bg-blue-500/15 border border-blue-500/30 grid place-items-center shrink-0">
                  <MapPin className="size-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-silver/40 mb-1">Tracking #</p>
                  <p className="font-mono text-sm break-all">{order.tracking_number || "Not yet assigned"}</p>
                </div>
              </div>
              <div className="bg-graphite/40 border border-border rounded-2xl p-5 flex items-start gap-3">
                <div className="size-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 grid place-items-center shrink-0">
                  <Calendar className="size-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-silver/40 mb-1">Expected delivery</p>
                  <p className="text-sm">
                    {order.expected_delivery_date
                      ? new Date(order.expected_delivery_date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })
                      : "To be confirmed"}
                  </p>
                </div>
              </div>
              <div className="bg-graphite/40 border border-border rounded-2xl p-5 flex items-start gap-3">
                <div className="size-9 rounded-xl bg-racing-red/15 border border-racing-red/30 grid place-items-center shrink-0">
                  <FileText className="size-4 text-racing-red" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-silver/40 mb-1">Notes from team</p>
                  <p className="text-sm text-silver/80">{order.admin_notes || "—"}</p>
                </div>
              </div>
            </div>
          )}

          {/* History timeline */}
          {history.length > 0 && (
            <div className="bg-graphite/40 border border-border rounded-2xl p-7">
              <h3 className="font-display text-xl uppercase tracking-tight mb-5">Status timeline</h3>
              <div className="space-y-0">
                {[...history].reverse().map((h, i) => (
                  <div
                    key={h.id}
                    className="relative flex gap-4 pb-5 last:pb-0"
                    style={{ animation: "fadeIn 0.4s ease both", animationDelay: `${i * 80}ms` }}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`size-3 rounded-full border-2 mt-1 shrink-0 ${i === 0 ? "bg-emerald-400 border-emerald-400" : "bg-border border-border"}`} />
                      {i < history.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                    </div>
                    <div className="pb-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-foreground">{h.status}</p>
                      {h.note && <p className="text-xs text-silver/60 mt-0.5">{h.note}</p>}
                      <p className="text-[10px] text-silver/40 mt-1">{new Date(h.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {order.updated_at && (
            <p className="text-[10px] uppercase tracking-widest text-silver/40 text-center flex items-center justify-center gap-2">
              <RefreshCw className="size-3" />
              Last update {new Date(order.updated_at).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {!order && !error && (
        <div className="text-center mt-12 space-y-3">
          <div className="relative inline-flex">
            <Package className="size-12 text-silver/20" />
            <Truck className="size-5 text-racing-red absolute -bottom-1 -right-1" />
          </div>
          <p className="text-xs text-silver/40">Enter any order number — no login required.</p>
        </div>
      )}
    </div>
  );
}
