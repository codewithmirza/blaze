const { ethers } = require("ethers");

async function main() {
  console.log("Generating a new test wallet...");
  
  // Generate a new random wallet
  const wallet = ethers.Wallet.createRandom();
  
  console.log("\n=== New Test Wallet ===");
  console.log("Address:", wallet.address);
  console.log("Private Key:", wallet.privateKey);
  console.log("\n=== Instructions ===");
  console.log("1. Copy the private key above");
  console.log("2. Update your .env file:");
  console.log(`   PRIVATE_KEY=${wallet.privateKey}`);
  console.log("3. Fund this address with Sepolia ETH from a faucet");
  console.log("4. Run: npx hardhat run scripts/deploy-sepolia.cjs --network worldchain-sepolia");
  console.log("\n=== Faucets for Sepolia ETH ===");
  console.log("- https://sepoliafaucet.com/");
  console.log("- https://faucet.sepolia.dev/");
  console.log("- https://sepolia-faucet.pk910.de/");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
