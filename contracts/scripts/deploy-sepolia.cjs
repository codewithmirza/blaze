const hre = require("hardhat");

async function main() {
  console.log("Deploying Blaze It contracts to Worldchain Sepolia...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance.lt(hre.ethers.parseEther("0.01"))) {
    console.error("Insufficient balance for deployment. Please fund your account with Sepolia ETH.");
    process.exit(1);
  }

  // Deploy Treasury first
  console.log("\n1. Deploying Treasury...");
  const Treasury = await hre.ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy();
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("Treasury deployed to:", treasuryAddress);

  // Deploy TokenFactory
  console.log("\n2. Deploying TokenFactory...");
  const TokenFactory = await hre.ethers.getContractFactory("TokenFactory");
  const tokenFactory = await TokenFactory.deploy(treasuryAddress);
  await tokenFactory.waitForDeployment();
  const tokenFactoryAddress = await tokenFactory.getAddress();
  console.log("TokenFactory deployed to:", tokenFactoryAddress);

  // Create a sample token
  console.log("\n3. Creating sample token...");
  const tx = await tokenFactory.createToken(
    "Blaze It Sample",
    "BLAZE",
    hre.ethers.parseEther("100000000"), // 100M tokens
    hre.ethers.parseEther("0.001"), // 0.001 ETH base price
    hre.ethers.parseEther("0.000001") // 0.000001 ETH slope
  );
  const receipt = await tx.wait();
  
  // Get the token addresses from the event
  const event = receipt.logs.find(log => {
    try {
      const parsed = tokenFactory.interface.parseLog(log);
      return parsed.name === "TokenCreated";
    } catch (e) {
      return false;
    }
  });
  
  if (event) {
    const parsed = tokenFactory.interface.parseLog(event);
    const tokenAddress = parsed.args.tokenAddress;
    const bondingCurveAddress = parsed.args.bondingCurveAddress;
    
    console.log("Sample token deployed to:", tokenAddress);
    console.log("Bonding curve deployed to:", bondingCurveAddress);
  }

  console.log("\n=== Deployment Summary ===");
  console.log("Treasury:", treasuryAddress);
  console.log("TokenFactory:", tokenFactoryAddress);
  console.log("\n=== Environment Variables ===");
  console.log(`TREASURY_ADDRESS=${treasuryAddress}`);
  console.log(`TOKEN_FACTORY_ADDRESS=${tokenFactoryAddress}`);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    treasury: treasuryAddress,
    tokenFactory: tokenFactoryAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  const fs = require('fs');
  if (!fs.existsSync('deployments')) {
    fs.mkdirSync('deployments');
  }
  
  fs.writeFileSync(
    `deployments/${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\nDeployment completed successfully!");
  console.log("\nNext steps:");
  console.log("1. Update your backend/.env file with the contract addresses above");
  console.log("2. Test the contracts on Worldchain Sepolia");
  console.log("3. Verify contracts on the explorer (optional)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
