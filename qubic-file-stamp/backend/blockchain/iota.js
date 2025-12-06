const crypto = require("crypto");

class IOTAStamp {
  constructor() {
    // IOTA configuration
    this.network = "mainnet"; // or 'testnet' for testing
    this.nodeUrl = "https://api.stardust-mainnet.iotaledger.net";
  }

  /**
   * Stamp a file hash to IOTA Tangle
   * @param {string} fileHash - SHA256 hash of the file
   * @param {string} owner - Owner name
   * @returns {Promise<string>} - Transaction ID
   */
  async stampToBlockchain(fileHash, owner) {
    try {
      // Import IOTA client (install: npm install @iota/sdk)
      const { Client, SecretManager, utf8ToHex } = require("@iota/sdk");

      // Initialize IOTA client
      const client = new Client({
        nodes: [this.nodeUrl],
      });

      // Create message payload with file hash and metadata
      const message = {
        fileHash: fileHash,
        owner: owner,
        timestamp: new Date().toISOString(),
        application: "qubic-file-stamp",
      };

      const messageHex = utf8ToHex(JSON.stringify(message));

      // For production, you need a wallet with funds
      // For now, we'll use tagged data block (free)
      const blockIdAndBlock = await client.buildAndPostBlock({
        tag: utf8ToHex("QUBIC-FILE-STAMP"),
        data: messageHex,
      });

      // Return the block ID as transaction ID
      return blockIdAndBlock[0];
    } catch (error) {
      console.error("IOTA blockchain error:", error);
      throw new Error("Failed to stamp to blockchain");
    }
  }

  /**
   * Verify a file hash on IOTA Tangle
   * @param {string} txId - Transaction ID to verify
   * @returns {Promise<object>} - Stamp data from blockchain
   */
  async verifyFromBlockchain(txId) {
    try {
      const { Client, hexToUtf8 } = require("@iota/sdk");

      const client = new Client({
        nodes: [this.nodeUrl],
      });

      // Fetch block from Tangle
      const block = await client.getBlock(txId);

      // Extract data from block
      if (block.payload && block.payload.data) {
        const dataHex = block.payload.data;
        const dataString = hexToUtf8(dataHex);
        const stampData = JSON.parse(dataString);

        return {
          found: true,
          data: stampData,
        };
      }

      return { found: false };
    } catch (error) {
      console.error("IOTA verification error:", error);
      return { found: false };
    }
  }

  /**
   * Get explorer URL for transaction
   * @param {string} txId - Transaction ID
   * @returns {string} - Explorer URL
   */
  getExplorerUrl(txId) {
    return `https://explorer.iota.org/${this.network}/block/${txId}`;
  }
}

module.exports = new IOTAStamp();
