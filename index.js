// 🔝 Load environment variables FIRST
require("dotenv").config();

// 🔝 Core imports
const express = require("express");

// 🔝 Database
const { connectDB, sequelize } = require("./config/db");

// 🔝 Models
const Paste = require("./models/Paste");

// 🔝 App init
const app = express();

// 🔝 Connect DB
connectDB();

/**
 * 🔥 MIDDLEWARE (SIMPLE + BULLETPROOF)
 * Ye hi 405 + CORS + OPTIONS sab solve karega
 */
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://pastebinlite-frontendd.vercel.app"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/**
 * Health check
 */
app.get("/api/healthz", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
});

/**
 * API routes
 */
app.use("/api/pastes", require("./routes/pasteRoutes"));

/**
 * Public paste view
 */
app.get("/p/:id", async (req, res) => {
  try {
    const paste = await Paste.findByPk(req.params.id);
    if (!paste) return res.status(404).send("Paste not found");

    if (paste.expiresAt && Date.now() > paste.expiresAt.getTime()) {
      return res.status(404).send("Paste expired");
    }

    if (paste.remainingViews !== null) {
      if (paste.remainingViews <= 0) {
        return res.status(404).send("View limit exceeded");
      }
      paste.remainingViews -= 1;
      await paste.save();
    }

    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Paste</title></head>
        <body>
          <pre>${paste.content
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")}</pre>
        </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

/**
 * Start server AFTER DB sync
 */
const PORT = process.env.PORT || 5000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log("🚀 Server running on port", PORT);
  });
});
