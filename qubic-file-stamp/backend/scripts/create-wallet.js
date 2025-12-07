const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

console.log("🔐 Generating new Polygon wallet...\n");

// Generate a random wallet
const wallet = ethers.Wallet.createRandom();

console.log("✅ Wallet Created Successfully!\n");
console.log("=".repeat(60));
console.log("📍 Wallet Address:", wallet.address);
console.log("🔑 Private Key:", wallet.privateKey);
console.log("=".repeat(60));
console.log("\n⚠️  IMPORTANT: Save this information securely!\n");

// Create .env file
const envPath = path.join(__dirname, "..", ".env");
const envContent = `# Polygon Mumbai Testnet Wallet
POLYGON_PRIVATE_KEY=${wallet.privateKey}
`;

fs.writeFileSync(envPath, envContent);
console.log("✅ Saved to .env file\n");

// Create instructions file
const instructions = `
POLYGON WALLET SETUP
====================

Your Wallet Address: ${wallet.address}
Private Key: ${wallet.privateKey}

NEXT STEPS:
-----------

1. Get FREE testnet MATIC:
   → Visit: https://faucet.polygon.technology/
   → Paste your address: ${wallet.address}
   → Select "Mumbai" network
   → Click "Submit"
   → Wait ~1 minute

2. Start your server:
   → npm start

3. Test the stamp endpoint:
   → The server will automatically use this wallet

VERIFY YOUR BALANCE:
--------------------
Visit: https://mumbai.polygonscan.com/address/${wallet.address}

⚠️  SECURITY NOTE:
This wallet is for TESTNET ONLY. Never use it for real money!
Keep your private key secret - don't commit it to git!

`;

const instructionsPath = path.join(__dirname, "..", "WALLET-INFO.txt");
fs.writeFileSync(instructionsPath, instructions);
console.log("📄 Instructions saved to: WALLET-INFO.txt\n");

console.log("🎯 NEXT STEP:");
console.log(
  "   Get free testnet MATIC from: https://faucet.polygon.technology/"
);
console.log("   Your address:", wallet.address);
console.log("\n");
