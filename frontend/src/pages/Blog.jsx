import { ArrowUpRight } from "lucide-react";
import { MaskedLines, FadeIn, Overline } from "@/components/marketing/Reveal";
import { POSTS } from "@/data/site";

export default function Blog() {
  const [featured, ...rest] = POSTS;

  return (
    <div data-testid="blog-page">
      <section className="relative overflow-hidden bg-noise px-4 pt-40 pb-20 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute top-16 right-0 select-none font-display text-[15vw] font-extrabold leading-none text-stroke opacity-50">
          BLOG
        </div>
        <div className="relative mx-auto max-w-7xl">
          <Overline>Insights</Overline>
          <MaskedLines
            lines={["Ideas worth", "your scroll."]}
            className="mt-6 font-display text-5xl font-extrabold leading-[1.02] tracking-tighter text-obsidian sm:text-6xl lg:text-7xl"
          />
          <FadeIn delay={0.4}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-neutral-600 md:text-lg">
              Field notes on marketing, design and growth from the Manofox team.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32">
        <FadeIn>
          <article
            className="group grid gap-8 overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl lg:grid-cols-2"
            data-testid="blog-featured"
          >
            <div className="bg-fox p-10 text-white md:p-14">
              <span className="rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest">{featured.category}</span>
              <h2 className="mt-6 font-display text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">{featured.title}</h2>
              <p className="mt-4 leading-relaxed text-white/85">{featured.excerpt}</p>
              <p className="mt-8 text-sm font-semibold text-white/70">{featured.date} · {featured.read}</p>
            </div>
            <div className="flex flex-col justify-center p-10 md:p-14">
              <p className="font-serif text-xl italic leading-relaxed text-neutral-700 md:text-2xl">
                "Advantage+ campaigns, creative testing velocity, and the targeting shifts every advertiser should know this year."
              </p>
              <span className="mt-8 inline-flex items-center gap-2 font-semibold text-fox">
                Read the article <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </article>
        </FadeIn>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((post, i) => (
            <FadeIn key={post.slug} delay={(i % 3) * 0.07}>
              <article
                className="group flex h-full flex-col rounded-3xl border border-black/5 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                data-testid={`blog-card-${post.slug}`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-fox-light px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-fox">{post.category}</span>
                  <span className="text-xs font-semibold text-neutral-400">{post.read}</span>
                </div>
                <h3 className="mt-5 font-display text-xl font-bold leading-snug tracking-tight text-obsidian">{post.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-600">{post.excerpt}</p>
                <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-4">
                  <span className="text-xs font-semibold text-neutral-400">{post.date}</span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-fox">
                    Read <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
}
