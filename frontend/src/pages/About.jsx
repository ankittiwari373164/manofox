import { Link } from "react-router-dom";
import { ArrowUpRight, Target, Lightbulb, Rocket, HeartHandshake } from "lucide-react";
import { MaskedLines, FadeIn, Overline } from "@/components/marketing/Reveal";
import Marquee from "@/components/marketing/Marquee";
import { useSiteContent } from "@/lib/content";

const VALUES = [
  { icon: Target, title: "Results First", desc: "Every decision is tied to a metric that matters to your business." },
  { icon: Lightbulb, title: "Relentless Creativity", desc: "We treat every brand like our own — no recycled templates, ever." },
  { icon: Rocket, title: "Speed With Craft", desc: "Fast turnarounds without cutting corners on quality." },
  { icon: HeartHandshake, title: "Radical Transparency", desc: "Clear reporting, honest timelines, no jargon-filled invoices." },
];

export default function About() {
  const content = useSiteContent();

  return (
    <div data-testid="about-page">
      <section className="relative overflow-hidden bg-noise px-4 pt-40 pb-20 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute top-16 right-0 select-none font-display text-[16vw] font-extrabold leading-none text-stroke opacity-50">
          ABOUT
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Overline>Who We Are</Overline>
            <MaskedLines
              lines={[content.about_heading]}
              className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tighter text-obsidian sm:text-5xl lg:text-6xl"
            />
            <FadeIn delay={0.4}>
              <p className="mt-8 max-w-2xl text-base leading-relaxed text-neutral-600 md:text-lg" data-testid="about-text">
                {content.about_text}
              </p>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600">
                Based in New Delhi and working with brands across India, we're a compact team of designers, developers,
                strategists and media buyers who believe great marketing is equal parts art and arithmetic.
              </p>
            </FadeIn>
          </div>
          <FadeIn delay={0.3} className="lg:col-span-5">
            <div className="overflow-hidden rounded-3xl shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1606857521015-7f9fcf423740?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbWFya2V0aW5nJTIwYWdlbmN5JTIwb2ZmaWNlfGVufDB8fHx8MTc4NzMxMDc5OXww&ixlib=rb-4.1.0&q=85"
                alt="Manofox team at work"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      <Marquee items={["Data-Driven", "Creative", "Transparent", "Obsessed With Growth"]} dark />

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <FadeIn>
                <Overline>Our Values</Overline>
                <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-obsidian md:text-5xl">
                  What we <span className="font-serif italic font-semibold text-fox">stand for</span>
                </h2>
              </FadeIn>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-8">
            {VALUES.map((v, i) => (
              <FadeIn key={v.title} delay={i * 0.07}>
                <div className="h-full rounded-3xl border border-black/5 bg-white p-8 transition-shadow duration-300 hover:shadow-lg" data-testid={`value-card-${i}`}>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-fox-light text-fox">
                    <v.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-bold tracking-tight text-obsidian">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{v.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <FadeIn>
            <div className="overflow-hidden rounded-3xl shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1604328698692-f76ea9498e76?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwzfHxkaWdpdGFsJTIwbWFya2V0aW5nJTIwYWdlbmN5JTIwb2ZmaWNlfGVufDB8fHx8MTc4NzMxMDc5OXww&ixlib=rb-4.1.0&q=85"
                alt="Manofox studio"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <Overline>Our Goal</Overline>
            <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-obsidian md:text-5xl">
              The best solution for your business, every time
            </h2>
            <ul className="mt-8 space-y-4">
              {[
                "Boost your business growth with modern solutions",
                "Flexible services that adapt to your business needs",
                "Custom business solutions with cutting-edge technology",
                "Automation for any type of business",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-base font-medium text-neutral-700">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-fox" /> {item}
                </li>
              ))}
            </ul>
            <Link
              to="/contact"
              data-testid="about-cta"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-fox px-7 py-3.5 font-semibold text-white transition-transform duration-200 hover:scale-105 hover:bg-fox-dark"
            >
              Work With Us <ArrowUpRight className="h-4 w-4" />
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
