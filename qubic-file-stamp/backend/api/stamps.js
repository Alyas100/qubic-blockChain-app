// Get all stamps
const stampModule = require("./stamp");

module.exports = async (req, res) => {
  try {
    const { owner, search } = req.query;

    // Get all stamps from database
    let stamps = [];
    for (const [key, value] of stampModule.stampDatabase.entries()) {
      // Skip if key is a fileHash (we store both stampId and fileHash as keys)
      if (key.length === 64 && !key.includes("-")) {
        continue; // This is a fileHash key, skip it
      }

      // Filter by owner if provided
      if (owner && value.owner.toLowerCase() !== owner.toLowerCase()) {
        continue;
      }

      // Search by filename if provided
      if (
        search &&
        !value.fileName.toLowerCase().includes(search.toLowerCase())
      ) {
        continue;
      }

      stamps.push(value);
    }

    // Sort by timestamp (newest first)
    stamps.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      count: stamps.length,
      stamps: stamps,
    });
  } catch (error) {
    console.error("Error retrieving stamps:", error);
    res.status(500).json({ error: "Failed to retrieve stamps" });
  }
};
