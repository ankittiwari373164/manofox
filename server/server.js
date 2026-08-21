require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");

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

app.use("/api", api);

// generic API error handler
app.use("/api", (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ detail: "Internal server error" });
});

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

ensureAdmin()
  .catch((err) => console.error("Admin seed failed:", err.message))
  .finally(() => {
    app.listen(PORT, () => console.log(`Manofox server running on port ${PORT}`));
  });
