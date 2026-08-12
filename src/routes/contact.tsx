import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Phone, Mail, MapPin, Lock, Send, MessageCircle, Clock, Globe } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { postFormToChat } from "@/lib/support-chat";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  const { user, loading } = useAuth();
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in first so we can reply.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "");
    const email = String(fd.get("email") ?? "");
    const message = String(fd.get("message") ?? "");
    setSending(true);
    try {
      await postFormToChat({
        userId: user.id,
        customerName: name || user.email?.split("@")[0] || "Customer",
        kind: "Contact",
        fields: { Name: name, Email: email },
        message,
      });
      (e.target as HTMLFormElement).reset();
      toast.success("Message sent — we'll reply in your live chat.");
    } catch (err: any) {
      toast.error(err.message ?? "Could not send.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 sm:mb-10 text-center">
        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-hive font-bold">
          <MessageCircle className="size-3" />
          We're here to help
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight mt-3">
          Get in <span className="text-gradient-hive">touch</span>
        </h1>
        <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-sm sm:text-base">
          Questions, feedback, or need a hand with your order? Our team replies within 5 minutes during business hours.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
        {/* Contact info */}
        <div className="lg:col-span-2 space-y-3">
          {[
            { icon: Phone,  label: "WhatsApp",     value: "+1 530 350 5985",  href: "https://wa.me/15303505985", note: "Quick replies, 9am-9pm PT" },
            { icon: Mail,   label: "Email",         value: "hello@lifehive.shop", href: "mailto:hello@lifehive.shop", note: "Replies within 24h" },
            { icon: MapPin, label: "Warehouse",     value: "Reno, NV — pickup by appointment", href: undefined, note: "Mon-Fri 9am-5pm" },
            { icon: Globe,  label: "Regions served", value: "USA · Canada · UK · AU · EU · +5", href: undefined, note: "Delivering worldwide" },
          ].map((c) => (
            <div key={c.label} className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex items-start gap-3">
              <div className="size-10 rounded-xl bg-hive/10 text-hive grid place-items-center shrink-0">
                <c.icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-bold">{c.label}</p>
                {c.href ? (
                  <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-sm font-semibold hover:text-hive transition-colors break-all block mt-0.5">
                    {c.value}
                  </a>
                ) : (
                  <p className="text-sm font-semibold mt-0.5">{c.value}</p>
                )}
                <p className="text-[11px] text-muted-foreground mt-0.5">{c.note}</p>
              </div>
            </div>
          ))}

          {/* Hours */}
          <div className="bg-gradient-to-br from-hive/5 to-amber-hive/5 border border-hive/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="size-4 text-hive" />
              <h3 className="font-semibold text-sm">Support hours</h3>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li className="flex justify-between"><span>Mon – Fri</span><span className="font-mono">9:00 — 21:00 PT</span></li>
              <li className="flex justify-between"><span>Saturday</span><span className="font-mono">10:00 — 18:00 PT</span></li>
              <li className="flex justify-between"><span>Sunday</span><span className="font-mono">12:00 — 18:00 PT</span></li>
              <li className="flex justify-between pt-1 border-t border-border mt-1 text-hive font-semibold"><span>Chat support</span><span className="font-mono">24 / 7</span></li>
            </ul>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="lg:col-span-3 bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-4 sm:space-y-5">
          <div>
            <h2 className="font-display font-bold text-xl tracking-tight">Send us a message</h2>
            <p className="text-xs text-muted-foreground mt-1">We reply in your private chat — usually within 5 minutes.</p>
          </div>

          {!loading && !user && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 text-sm">
              <Lock className="size-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-muted-foreground">
                <Link to="/login" className="text-hive font-semibold hover:underline">Sign in</Link> to send a message — we'll reply directly in your chat.
              </p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name">
              <input name="name" type="text" required className="form-input" />
            </Field>
            <Field label="Email">
              <input name="email" type="email" required className="form-input" />
            </Field>
          </div>

          <Field label="Subject (optional)">
            <input name="subject" type="text" className="form-input" placeholder="e.g. Question about my order" />
          </Field>

          <Field label="Message">
            <textarea name="message" required rows={5} className="form-input resize-none" placeholder="How can we help?" />
          </Field>

          <button
            disabled={sending}
            className="w-full sm:w-auto bg-hive text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest disabled:opacity-60 hover:bg-hive-dark transition-colors flex items-center justify-center gap-2"
          >
            {sending ? "Sending…" : "Send Message"}
            {!sending && <Send className="size-3.5" />}
          </button>

          <style>{`
            .form-input {
              width: 100%;
              background: var(--color-background);
              border: 1px solid var(--color-border);
              border-radius: 0.75rem;
              padding: 0.625rem 0.875rem;
              font-size: 0.875rem;
              transition: border-color 0.2s, box-shadow 0.2s;
              outline: none;
              color: inherit;
            }
            .form-input:focus {
              border-color: var(--color-hive, #10b981);
              box-shadow: 0 0 0 3px oklch(0.72 0.17 165 / 0.15);
            }
          `}</style>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-bold block mb-2">{label}</label>
      {children}
    </div>
  );
}
