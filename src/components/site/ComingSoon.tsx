import { Link } from "@tanstack/react-router";

export function ComingSoon({ title, blurb }: { title: string; blurb: string }) {
  return (
    <section className="max-w-3xl mx-auto px-6 py-32 text-center">
      <span className="text-[10px] uppercase tracking-[0.3em] text-racing-red font-bold">
        Coming Soon
      </span>
      <h1 className="font-display text-5xl md:text-7xl uppercase tracking-tight mt-3">
        {title}
      </h1>
      <p className="text-silver/60 mt-5 max-w-xl mx-auto">{blurb}</p>
      <Link
        to="/"
        className="inline-block mt-8 px-7 py-4 rounded-sm font-bold uppercase tracking-widest text-xs border border-border hover:bg-secondary transition-colors"
      >
        Back to home
      </Link>
    </section>
  );
}
