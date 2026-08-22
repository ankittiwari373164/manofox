import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { MaskedLines, FadeIn, Overline } from "@/components/marketing/Reveal";
import api from "@/lib/api";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/blogs")
      .then(({ data }) => setPosts(data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const [featured, ...rest] = posts;

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
              Field notes and trending industry news on marketing, design and growth from the Manofox team.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32">
        {loading ? (
          <div className="grid h-48 place-items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-fox border-t-transparent" />
          </div>
        ) : !featured ? (
          <div className="rounded-3xl border border-black/5 bg-white py-20 text-center" data-testid="blog-empty-state">
            <p className="font-semibold text-neutral-500">New posts are on the way.</p>
          </div>
        ) : (
          <>
            <FadeIn>
              <Link
                to={`/blog/${featured.slug}`}
                className="group grid gap-8 overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl lg:grid-cols-2"
                data-testid={`blog-link-${featured.slug}`}
              >
                <div data-testid="blog-featured">
                  {featured.image_url ? (
                    <img src={featured.image_url} alt={featured.title} className="h-64 w-full object-cover lg:h-full" />
                  ) : (
                    <div className="flex h-64 items-center justify-center bg-fox p-10 text-white lg:h-full">
                      <span className="font-display text-2xl font-extrabold">MANOFOX</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center p-10 md:p-14">
                  <span className="w-fit rounded-full bg-fox-light px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-fox">
                    {featured.category}
                  </span>
                  <h2 className="mt-6 font-display text-3xl font-extrabold leading-tight tracking-tight text-obsidian md:text-4xl">
                    {featured.title}
                  </h2>
                  <p className="mt-4 leading-relaxed text-neutral-600">{featured.summary}</p>
                  <p className="mt-8 text-sm font-semibold text-neutral-400">{formatDate(featured.published_at)}</p>
                  <span className="mt-6 inline-flex items-center gap-2 font-semibold text-fox">
                    Read the article
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>
            </FadeIn>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((post, i) => (
                <FadeIn key={post.slug} delay={(i % 3) * 0.07}>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl border border-black/5 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    data-testid={`blog-link-${post.slug}`}
                  >
                    <article data-testid={`blog-card-${post.slug}`} className="flex h-full flex-col">
                      {post.image_url ? (
                        <img src={post.image_url} alt={post.title} className="h-44 w-full object-cover" />
                      ) : (
                        <div className="grid h-44 place-items-center bg-fox-light">
                          <span className="font-display text-lg font-extrabold text-fox">MANOFOX</span>
                        </div>
                      )}
                      <div className="flex flex-1 flex-col p-8">
                        <span className="w-fit rounded-full bg-fox-light px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-fox">
                          {post.category}
                        </span>
                        <h3 className="mt-5 font-display text-xl font-bold leading-snug tracking-tight text-obsidian">{post.title}</h3>
                        <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-600 line-clamp-3">{post.summary}</p>
                        <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-4">
                          <span className="text-xs font-semibold text-neutral-400">{formatDate(post.published_at)}</span>
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-fox">
                            Read <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}