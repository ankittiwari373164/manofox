const Parser = require("rss-parser");
const pool = require("./db");

const parser = new Parser({ timeout: 10000 });

// Keywords tied to Manofox's services — edit this list any time to change what gets fetched.
const TOPICS = [
  { keyword: "digital marketing trends", category: "Digital Marketing", imageQuery: "digital marketing" },
  { keyword: "social media marketing", category: "Social Media", imageQuery: "social media" },
  { keyword: "SEO trends", category: "SEO", imageQuery: "seo analytics" },
  { keyword: "Meta ads Facebook Instagram advertising", category: "Paid Ads", imageQuery: "online advertising" },
  { keyword: "web development trends", category: "Web Development", imageQuery: "web development coding" },
  { keyword: "branding design trends", category: "Branding", imageQuery: "brand design" },
];

const MAX_PER_TOPIC = 2;
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

function baseSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 180);
}

// Ensure the slug is unique and clean (no random suffix) by appending -2, -3... only if needed.
async function uniqueSlug(title) {
  const base = baseSlug(title) || "post";
  let slug = base;
  let n = 2;
  while (true) {
    const [rows] = await pool.query("SELECT id FROM blogs WHERE slug = ?", [slug]);
    if (!rows.length) return slug;
    slug = `${base}-${n}`;
    n++;
  }
}

// Fetch the source article's page and pull out its main readable text (all <p> content).
// This gives Groq real substance to rewrite from instead of a one-line RSS snippet.
async function extractArticleText(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const resp = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ManofoxBot/1.0)" },
    });
    clearTimeout(timeout);
    if (!resp.ok) return null;
    const html = await resp.text();

    const noScripts = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ");
    const paragraphs = [...noScripts.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((m) => m[1].replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim())
      .filter((p) => p.length > 40);

    const text = paragraphs.join("\n\n").slice(0, 8000);
    return text.length > 200 ? text : null;
  } catch {
    return null;
  }
}

// Rewrite a news item into original Manofox-voiced copy using Groq. Falls back to the
// scraped/raw text if GROQ_API_KEY isn't set or the request fails, so the pipeline never breaks.
async function rewriteWithGroq({ title, sourceText, category }, attempt = 1) {
  if (!process.env.GROQ_API_KEY) return null;
  try {
    const prompt = `You are a copywriter for Manofox, a digital marketing agency in New Delhi. Write an original, in-depth blog post for the Manofox website based on the news article below. Do not copy sentences verbatim from the source — rewrite everything in your own words and add relevant context, implications for businesses, and practical takeaways. If the source text is very short, use your own knowledge of the topic to expand into a genuinely useful, substantive article rather than staying thin. Keep it factual and neutral, written for a marketing-savvy business audience. Category: ${category}.

Source headline: ${title}
Source article text: ${sourceText}

Respond ONLY with strict JSON, no markdown fences, no preamble:
{"title": "a punchy rewritten headline under 90 characters", "summary": "a 1-2 sentence teaser under 200 characters", "content": "a well-developed 6-9 paragraph article (at least 500 words), plain text, paragraphs separated by \\n\\n"}`;

    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
        max_tokens: 2200,
      }),
    });
    if (resp.status === 429 && attempt <= 3) {
      const retryAfter = Number(resp.headers.get("retry-after")) || attempt * 5;
      console.warn(`[news] Groq rate-limited, retrying in ${retryAfter}s (attempt ${attempt})`);
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      return rewriteWithGroq({ title, sourceText, category }, attempt + 1);
    }
    if (!resp.ok) {
      const errBody = await resp.text().catch(() => "");
      console.error(`[news] Groq API error ${resp.status}: ${errBody.slice(0, 300)}`);
      return null;
    }
    const data = await resp.json();
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) return null;
    const cleaned = raw.replace(/^```json\s*|^```\s*|```$/g, "");
    const parsed = JSON.parse(cleaned);
    if (!parsed.title || !parsed.content) return null;
    return parsed;
  } catch (err) {
    console.error("[news] Groq rewrite threw:", err.message);
    return null;
  }
}

// Pull a relevant, licensed photo from Unsplash. Returns null (never blocks the post) on failure.
async function fetchUnsplashImage(query) {
  if (!process.env.UNSPLASH_ACCESS_KEY) return null;
  try {
    const resp = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
    );
    if (!resp.ok) return null;
    const photo = await resp.json();
    if (!photo?.urls?.regular) return null;
    return {
      url: photo.urls.regular,
      credit: photo.user?.name ? `Photo by ${photo.user.name} on Unsplash` : "Photo via Unsplash",
      creditUrl: photo.user?.links?.html
        ? `${photo.user.links.html}?utm_source=manofox&utm_medium=referral`
        : "https://unsplash.com",
    };
  } catch {
    return null;
  }
}

async function fetchAndStoreNews() {
  let inserted = 0;
  const errors = [];

  for (const topic of TOPICS) {
    try {
      const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(
        topic.keyword
      )}&hl=en-IN&gl=IN&ceid=IN:en`;
      const feed = await parser.parseURL(feedUrl);
      const items = (feed.items || []).slice(0, MAX_PER_TOPIC);

      for (const item of items) {
        const sourceUrl = item.link;
        if (!sourceUrl) continue;

        const [existing] = await pool.query("SELECT id FROM blogs WHERE source_url = ?", [
          sourceUrl,
        ]);
        if (existing.length) continue;

        const rawTitle = (item.title || "Untitled")
          .replace(/\s*[-–—]\s*[^-–—]+$/, "")
          .replace(/\s{2,}\S.*$/, "")
          .trim();
        const rawSnippet = (item.contentSnippet || item.content || "").slice(0, 800);
        const sourceName = item.creator || (feed.title || "").replace("Google News", "").trim() || "News";

        const articleText = await extractArticleText(sourceUrl);
        const sourceText = articleText || rawSnippet;

        const rewritten = await rewriteWithGroq({
          title: rawTitle,
          sourceText,
          category: topic.category,
        });
        if (!rewritten) {
          console.warn(
            `[news] Groq rewrite unavailable for "${rawTitle}" — using scraped/raw text. Check GROQ_API_KEY.`
          );
        }
        const image = await fetchUnsplashImage(topic.imageQuery);

        const title = rewritten?.title || rawTitle;
        const summary = rewritten?.summary || sourceText.slice(0, 300);
        const content = rewritten?.content || sourceText || rawSnippet;
        const slug = await uniqueSlug(title);

        await pool.query(
          `INSERT INTO blogs (title, slug, summary, content, image_url, image_credit, image_credit_url, source_url, source_name, category, status, is_automated, published_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', 1, ?)`,
          [
            title.slice(0, 255),
            slug,
            summary,
            content,
            image?.url || null,
            image?.credit || null,
            image?.creditUrl || null,
            sourceUrl,
            sourceName.slice(0, 150),
            topic.category,
            item.pubDate ? new Date(item.pubDate) : new Date(),
          ]
        );
        inserted++;
        await new Promise((r) => setTimeout(r, 1500));
      }
    } catch (err) {
      errors.push(`${topic.keyword}: ${err.message}`);
    }
  }

  return { inserted, errors };
}

module.exports = { fetchAndStoreNews };