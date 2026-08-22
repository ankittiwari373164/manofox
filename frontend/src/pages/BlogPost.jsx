import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { FadeIn } from "@/components/marketing/Reveal";
import api from "@/lib/api";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/blogs/${slug}`)
      .then(({ data }) => setPost(data))
      .catch(() => setPost(false))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-fox border-t-transparent" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-40 pb-24 text-center" data-testid="blog-post-not-found">
        <p className="font-display text-2xl font-extrabold text-obsidian">Post not found</p>
        <Link to="/blog" className="mt-6 inline-flex items-center gap-2 font-semibold text-fox">
          <ArrowLeft className="h-4 w-4" /> Back to blog
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 pt-40 pb-24 sm:px-6 lg:px-8" data-testid="blog-post-page">
      <FadeIn>
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-fox">
          <ArrowLeft className="h-4 w-4" /> Back to blog
        </Link>
        <span className="mt-6 block w-fit rounded-full bg-fox-light px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-fox">
          {post.category}
        </span>
        <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight text-obsidian sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-sm font-semibold text-neutral-400">
          {new Date(post.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>

        {post.image_url && (
          <div className="mt-8">
            <img src={post.image_url} alt={post.title} className="w-full rounded-3xl object-cover" />
            {post.image_credit && (
              <p className="mt-2 text-xs text-neutral-400">
                {post.image_credit_url ? (
                  <a href={post.image_credit_url} target="_blank" rel="noreferrer" className="hover:text-fox hover:underline">
                    {post.image_credit}
                  </a>
                ) : (
                  post.image_credit
                )}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 whitespace-pre-line text-base leading-relaxed text-neutral-700">{post.content}</div>

        {post.source_url && (
          <div className="mt-10 rounded-2xl border border-black/5 bg-secondary px-6 py-4 text-sm text-neutral-500">
            Reporting referenced from{" "}
            <a href={post.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-fox hover:underline">
              {post.source_name || "the original source"} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
      </FadeIn>
    </article>
  );
}