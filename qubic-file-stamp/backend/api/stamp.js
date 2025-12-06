// Upload and stamp a file
const crypto = require("crypto");
const fs = require("fs");

// In-memory storage (replace with database in production)
const stampDatabase = new Map();

module.exports = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Read file and generate hash
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileHash = crypto
      .createHash("sha256")
      .update(fileBuffer)
      .digest("hex");

    // Generate stamp data
    const stampId = crypto.randomBytes(16).toString("hex");
    const timestamp = new Date().toISOString();

    // Generate stamp data
    // call blockchain function
    const iotaStamp = require("../blockchain/iota");
    const txId = await iotaStamp.stampToBlockchain(
      fileHash,
      req.body.owner || "Anonymous"
    );

    const stampData = {
      id: stampId,
      fileHash: fileHash,
      fileName: req.file.originalname,
      owner: req.body.owner || "Anonymous",
      timestamp: timestamp,
      txId: txId,
    };

    // Store in database
    stampDatabase.set(stampId, stampData);
    stampDatabase.set(fileHash, stampData); // Also index by hash for verification

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      stamp: {
        id: stampId,
        fileHash: fileHash,
        owner: stampData.owner,
        timestamp: timestamp,
        txId: txId,
      },
    });
  } catch (error) {
    console.error("Error stamping file:", error);
    res.status(500).json({ error: "Failed to stamp file" });
  }
};

// Export database for use in other routes
module.exports.stampDatabase = stampDatabase;
