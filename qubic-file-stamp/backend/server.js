const express = require("express");
const cors = require("cors");
const multer = require("multer");
const stampRoute = require("./api/stamp");
const verifyRoute = require("./api/verify");
const stampIdRoute = require("./api/stamp_Id");
const stampsRoute = require("./api/stamps");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Allow all origins for CORS
app.use(
  cors({
    origin: "*", // Allow all origins (or specify your frontend URL)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

// Handle preflight requests
app.options("*", cors());

// Configure multer for file uploads - use memory storage for Vercel
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Routes
app.post("/api/stamp", upload.single("file"), stampRoute);
app.post("/api/verify", upload.single("file"), verifyRoute);
app.get("/api/stamp/:id", stampIdRoute);
app.get("/api/stamps", stampsRoute);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Start server
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

module.exports = app;
