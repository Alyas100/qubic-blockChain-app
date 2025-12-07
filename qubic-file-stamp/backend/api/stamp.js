// Upload and stamp a file
const crypto = require("crypto");

// In-memory storage (replace with database in production)
const stampDatabase = new Map();

module.exports = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Read file from memory buffer (multer memoryStorage)
    const fileBuffer = req.file.buffer;
    const fileHash = crypto
      .createHash("sha256")
      .update(fileBuffer)
      .digest("hex");

    // Generate stamp data
    const stampId = crypto.randomBytes(16).toString("hex");
    const timestamp = new Date().toISOString();

    // Generate stamp data
    // call blockchain function (Polygon)
    const polygonStamp = require("../blockchain/polygon");
    const txId = await polygonStamp.stampToBlockchain(
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

    // No need to clean up file since it's in memory

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
