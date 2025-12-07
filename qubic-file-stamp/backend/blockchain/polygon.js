const { ethers } = require("ethers");

class PolygonStamp {
  constructor() {
    // Polygon Amoy Testnet configuration
    this.network = "polygon-amoy";
    this.rpcUrl = "https://rpc-amoy.polygon.technology"; // Free public RPC

    // Alternative RPC endpoints (if one fails, you can try others):
    // "https://polygon-amoy.g.alchemy.com/v2/demo"
    // "https://polygon-amoy-bor-rpc.publicnode.com"

    // Contract address where stamps will be stored (we'll use a simple approach)
    // For hackathon: We'll store data in transaction input data (free, no contract needed)
    this.provider = new ethers.JsonRpcProvider(this.rpcUrl);

    // IMPORTANT: Set your wallet private key here
    // Run: node scripts/create-wallet.js to generate a wallet
    // Then get free MATIC from: https://faucet.polygon.technology/

    // Load from .env file
    require("dotenv").config();
    this.privateKey =
      process.env.POLYGON_PRIVATE_KEY || "YOUR_PRIVATE_KEY_HERE";

    // Check if wallet is configured
    if (this.privateKey === "YOUR_PRIVATE_KEY_HERE") {
      console.warn("⚠️  WARNING: Polygon wallet not configured!");
      console.warn(
        "   Set POLYGON_PRIVATE_KEY environment variable or edit polygon.js"
      );
      this.wallet = null;
    } else {
      this.wallet = new ethers.Wallet(this.privateKey, this.provider);
      console.log("✅ Polygon wallet configured:", this.wallet.address);
    }
  }

  /**
   * Stamp a file hash to Polygon blockchain
   * @param {string} fileHash - SHA256 hash of the file
   * @param {string} owner - Owner name
   * @returns {Promise<string>} - Transaction hash
   */
  async stampToBlockchain(fileHash, owner) {
    try {
      if (!this.wallet) {
        throw new Error(
          "Wallet not configured. Please set POLYGON_PRIVATE_KEY."
        );
      }

      // Create stamp data
      const stampData = {
        fileHash: fileHash,
        owner: owner,
        timestamp: new Date().toISOString(),
        application: "qubic-file-stamp",
      };

      // Convert to hex for blockchain storage
      const dataString = JSON.stringify(stampData);
      const dataHex = ethers.hexlify(ethers.toUtf8Bytes(dataString));

      console.log("📤 Sending transaction to Polygon Mumbai testnet...");

      // Send transaction with stamp data
      const tx = await this.wallet.sendTransaction({
        to: this.wallet.address, // Send to self (cheapest option)
        value: 0, // No MATIC transfer
        data: dataHex, // Store stamp data in transaction input
        gasLimit: 100000, // Set reasonable gas limit
      });

      console.log("⏳ Waiting for confirmation...");
      console.log("   TX Hash:", tx.hash);

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      console.log("✅ Stamped to blockchain!");
      console.log("   Block:", receipt.blockNumber);
      console.log("   Gas used:", receipt.gasUsed.toString());

      // Return transaction hash
      return tx.hash;
    } catch (error) {
      console.error("Polygon blockchain error:", error.message);

      // Provide helpful error messages
      if (error.message.includes("insufficient funds")) {
        throw new Error(
          "Insufficient MATIC. Get free testnet MATIC from https://faucet.polygon.technology/"
        );
      }

      throw new Error("Failed to stamp to blockchain: " + error.message);
    }
  }

  /**
   * Verify a file hash on Polygon blockchain
   * @param {string} txHash - Transaction hash to verify
   * @returns {Promise<object>} - Stamp data from blockchain
   */
  async verifyFromBlockchain(txHash) {
    try {
      console.log("🔍 Verifying transaction:", txHash);

      // Fetch transaction from blockchain
      const tx = await this.provider.getTransaction(txHash);

      if (!tx) {
        return { found: false };
      }

      // Extract stamp data from transaction input
      if (tx.data && tx.data !== "0x") {
        const dataString = ethers.toUtf8String(tx.data);
        const stampData = JSON.parse(dataString);

        console.log("✅ Transaction verified on blockchain");

        return {
          found: true,
          data: stampData,
          blockNumber: tx.blockNumber,
          transactionHash: tx.hash,
        };
      }

      return { found: false };
    } catch (error) {
      console.error("Polygon verification error:", error.message);
      return { found: false };
    }
  }

  /**
   * Get explorer URL for transaction
   * @param {string} txHash - Transaction hash
   * @returns {string} - Explorer URL
   */
  getExplorerUrl(txHash) {
    return `https://amoy.polygonscan.com/tx/${txHash}`;
  }

  /**
   * Get wallet balance (useful for checking if you have testnet MATIC)
   * @returns {Promise<string>} - Balance in MATIC
   */
  async getBalance() {
    try {
      if (!this.wallet) {
        return "Wallet not configured";
      }

      const balance = await this.provider.getBalance(this.wallet.address);
      const balanceInMatic = ethers.formatEther(balance);
      return balanceInMatic + " MATIC";
    } catch (error) {
      console.error("Error getting balance:", error.message);
      return "Error";
    }
  }

  /**
   * Check if wallet is ready to use
   * @returns {Promise<object>} - Status information
   */
  async checkStatus() {
    try {
      if (!this.wallet) {
        return {
          ready: false,
          message: "Wallet not configured",
          instructions: "Set POLYGON_PRIVATE_KEY environment variable",
        };
      }

      const balance = await this.getBalance();
      const balanceNum = parseFloat(balance);

      return {
        ready: balanceNum > 0,
        walletAddress: this.wallet.address,
        balance: balance,
        message:
          balanceNum > 0
            ? "Ready to stamp files!"
            : "Need testnet MATIC from faucet",
        faucet: "https://faucet.polygon.technology/",
      };
    } catch (error) {
      return {
        ready: false,
        message: "Error checking status: " + error.message,
      };
    }
  }
}

module.exports = new PolygonStamp();
