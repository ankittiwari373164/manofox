import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import Hero3D from "@/components/marketing/Hero3D";
import Marquee from "@/components/marketing/Marquee";
import TiltCard from "@/components/marketing/TiltCard";
import { MaskedLines, FadeIn, Overline } from "@/components/marketing/Reveal";
import { SERVICES, TESTIMONIALS, PORTFOLIO } from "@/data/site";
import { useSiteContent } from "@/lib/content";

const CHAPTERS = [
  {
    num: "01",
    title: "Strategy Before Tactics",
    accent: "strategy",
    body: "Every engagement begins with deep research — your market, your audience, your numbers. We build a data-driven roadmap before a single rupee is spent, so every campaign has a job to do.",
  },
  {
    num: "02",
    title: "Creativity That Converts",
    accent: "creativity",
    body: "Beautiful work that doesn't perform is decoration. Our designers, writers and media buyers work as one unit to craft assets that stop the scroll and move people to act.",
  },
  {
    num: "03",
    title: "Technology as an Edge",
    accent: "technology",
    body: "From CRM automation to conversion-tuned websites, we wire your business with systems that capture every lead and compound every win — measured, reported, improved.",
  },
];

const STATS = [
  { value: "120+", label: "Projects Delivered" },
  { value: "45+", label: "Happy Clients" },
  { value: "8", label: "Core Services" },
  { value: "3.2x", label: "Avg. ROI on Ads" },
];

const BENTO_SPANS = [
  "md:col-span-7", "md:col-span-5", "md:col-span-4", "md:col-span-8",
  "md:col-span-6", "md:col-span-6", "md:col-span-5", "md:col-span-7",
];

function chunkTitle(title) {
  const words = title.split(" ");
  const lines = [];
  for (let i = 0; i < words.length; i += 3) lines.push(words.slice(i, i + 3).join(" "));
  return lines.slice(0, 3);
}

export default function Home() {
  const content = useSiteContent();

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative overflow-hidden bg-noise">
        <div className="pointer-events-none absolute -top-10 left-0 select-none font-display text-[22vw] font-extrabold leading-none text-stroke opacity-60">
          MANOFOX
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 pt-36 pb-16 sm:px-6 lg:grid-cols-12 lg:px-8 lg:pt-44 lg:pb-24">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-fox/20 bg-fox-light px-4 py-1.5"
              data-testid="hero-overline"
            >
              <Sparkles className="h-3.5 w-3.5 text-fox" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-fox">{content.hero_overline}</span>
            </motion.div>

            <MaskedLines
              lines={chunkTitle(content.hero_title)}
              className="mt-6 font-display text-5xl font-extrabold leading-[1.02] tracking-tighter text-obsidian sm:text-6xl lg:text-7xl"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="mt-6 max-w-lg text-base leading-relaxed text-neutral-600 md:text-lg"
              data-testid="hero-subtitle"
            >
              {content.hero_subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link
                to="/contact"
                data-testid="hero-cta-primary"
                className="group inline-flex items-center gap-2 rounded-full bg-fox px-7 py-3.5 font-semibold text-white shadow-lg shadow-fox/25 transition-transform duration-200 hover:scale-105 hover:bg-fox-dark"
              >
                Start a Project
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                to="/portfolio"
                data-testid="hero-cta-secondary"
                className="inline-flex items-center gap-2 rounded-full border-2 border-obsidian/15 px-7 py-3.5 font-semibold text-obsidian transition-colors duration-200 hover:border-fox hover:text-fox"
              >
                See Our Work <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="mt-14 grid max-w-lg grid-cols-2 gap-6 sm:grid-cols-4"
              data-testid="hero-stats"
            >
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-3xl font-extrabold tracking-tight text-obsidian">{s.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative h-[380px] sm:h-[460px] lg:col-span-5 lg:h-[600px]"
          >
            <Hero3D />
          </motion.div>
        </div>
      </section>

      <Marquee items={["SEO Management", "Meta Ads", "Web Development", "Brand Strategy", "Content Creation", "CRM Automation"]} />

      {/* MANIFESTO */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32" data-testid="manifesto-section">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <FadeIn>
                <Overline>The Manofox Way</Overline>
                <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-obsidian md:text-5xl">
                  Three chapters.<br />
                  <span className="font-serif italic font-semibold text-fox">One obsession:</span><br />
                  your growth.
                </h2>
              </FadeIn>
            </div>
          </div>
          <div className="space-y-16 lg:col-span-8">
            {CHAPTERS.map((c, i) => (
              <FadeIn key={c.num} delay={i * 0.08}>
                <div className="flex gap-6 border-t border-black/10 pt-10" data-testid={`manifesto-chapter-${c.num}`}>
                  <span className="font-display text-5xl font-extrabold text-stroke-strong md:text-6xl">{c.num}</span>
                  <div>
                    <h3 className="font-display text-2xl font-bold tracking-tight text-obsidian md:text-3xl">{c.title}</h3>
                    <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600">{c.body}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES BENTO */}
      <section className="bg-white py-24 lg:py-32" data-testid="services-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Overline>What We Do</Overline>
              <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-obsidian md:text-5xl">
                Top-rated services,<br />built for results
              </h2>
            </div>
            <Link to="/services" data-testid="services-view-all" className="group inline-flex items-center gap-2 font-semibold text-fox">
              View all services <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </FadeIn>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-12">
            {SERVICES.map((s, i) => (
              <TiltCard
                key={s.slug}
                testId={`service-card-${s.slug}`}
                className={`group relative overflow-hidden rounded-3xl border border-black/5 bg-background p-8 shadow-sm transition-shadow duration-300 hover:shadow-xl ${BENTO_SPANS[i]}`}
              >
                <div className="flex h-full flex-col justify-between gap-8">
                  <div className="flex items-start justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-fox-light text-fox transition-colors duration-300 group-hover:bg-fox group-hover:text-white">
                      <s.icon className="h-6 w-6" />
                    </span>
                    <span className="font-display text-sm font-bold text-neutral-300">0{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold tracking-tight text-obsidian md:text-2xl">{s.title}</h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-600">{s.desc}</p>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* WORK STRIP */}
      <section className="py-24 lg:py-32" data-testid="work-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Overline>Selected Work</Overline>
            <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-obsidian md:text-5xl">
              Proof, not promises
            </h2>
          </FadeIn>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PORTFOLIO.map((p, i) => (
              <FadeIn key={p.title} delay={i * 0.08}>
                <Link to="/portfolio" data-testid={`work-card-${i}`} className="group block">
                  <div className="relative overflow-hidden rounded-3xl" style={{ aspectRatio: i % 2 === 0 ? "4/5" : "4/4.4" }}>
                    <img
                      src={p.image}
                      alt={p.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 p-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-fox">{p.category}</p>
                      <h3 className="mt-1 font-display text-xl font-bold text-white">{p.title}</h3>
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-fox">{p.result}</p>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-obsidian py-24 text-white lg:py-32" data-testid="testimonials-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Overline light>Client Love</Overline>
            <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
              What our clients <span className="font-serif italic font-semibold text-fox">say</span>
            </h2>
          </FadeIn>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.07}>
                <figure className="h-full rounded-3xl border border-white/10 bg-white/5 p-8 transition-colors duration-300 hover:border-fox/40" data-testid={`testimonial-${i}`}>
                  <span className="font-serif text-6xl italic leading-none text-fox">"</span>
                  <blockquote className="mt-2 font-serif text-lg italic leading-relaxed text-white/85">{t.quote}</blockquote>
                  <figcaption className="mt-6 border-t border-white/10 pt-4">
                    <p className="font-display font-bold">{t.name}</p>
                    <p className="text-sm text-white/50">{t.role}</p>
                  </figcaption>
                </figure>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-fox py-24 lg:py-32" data-testid="cta-section">
        <div className="pointer-events-none absolute inset-0 bg-noise" />
        <div className="pointer-events-none absolute -bottom-16 left-0 select-none font-display text-[18vw] font-extrabold leading-none text-stroke-white">
          LET'S TALK
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="max-w-4xl font-display text-4xl font-extrabold tracking-tight text-white md:text-6xl">
              {content.cta_heading}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85">
              Share your vision with us, and let's create something exceptional together.
            </p>
            <Link
              to="/contact"
              data-testid="cta-say-hello"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-display text-lg font-bold text-fox shadow-xl transition-transform duration-200 hover:scale-105"
            >
              Say Hello <ArrowUpRight className="h-5 w-5" />
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
