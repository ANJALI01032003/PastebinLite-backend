const express = require("express");
const router = express.Router();
const {
  createPaste,
  getPaste,
  getAllPastes
} = require("../controllers/pasteController");

router.get("/", getAllPastes);  
router.post("/", createPaste);
router.get("/:id", getPaste);

module.exports = router;
