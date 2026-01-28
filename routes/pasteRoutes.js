const express = require("express");
const router = express.Router();
const {
  createPaste,
  getPaste
} = require("../controllers/pasteController");

router.post("/", createPaste);
router.get("/:id", getPaste);

module.exports = router;
