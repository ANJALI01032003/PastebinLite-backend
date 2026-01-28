const express = require("express");
const router = express.Router();

const {
  createPaste,
  getPaste,
  getAllPastes
} = require("../controllers/pasteController");

// POST /api/pastes
router.post("/", createPaste);

// GET /api/pastes
router.get("/", getAllPastes);

// GET /api/pastes/:id
router.get("/:id", getPaste);

module.exports = router;
