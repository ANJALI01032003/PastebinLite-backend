require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB, sequelize } = require("./config/db");

require("./models/Paste");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.get("/api/healthz", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

app.use("/api/pastes", require("./routes/pasteRoutes"));

/* 🔥 MOVE THIS ROUTE UP */
app.get("/p/:id", async (req, res) => {
  try {
    const Paste = require("./models/Paste");

    const paste = await Paste.findByPk(req.params.id);
    if (!paste) return res.status(404).send("Paste not found");

    const now = Date.now();
    if (paste.expiresAt && now > new Date(paste.expiresAt).getTime()) {
      return res.status(404).send("Paste expired");
    }

    if (paste.remainingViews !== null) {
      if (paste.remainingViews <= 0)
        return res.status(404).send("View limit exceeded");

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

sequelize.sync().then(() => {
  app.listen(5000, () => console.log("Server running on 5000"));
});
