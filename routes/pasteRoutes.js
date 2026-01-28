const express = require("express");
const router = express.Router();
const {
  createPaste,
  getPaste,
  getAllPastes
} = require("../controllers/pasteController");

router.post("/pastes", createPaste);
router.get("/pastes", getAllPastes);
router.get("/pastes/:id", getPaste);

module.exports = router;
