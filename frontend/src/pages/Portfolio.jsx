import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { MaskedLines, FadeIn, Overline } from "@/components/marketing/Reveal";
import { PORTFOLIO } from "@/data/site";

export default function Portfolio() {
  return (
    <div data-testid="portfolio-page">
      <section className="relative overflow-hidden bg-noise px-4 pt-40 pb-20 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute top-16 right-0 select-none font-display text-[15vw] font-extrabold leading-none text-stroke opacity-50">
          WORK
        </div>
        <div className="relative mx-auto max-w-7xl">
          <Overline>Case Studies</Overline>
          <MaskedLines
            lines={["Work that speaks", "in numbers."]}
            className="mt-6 font-display text-5xl font-extrabold leading-[1.02] tracking-tighter text-obsidian sm:text-6xl lg:text-7xl"
          />
          <FadeIn delay={0.4}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-neutral-600 md:text-lg">
              Real brands, real campaigns, real outcomes. A selection of engagements we're proud of.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32">
        <div className="grid gap-10 md:grid-cols-2">
          {PORTFOLIO.map((p, i) => (
            <FadeIn key={p.title} delay={(i % 2) * 0.1}>
              <article className="group" data-testid={`portfolio-item-${i}`}>
                <div className="relative overflow-hidden rounded-3xl shadow-sm transition-shadow duration-300 group-hover:shadow-2xl" style={{ aspectRatio: "16/11" }}>
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-obsidian/10 to-transparent" />
                  <span className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-obsidian backdrop-blur">
                    {p.category}
                  </span>
                  <div className="absolute bottom-0 flex w-full items-end justify-between p-6">
                    <div>
                      <h2 className="font-display text-2xl font-bold text-white md:text-3xl">{p.title}</h2>
                      <p className="mt-1 font-semibold text-fox">{p.result}</p>
                    </div>
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-fox text-white opacity-0 transition-all duration-300 group-hover:opacity-100">
                      <ArrowUpRight className="h-5 w-5" />
                    </span>
                  </div>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>

        <FadeIn className="mt-20 rounded-3xl bg-obsidian p-10 text-white md:p-14">
          <div className="flex flex-wrap items-center justify-between gap-8">
            <h2 className="max-w-lg font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              Your brand could be our next <span className="text-fox">case study</span>
            </h2>
            <Link
              to="/contact"
              data-testid="portfolio-cta"
              className="inline-flex items-center gap-2 rounded-full bg-fox px-7 py-3.5 font-semibold text-white transition-transform duration-200 hover:scale-105 hover:bg-fox-dark"
            >
              Start Your Project <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
