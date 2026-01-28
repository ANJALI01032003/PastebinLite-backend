const Paste = require("../models/Paste");

// CREATE
exports.createPaste = async (req, res) => {
  const { content, ttl_seconds, max_views } = req.body;

  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "Content required" });
  }

  let expiresAt = null;
  if (ttl_seconds) {
    expiresAt = new Date(Date.now() + ttl_seconds * 1000);
  }

  const paste = await Paste.create({
    content,
    expiresAt,
    maxViews: max_views || null,
    remainingViews: max_views || null
  });

  res.status(201).json({
    id: paste.id,
    url: `${process.env.BASE_URL}/p/${paste.id}`
  });
  
};

// FETCH
exports.getPaste = async (req, res) => {
  const paste = await Paste.findByPk(req.params.id);
  if (!paste) return res.status(404).json({ error: "Not found" });

  const now =
    process.env.TEST_MODE === "1"
      ? Number(req.headers["x-test-now-ms"] || Date.now())
      : Date.now();

  if (paste.expiresAt && now > paste.expiresAt.getTime()) {
    return res.status(404).json({ error: "Expired" });
  }

  if (paste.remainingViews !== null) {
    if (paste.remainingViews <= 0) {
      return res.status(404).json({ error: "Limit exceeded" });
    }
    paste.remainingViews -= 1;
    await paste.save();
  }

  res.json({
    content: paste.content,
    remaining_views: paste.remainingViews,
    expires_at: paste.expiresAt
  });
};



exports.getAllPastes = async (req, res) => {
  try {
    const pastes = await Paste.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(pastes);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

