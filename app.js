const express = require("express");
const app = express();

require("dotenv").config();

const pasteRoutes = require("./routes/pasteRoutes");

app.use(express.json()); 
app.use("/api", pasteRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on", PORT));
