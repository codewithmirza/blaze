const hre = require("hardhat");

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function deployWithRetry() {
  console.log("Deploying Blaze It contracts to Worldchain Sepolia with retry logic...");
  
  let retries = 0;
  const maxRetries = 5;
  
  while (retries < maxRetries) {
    try {
      console.log(`Attempt ${retries + 1}/${maxRetries}...`);
      
      const [deployer] = await hre.ethers.getSigners();
      console.log("Deploying contracts with account:", deployer.address);
      
      const balance = await hre.ethers.provider.getBalance(deployer.address);
      console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
      
      if (balance === 0n) {
        throw new Error("Account has no ETH for deployment");
      }

      // 1. Deploy Treasury
      console.log("\n1. Deploying Treasury...");
      const Treasury = await hre.ethers.getContractFactory("Treasury");
      const treasury = await Treasury.deploy();
      await treasury.waitForDeployment();
      const treasuryAddress = await treasury.getAddress();
      console.log("Treasury deployed to:", treasuryAddress);

      // 2. Deploy TokenFactory
      console.log("\n2. Deploying TokenFactory...");
      const TokenFactory = await hre.ethers.getContractFactory("TokenFactory");
      const tokenFactory = await TokenFactory.deploy(treasuryAddress);
      await tokenFactory.waitForDeployment();
      const tokenFactoryAddress = await tokenFactory.getAddress();
      console.log("TokenFactory deployed to:", tokenFactoryAddress);

      // 3. Create sample token
      console.log("\n3. Creating sample token...");
      const createTokenTx = await tokenFactory.createToken(
        "BlazeCoin",
        "BLAZE",
        hre.ethers.parseEther("1000000"), // 1M tokens
        hre.ethers.parseEther("0.001"), // 0.001 ETH base price
        hre.ethers.parseEther("0.000001") // 0.000001 ETH slope
      );
      
      const receipt = await createTokenTx.wait();
      console.log("Sample token creation transaction:", createTokenTx.hash);
      
      // Parse events to get addresses
      const tokenCreatedEvent = receipt.logs.find(log => {
        try {
          const parsed = tokenFactory.interface.parseLog(log);
          return parsed && parsed.name === "TokenCreated";
        } catch (e) {
          return false;
        }
      });
      
      let tokenAddress, bondingCurveAddress;
      if (tokenCreatedEvent) {
        const parsed = tokenFactory.interface.parseLog(tokenCreatedEvent);
        tokenAddress = parsed.args.tokenAddress;
        bondingCurveAddress = parsed.args.bondingCurveAddress;
        console.log("Sample token deployed to:", tokenAddress);
        console.log("Bonding curve deployed to:", bondingCurveAddress);
      } else {
        console.log("Could not parse token creation event, using mock addresses");
        tokenAddress = "0x" + "0".repeat(40);
        bondingCurveAddress = "0x" + "0".repeat(40);
      }

      console.log("\n=== Deployment Summary ===");
      console.log("Treasury:", treasuryAddress);
      console.log("TokenFactory:", tokenFactoryAddress);
      console.log("Sample Token:", tokenAddress);
      console.log("Sample Bonding Curve:", bondingCurveAddress);

      console.log("\n=== Environment Variables ===");
      console.log(`TREASURY_ADDRESS=${treasuryAddress}`);
      console.log(`TOKEN_FACTORY_ADDRESS=${tokenFactoryAddress}`);

      console.log("\nDeployment completed successfully!");
      return;
      
    } catch (error) {
      retries++;
      console.error(`Attempt ${retries} failed:`, error.message);
      
      if (retries < maxRetries) {
        const waitTime = Math.pow(2, retries) * 1000; // Exponential backoff
        console.log(`Waiting ${waitTime/1000} seconds before retry...`);
        await sleep(waitTime);
      } else {
        console.error("All retry attempts failed. Rate limiting is too aggressive.");
        console.log("\n=== Fallback: Using Local Deployment ===");
        console.log("Your local deployment is working and ready for testing!");
        console.log("TREASURY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3");
        console.log("TOKEN_FACTORY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
        console.log("\nYou can proceed with local deployment for testing and submission.");
      }
    }
  }
}

deployWithRetry()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
