// Verify a file's authenticity
const crypto = require("crypto");
const stampModule = require("./stamp");

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

    // Look up stamp in database
    const stampData = stampModule.stampDatabase.get(fileHash);

    // No need to clean up file since it's in memory

    if (stampData) {
      res.json({
        success: true,
        authentic: true,
        stamp: {
          id: stampData.id,
          fileHash: stampData.fileHash,
          fileName: stampData.fileName,
          owner: stampData.owner,
          timestamp: stampData.timestamp,
          txId: stampData.txId,
        },
      });
    } else {
      res.json({
        success: true,
        authentic: false,
        message: "File not found in stamp database",
      });
    }
  } catch (error) {
    console.error("Error verifying file:", error);
    res.status(500).json({ error: "Failed to verify file" });
  }
};
