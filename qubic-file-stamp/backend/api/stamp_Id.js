// Get stamp details
const stampModule = require("./stamp");

module.exports = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Stamp ID is required" });
    }

    // Look up stamp in database
    const stampData = stampModule.stampDatabase.get(id);

    if (stampData) {
      res.json({
        success: true,
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
      res.status(404).json({
        success: false,
        error: "Stamp not found",
      });
    }
  } catch (error) {
    console.error("Error retrieving stamp:", error);
    res.status(500).json({ error: "Failed to retrieve stamp details" });
  }
};
