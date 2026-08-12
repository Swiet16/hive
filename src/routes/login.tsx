import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Eye, EyeOff, User, Mail, Phone, Lock, ArrowRight, Loader2,
  CheckCircle2, ChevronDown, Globe, ShoppingBag, Truck, ShieldCheck,
} from "lucide-react";
import { REGIONS, getRegion } from "@/lib/regions";
import { Logo, LogoMark } from "@/components/site/Logo";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [regionCode, setRegionCode] = useState("US");
  const [regionOpen, setRegionOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Pick up region from localStorage if previously selected
    const saved = localStorage.getItem("lh_region");
    if (saved) setRegionCode(saved);
  }, []);

  const region = getRegion(regionCode);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "signup" && !agreed) {
      toast.error("Please accept the terms to create an account");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const phoneTrim = phone.trim();
        if (phoneTrim.length < 6) throw new Error("Please enter a valid phone number");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              full_name: fullName,
              phone: phoneTrim,
              region: regionCode,
            },
          },
        });
        if (error) throw error;
        if (data.user) {
          await supabase
            .from("profiles" as any)
            .update({
              phone: phoneTrim,
              full_name: fullName,
              region: regionCode,
            } as any)
            .eq("id", data.user.id);
        }
        localStorage.setItem("lh_region", regionCode);
        toast.success(`Welcome to Life Hive, ${fullName.split(" ")[0] || "friend"}!`);
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back to Life Hive.");
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden bg-mesh relative">

      {/* Decorative floating hexes */}
      <div className="absolute top-20 right-[8%] size-32 opacity-20 animate-float-slow pointer-events-none">
        <Hex />
      </div>
      <div className="absolute bottom-20 left-[6%] size-20 opacity-15 animate-float-slow pointer-events-none" style={{ animationDelay: "1s" }}>
        <Hex />
      </div>

      {/* LEFT PANEL — brand visual (desktop) */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-4 rounded-3xl bg-gradient-to-br from-hive/15 via-sky-hive/10 to-amber-hive/15 border border-hive/20 backdrop-blur-sm" />

        <div className="relative z-10">
          <Logo to="/" textClassName="text-3xl" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-2 font-bold">
            Everything you need, all in one hive
          </p>
        </div>

        {/* Center hero card */}
        <div className="relative z-10 flex items-center justify-center py-10">
          <div className="relative">
            {/* Glow */}
            <div className="absolute inset-0 rounded-full bg-hive/30 blur-3xl scale-110" />
            {/* Big logo mark */}
            <div className="relative size-56 rounded-3xl bg-card border border-border grid place-items-center shadow-card animate-float-slow">
              <LogoMark className="size-32" />
            </div>

            {/* Floating badges around the logo */}
            <div className="absolute -top-4 -left-12 bg-card border border-border rounded-2xl shadow-card px-3 py-2 flex items-center gap-2 animate-float-slow" style={{ animationDelay: "0.5s" }}>
              <ShoppingBag className="size-4 text-hive" />
              <span className="text-xs font-semibold">10+ categories</span>
            </div>
            <div className="absolute -bottom-2 -right-10 bg-card border border-border rounded-2xl shadow-card px-3 py-2 flex items-center gap-2 animate-float-slow" style={{ animationDelay: "1.2s" }}>
              <Truck className="size-4 text-hive" />
              <span className="text-xs font-semibold">Free ship $50+</span>
            </div>
            <div className="absolute top-1/2 -right-16 bg-card border border-border rounded-2xl shadow-card px-3 py-2 flex items-center gap-2 animate-float-slow" style={{ animationDelay: "0.8s" }}>
              <ShieldCheck className="size-4 text-hive" />
              <span className="text-xs font-semibold">Secure</span>
            </div>
          </div>
        </div>

        {/* Taglines */}
        <div className="relative z-10 space-y-3">
          {[
            { icon: "⚡", text: "Instant checkout — saved cards & addresses" },
            { icon: "🎁", text: "Member-only deals & 5% back on every order" },
            { icon: "🌍", text: "Delivering to 10+ regions worldwide" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="size-9 rounded-xl bg-card border border-border grid place-items-center text-base shrink-0">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL — form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 relative z-10">
        <div
          className={`w-full max-w-md transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Logo to="/" textClassName="text-3xl" />
          </div>

          {/* Mode toggle */}
          <div className="flex bg-secondary border border-border rounded-full p-1 mb-8 gap-1">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                  mode === m
                    ? "bg-hive text-white shadow-[0_0_16px_oklch(0.72_0.17_165/0.4)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Form card */}
          <div className="bg-card border border-border rounded-3xl p-7 sm:p-9 shadow-card">
            <h2 className="text-2xl font-display font-extrabold tracking-tight">
              {mode === "signin" ? "Welcome back" : "Join Life Hive"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6 mt-1">
              {mode === "signin"
                ? "Sign in to access your orders, saved cards & member deals."
                : "Create your free account to start shopping everything, all in one hive."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Sign-up only fields */}
              <div
                className={`space-y-4 overflow-hidden transition-all duration-500 ${
                  mode === "signup" ? "max-h-[640px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <Field label="Full Name" icon={<User className="size-3.5" />}>
                  <input
                    type="text"
                    required={mode === "signup"}
                    placeholder="Jane Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="field-input"
                  />
                </Field>

                <Field label="Mobile Number" icon={<Phone className="size-3.5" />}>
                  <input
                    type="tel"
                    required={mode === "signup"}
                    inputMode="tel"
                    placeholder="+1 555 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="field-input"
                  />
                </Field>

                {/* ── Region selector (signup only) ── */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2 font-bold">
                    <Globe className="size-3.5" />
                    Select your region
                    <span className="text-racing-red ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setRegionOpen((v) => !v)}
                      className="field-input flex items-center justify-between w-full text-left"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-xl">{region.flag}</span>
                        <span>
                          <span className="block text-sm font-semibold">{region.name}</span>
                          <span className="block text-[10px] text-muted-foreground uppercase tracking-wider">
                            {region.currency} · Ship {region.symbol}{region.shippingBase}
                          </span>
                        </span>
                      </span>
                      <ChevronDown className={`size-4 text-muted-foreground transition-transform ${regionOpen ? "rotate-180" : ""}`} />
                    </button>

                    {regionOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-2xl shadow-card overflow-hidden z-50 max-h-72 overflow-y-auto scrollbar-hide animate-scale-in">
                        <div className="px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground border-b border-border bg-muted/40">
                          Choose where you want delivery
                        </div>
                        {REGIONS.map((r) => (
                          <button
                            key={r.code}
                            type="button"
                            onClick={() => {
                              setRegionCode(r.code);
                              setRegionOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-muted/60 transition-colors ${
                              r.code === regionCode ? "bg-hive/10" : ""
                            }`}
                          >
                            <span className="flex items-center gap-2.5">
                              <span className="text-lg">{r.flag}</span>
                              <span>
                                <span className="block text-sm font-medium">{r.name}</span>
                                <span className="block text-[10px] text-muted-foreground">{r.currency}</span>
                              </span>
                            </span>
                            {r.code === regionCode && <CheckCircle2 className="size-4 text-hive" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                    <Truck className="size-3" />
                    We use your region to calculate shipping & tax. You can change it later.
                  </p>
                </div>
              </div>

              {/* Email */}
              <Field label="Email Address" icon={<Mail className="size-3.5" />}>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field-input"
                />
              </Field>

              {/* Password */}
              <Field label="Password" icon={<Lock className="size-3.5" />}>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder={mode === "signup" ? "Minimum 6 characters" : "Your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="field-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </Field>

              {/* Terms (signup only) */}
              {mode === "signup" && (
                <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 size-4 rounded border-border accent-hive"
                  />
                  <span>
                    I agree to the{" "}
                    <a href="#" className="text-hive font-semibold hover:underline">Terms of Service</a>{" "}
                    and{" "}
                    <a href="#" className="text-hive font-semibold hover:underline">Privacy Policy</a>.
                  </span>
                </label>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={busy}
                className="w-full flex items-center justify-center gap-2.5 bg-hive text-white py-3.5 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-hive-dark hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 transition-all mt-2 shadow-[0_4px_24px_oklch(0.72_0.17_165/0.3)]"
              >
                {busy ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Please wait…
                  </>
                ) : (
                  <>
                    {mode === "signin" ? "Sign In" : "Create Account"}
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer link */}
            <div className="mt-6 pt-5 border-t border-border text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin");
                  setPassword("");
                  setShowPassword(false);
                }}
                className="text-xs text-muted-foreground hover:text-hive transition-colors"
              >
                {mode === "signin"
                  ? "Don't have an account? Create one →"
                  : "Already a member? Sign in →"}
              </button>
            </div>
          </div>

          <p className="text-center text-[10px] text-muted-foreground mt-5 uppercase tracking-widest">
            Life Hive · Worldwide Delivery
          </p>
        </div>
      </div>

      <style>{`
        .field-input {
          width: 100%;
          background: var(--color-background);
          border: 1px solid var(--color-border);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
          color: inherit;
        }
        .field-input:focus {
          border-color: var(--color-hive, #10b981);
          box-shadow: 0 0 0 3px oklch(0.72 0.17 165 / 0.15);
        }
        .field-input::placeholder {
          color: rgba(140,140,150,0.6);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2 font-bold">
        {icon}
        {label}
      </label>
      {children}
    </div>
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
