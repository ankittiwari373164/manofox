require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cron = require("node-cron");
const pool = require("./db");
const { fetchAndStoreNews } = require("./news");

const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_HOURS = 12;
const LEAD_STATUSES = ["new", "contacted", "converted", "closed"];

const DEFAULT_CONTENT = {
  hero_overline: "Digital Marketing Agency — New Delhi",
  hero_title: "We Make Brands Impossible To Ignore",
  hero_subtitle:
    "Empower your brand with data-driven insights, creative solutions, and cutting-edge technology.",
  about_heading: "Your Trusted Partner for Digital Success",
  about_text:
    "At Manofox, we help you reach your business objectives by providing customized solutions powered by the latest technology. From web development to Meta ads, our team blends creativity with analytics to deliver measurable growth.",
  cta_heading: "Have a Project in Mind? Let's Bring It to Life!",
  contact_email: "manfoxpvt2023@gmail.com",
  contact_phone: "+91 7217875119",
  contact_address: "532/1, Bank Colony, Durga Vihar, Devli, Delhi 110080",
};

app.use(cors({ origin: (process.env.CORS_ORIGINS || "*").split(","), credentials: true }));
app.use(express.json());

const api = express.Router();

// ---------- helpers ----------

function signToken(userId, email) {
  return jwt.sign({ sub: String(userId), email, type: "access" }, JWT_SECRET, {
    expiresIn: `${ACCESS_TOKEN_HOURS}h`,
  });
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ detail: "Not authenticated" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const [rows] = await pool.query("SELECT id, email, name, role FROM users WHERE id = ?", [
      payload.sub,
    ]);
    if (!rows.length) return res.status(401).json({ detail: "User not found" });
    req.user = rows[0];
    next();
  } catch (err) {
    const msg = err.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    return res.status(401).json({ detail: msg });
  }
}

function isEmail(v) {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// ---------- root ----------

api.get("/", (req, res) => res.json({ message: "Manofox API running" }));

// ---------- auth ----------

api.post(
  "/auth/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (!isEmail(email) || !password) {
      return res.status(422).json({ detail: "Valid email and password are required" });
    }
    const cleanEmail = email.toLowerCase();
    const identifier = `${req.ip}:${cleanEmail}`;

    const [attemptRows] = await pool.query(
      "SELECT * FROM login_attempts WHERE identifier = ?",
      [identifier]
    );
    const attempt = attemptRows[0];
    if (attempt && attempt.count >= 5) {
      if (attempt.locked_until && new Date(attempt.locked_until) > new Date()) {
        return res
          .status(429)
          .json({ detail: "Too many failed attempts. Try again in 15 minutes." });
      }
      await pool.query("DELETE FROM login_attempts WHERE identifier = ?", [identifier]);
    }

    const [userRows] = await pool.query("SELECT * FROM users WHERE email = ?", [cleanEmail]);
    const user = userRows[0];
    const valid = user && (await bcrypt.compare(password, user.password_hash));
    if (!valid) {
      const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      await pool.query(
        `INSERT INTO login_attempts (identifier, count, locked_until) VALUES (?, 1, ?)
         ON DUPLICATE KEY UPDATE count = count + 1, locked_until = VALUES(locked_until)`,
        [identifier, lockedUntil]
      );
      return res.status(401).json({ detail: "Invalid email or password" });
    }

    await pool.query("DELETE FROM login_attempts WHERE identifier = ?", [identifier]);
    const token = signToken(user.id, cleanEmail);
    return res.json({
      token,
      user: { id: user.id, email: cleanEmail, name: user.name || "Admin", role: user.role || "admin" },
    });
  })
);

api.get("/auth/me", requireAuth, (req, res) => res.json(req.user));

api.post("/auth/logout", (req, res) => res.json({ message: "Logged out" }));

// ---------- leads ----------

api.post(
  "/leads",
  asyncHandler(async (req, res) => {
    const { name, email, phone = "", service = "General Inquiry", message } = req.body || {};
    if (!name || name.length < 2 || name.length > 100) {
      return res.status(422).json({ detail: "Name must be between 2 and 100 characters" });
    }
    if (!isEmail(email)) {
      return res.status(422).json({ detail: "A valid email is required" });
    }
    if (!message || message.length < 5 || message.length > 2000) {
      return res.status(422).json({ detail: "Message must be between 5 and 2000 characters" });
    }
    const [result] = await pool.query(
      "INSERT INTO leads (name, email, phone, service, message, status) VALUES (?, ?, ?, ?, ?, 'new')",
      [name, email, phone.slice(0, 25), service.slice(0, 100), message]
    );
    res
      .status(201)
      .json({ message: "Thank you! Our team will reach out within 24 hours.", id: result.insertId });
  })
);

api.get(
  "/leads",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { status } = req.query;
    let sql = "SELECT * FROM leads";
    const params = [];
    if (LEAD_STATUSES.includes(status)) {
      sql += " WHERE status = ?";
      params.push(status);
    }
    sql += " ORDER BY created_at DESC LIMIT 500";
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  })
);

api.patch(
  "/leads/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { status } = req.body || {};
    if (!LEAD_STATUSES.includes(status)) {
      return res.status(400).json({ detail: "Invalid status" });
    }
    const [result] = await pool.query("UPDATE leads SET status = ? WHERE id = ?", [
      status,
      req.params.id,
    ]);
    if (result.affectedRows === 0) return res.status(404).json({ detail: "Lead not found" });
    res.json({ message: "Status updated", status });
  })
);

api.delete(
  "/leads/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("DELETE FROM leads WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ detail: "Lead not found" });
    res.json({ message: "Lead deleted" });
  })
);

api.get(
  "/stats",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM leads");
    const byStatus = {};
    for (const s of LEAD_STATUSES) {
      const [[{ c }]] = await pool.query("SELECT COUNT(*) AS c FROM leads WHERE status = ?", [s]);
      byStatus[s] = c;
    }
    const [[{ subscribers }]] = await pool.query("SELECT COUNT(*) AS subscribers FROM subscribers");
    const [[{ recent }]] = await pool.query(
      "SELECT COUNT(*) AS recent FROM leads WHERE created_at >= (NOW() - INTERVAL 7 DAY)"
    );
    const [latest] = await pool.query("SELECT * FROM leads ORDER BY created_at DESC LIMIT 5");
    res.json({
      total_leads: total,
      by_status: byStatus,
      subscribers,
      leads_last_7_days: recent,
      recent_leads: latest,
    });
  })
);

// ---------- newsletter ----------

api.post(
  "/newsletter",
  asyncHandler(async (req, res) => {
    const { email } = req.body || {};
    if (!isEmail(email)) return res.status(422).json({ detail: "A valid email is required" });
    const cleanEmail = email.toLowerCase();
    const [rows] = await pool.query("SELECT id FROM subscribers WHERE email = ?", [cleanEmail]);
    if (rows.length) return res.json({ message: "You are already subscribed!" });
    await pool.query("INSERT INTO subscribers (email) VALUES (?)", [cleanEmail]);
    res.status(201).json({ message: "Subscribed successfully!" });
  })
);

// ---------- site content ----------

api.get(
  "/content",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT values_json FROM site_content WHERE content_key = ?", [
      "site",
    ]);
    const content = { ...DEFAULT_CONTENT };
    if (rows.length) {
      const stored = rows[0].values_json || {};
      for (const k of Object.keys(DEFAULT_CONTENT)) {
        if (stored[k] !== undefined) content[k] = stored[k];
      }
    }
    res.json(content);
  })
);

api.put(
  "/content",
  requireAuth,
  asyncHandler(async (req, res) => {
    const values = {};
    for (const [k, v] of Object.entries(req.body || {})) {
      if (k in DEFAULT_CONTENT) values[k] = String(v).slice(0, 2000);
    }
    await pool.query(
      `INSERT INTO site_content (content_key, values_json) VALUES ('site', ?)
       ON DUPLICATE KEY UPDATE values_json = VALUES(values_json)`,
      [JSON.stringify(values)]
    );
    res.json({ message: "Content updated", values });
  })
);

// ---------- blogs (public) ----------

api.get(
  "/blogs",
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const [rows] = await pool.query(
      "SELECT * FROM blogs WHERE status = 'published' ORDER BY published_at DESC LIMIT ?",
      [limit]
    );
    res.json(rows);
  })
);

api.get(
  "/blogs/:slug",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      "SELECT * FROM blogs WHERE slug = ? AND status = 'published'",
      [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ detail: "Post not found" });
    res.json(rows[0]);
  })
);

// ---------- blogs (admin) ----------

api.get(
  "/admin/blogs",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM blogs ORDER BY created_at DESC LIMIT 300");
    res.json(rows);
  })
);

api.post(
  "/admin/blogs",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { title, summary = "", content = "", image_url = "", category = "News", status = "published" } =
      req.body || {};
    if (!title || title.length < 3) return res.status(422).json({ detail: "Title is required" });
    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 180) +
      "-" +
      Date.now().toString(36).slice(-5);
    const [result] = await pool.query(
      `INSERT INTO blogs (title, slug, summary, content, image_url, category, status, is_automated)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [title.slice(0, 255), slug, summary, content, image_url, category.slice(0, 100), status]
    );
    res.status(201).json({ message: "Post created", id: result.insertId, slug });
  })
);

api.put(
  "/admin/blogs/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const fields = ["title", "summary", "content", "image_url", "category", "status"];
    const updates = [];
    const values = [];
    for (const f of fields) {
      if (req.body && req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(req.body[f]);
      }
    }
    if (!updates.length) return res.status(400).json({ detail: "No fields to update" });
    values.push(req.params.id);
    const [result] = await pool.query(`UPDATE blogs SET ${updates.join(", ")} WHERE id = ?`, values);
    if (result.affectedRows === 0) return res.status(404).json({ detail: "Post not found" });
    res.json({ message: "Post updated" });
  })
);

api.delete(
  "/admin/blogs/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("DELETE FROM blogs WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ detail: "Post not found" });
    res.json({ message: "Post deleted" });
  })
);

api.delete(
  "/admin/blogs",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("DELETE FROM blogs WHERE is_automated = 1");
    res.json({ message: `Removed ${result.affectedRows} auto-fetched post(s)` });
  })
);

api.post(
  "/admin/blogs/fetch-news",
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await fetchAndStoreNews();
    if (result.errors?.length) console.error("[blogs/fetch-news] errors:", result.errors);
    res.json({ message: `Fetched ${result.inserted} new post(s)`, ...result });
  })
);

// ---------- newsletter (admin) ----------

api.get(
  "/admin/subscribers",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM subscribers ORDER BY created_at DESC LIMIT 1000");
    res.json(rows);
  })
);

api.delete(
  "/admin/subscribers/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("DELETE FROM subscribers WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ detail: "Subscriber not found" });
    res.json({ message: "Subscriber removed" });
  })
);

app.use("/api", api);

// generic API error handler
app.use("/api", (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ detail: "Internal server error" });
});

// ---------- sitemap ----------

app.get(
  "/sitemap.xml",
  asyncHandler(async (req, res) => {
    const origin = `${req.protocol}://${req.get("host")}`;
    const staticPages = ["", "/services", "/about", "/portfolio", "/blog", "/contact"];
    const [blogs] = await pool.query(
      "SELECT slug, published_at FROM blogs WHERE status = 'published' ORDER BY published_at DESC LIMIT 1000"
    );

    const urls = [
      ...staticPages.map((p) => `<url><loc>${origin}${p}</loc><changefreq>weekly</changefreq></url>`),
      ...blogs.map(
        (b) =>
          `<url><loc>${origin}/blog/${b.slug}</loc><lastmod>${new Date(b.published_at)
            .toISOString()
            .slice(0, 10)}</lastmod><changefreq>monthly</changefreq></url>`
      ),
    ];

    res.header("Content-Type", "application/xml");
    res.send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join(
        "\n"
      )}\n</urlset>`
    );
  })
);

// ---------- serve React build ----------

const buildPath = path.join(__dirname, "..", "frontend", "build");
app.use(express.static(buildPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

// ---------- startup: ensure tables + seed admin ----------

async function ensureAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return;

  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [adminEmail]);
  const hash = await bcrypt.hash(adminPassword, 10);
  if (!rows.length) {
    await pool.query(
      "INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, 'Manofox Admin', 'admin')",
      [adminEmail, hash]
    );
    console.log(`Seeded admin user ${adminEmail}`);
  } else {
    const match = await bcrypt.compare(adminPassword, rows[0].password_hash);
    if (!match) {
      await pool.query("UPDATE users SET password_hash = ? WHERE email = ?", [hash, adminEmail]);
      console.log(`Updated admin password for ${adminEmail}`);
    }
  }
}

// Fetch trending news once a day at 6:00 AM server time.
// Change the cron expression to run more/less often (e.g. "0 */6 * * *" for every 6 hours).
cron.schedule("0 6 * * *", async () => {
  try {
    const result = await fetchAndStoreNews();
    console.log(`[news-cron] Fetched ${result.inserted} new post(s)`, result.errors);
  } catch (err) {
    console.error("[news-cron] Failed:", err.message);
  }
});

ensureAdmin()
  .catch((err) => console.error("Admin seed failed:", err.message))
  .finally(() => {
    app.listen(PORT, () => console.log(`Manofox server running on port ${PORT}`));
  });