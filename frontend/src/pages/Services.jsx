import { Link } from "react-router-dom";
import { ArrowUpRight, Check } from "lucide-react";
import TiltCard from "@/components/marketing/TiltCard";
import { MaskedLines, FadeIn, Overline } from "@/components/marketing/Reveal";
import Marquee from "@/components/marketing/Marquee";
import { SERVICES } from "@/data/site";

export default function Services() {
  return (
    <div data-testid="services-page">
      <section className="relative overflow-hidden bg-noise px-4 pt-40 pb-20 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute top-10 right-0 select-none font-display text-[16vw] font-extrabold leading-none text-stroke opacity-50">
          SERVICES
        </div>
        <div className="relative mx-auto max-w-7xl">
          <Overline>What We Do</Overline>
          <MaskedLines
            lines={["Eight services.", "One goal — growth."]}
            className="mt-6 font-display text-5xl font-extrabold leading-[1.02] tracking-tighter text-obsidian sm:text-6xl lg:text-7xl"
          />
          <FadeIn delay={0.4}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-neutral-600 md:text-lg">
              We take pride in delivering tailored solutions, ensuring each client receives personalized attention and results-driven strategies.
            </p>
          </FadeIn>
        </div>
      </section>

      <Marquee items={["Design", "Develop", "Market", "Automate", "Scale"]} />

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          {SERVICES.map((s, i) => (
            <FadeIn key={s.slug} delay={(i % 2) * 0.08}>
              <TiltCard
                testId={`service-detail-${s.slug}`}
                className="group h-full rounded-3xl border border-black/5 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-xl md:p-10"
              >
                <div className="flex items-start justify-between">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-fox-light text-fox transition-colors duration-300 group-hover:bg-fox group-hover:text-white">
                    <s.icon className="h-7 w-7" />
                  </span>
                  <span className="font-display text-4xl font-extrabold text-stroke-strong">0{i + 1}</span>
                </div>
                <h2 className="mt-6 font-display text-2xl font-bold tracking-tight text-obsidian md:text-3xl">{s.title}</h2>
                <p className="mt-3 text-base leading-relaxed text-neutral-600">{s.desc}</p>
                <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                      <Check className="h-4 w-4 shrink-0 text-fox" /> {p}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  data-testid={`service-cta-${s.slug}`}
                  className="mt-8 inline-flex items-center gap-2 font-semibold text-fox"
                >
                  Get a quote <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </TiltCard>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="bg-obsidian py-20 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          <h2 className="max-w-xl font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Not sure which service fits? <span className="text-fox">Let's figure it out together.</span>
          </h2>
          <Link
            to="/contact"
            data-testid="services-bottom-cta"
            className="inline-flex items-center gap-2 rounded-full bg-fox px-7 py-3.5 font-semibold text-white transition-transform duration-200 hover:scale-105 hover:bg-fox-dark"
          >
            Book a Free Consultation <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
