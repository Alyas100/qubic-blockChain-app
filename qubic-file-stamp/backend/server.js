const express = require("express");
const cors = require("cors");
const multer = require("multer");
const stampRoute = require("./api/stamp");
const verifyRoute = require("./api/verify");
const stampIdRoute = require("./api/stamp_Id");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Routes
app.post("/api/stamp", upload.single("file"), stampRoute);
app.post("/api/verify", upload.single("file"), verifyRoute);
app.get("/api/stamp/:id", stampIdRoute);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
