// 🔝 Load environment variables FIRST
require("dotenv").config();

// 🔝 Core imports
const express = require("express");
const cors = require("cors");

// 🔝 Database
const { connectDB, sequelize } = require("./config/db");

// 🔝 Models (load once)
const Paste = require("./models/Paste");

// 🔝 App init
const app = express();

// 🔝 Connect DB
connectDB();

// 🔝 Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173", // local Vite
      "https://pastebinlite-frontendd.vercel.app" // production frontend
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  })
);

app.use(express.json());

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

    const now = Date.now();

    if (paste.expiresAt && now > paste.expiresAt.getTime()) {
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
        <head>
          <title>Paste</title>
        </head>
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
