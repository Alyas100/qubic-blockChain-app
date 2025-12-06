// Verify a file's authenticity
const crypto = require("crypto");
const fs = require("fs");
const stampModule = require("./stamp");

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

    // Look up stamp in database
    const stampData = stampModule.stampDatabase.get(fileHash);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

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
