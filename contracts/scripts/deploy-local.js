const hre = require("hardhat");

async function main() {
  console.log("Deploying Blaze It contracts locally...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy Treasury first
  console.log("\n1. Deploying Treasury...");
  const Treasury = await hre.ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy();
  await treasury.deployed();
  console.log("Treasury deployed to:", treasury.address);

  // Deploy TokenFactory
  console.log("\n2. Deploying TokenFactory...");
  const TokenFactory = await hre.ethers.getContractFactory("TokenFactory");
  const tokenFactory = await TokenFactory.deploy(treasury.address);
  await tokenFactory.deployed();
  console.log("TokenFactory deployed to:", tokenFactory.address);

  // Create a sample token
  console.log("\n3. Creating sample token...");
  const tx = await tokenFactory.createToken(
    "Blaze It Sample",
    "BLAZE",
    hre.ethers.utils.parseEther("100000000"), // 100M tokens
    hre.ethers.utils.parseEther("0.001"), // 0.001 ETH base price
    hre.ethers.utils.parseEther("0.000001") // 0.000001 ETH slope
  );
  const receipt = await tx.wait();
  
  // Get the token addresses from the event
  const event = receipt.events.find(e => e.event === "TokenCreated");
  
  if (event) {
    const tokenAddress = event.args.tokenAddress;
    const bondingCurveAddress = event.args.bondingCurveAddress;
    
    console.log("Sample token deployed to:", tokenAddress);
    console.log("Bonding curve deployed to:", bondingCurveAddress);
  }

  console.log("\n=== Deployment Summary ===");
  console.log("Treasury:", treasury.address);
  console.log("TokenFactory:", tokenFactory.address);
  console.log("\n=== Environment Variables ===");
  console.log(`TREASURY_ADDRESS=${treasury.address}`);
  console.log(`TOKEN_FACTORY_ADDRESS=${tokenFactory.address}`);

  console.log("\nDeployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
