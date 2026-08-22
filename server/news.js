const Parser = require("rss-parser");
const pool = require("./db");

const parser = new Parser({ timeout: 10000 });

// Keywords tied to Manofox's services — edit this list any time to change what gets fetched.
const TOPICS = [
  { keyword: "digital marketing trends", category: "Digital Marketing" },
  { keyword: "social media marketing", category: "Social Media" },
  { keyword: "SEO trends", category: "SEO" },
  { keyword: "Meta ads Facebook Instagram advertising", category: "Paid Ads" },
  { keyword: "web development trends", category: "Web Development" },
  { keyword: "branding design trends", category: "Branding" },
];

const MAX_PER_TOPIC = 2;

function slugify(title) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 180) +
    "-" +
    Date.now().toString(36).slice(-5)
  );
}

async function extractImage(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ManofoxBot/1.0)" },
    });
    clearTimeout(timeout);
    if (!resp.ok) return null;
    const html = await resp.text();
    const og =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    return og ? og[1] : null;
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

        const image = await extractImage(sourceUrl);
        const title = (item.title || "Untitled").replace(/\s*-\s*[^-]+$/, "").trim();
        const summary = (item.contentSnippet || item.content || "").slice(0, 500);
        const sourceName = item.creator || (feed.title || "").replace("Google News", "").trim() || "News";

        await pool.query(
          `INSERT INTO blogs (title, slug, summary, content, image_url, source_url, source_name, category, status, is_automated, published_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', 1, ?)`,
          [
            title.slice(0, 255),
            slugify(title),
            summary,
            summary,
            image,
            sourceUrl,
            sourceName.slice(0, 150),
            topic.category,
            item.pubDate ? new Date(item.pubDate) : new Date(),
          ]
        );
        inserted++;
      }
    } catch (err) {
      errors.push(`${topic.keyword}: ${err.message}`);
    }
  }

  return { inserted, errors };
}

module.exports = { fetchAndStoreNews };
