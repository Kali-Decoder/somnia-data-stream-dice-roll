import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function deployDiceMania() {
  const CONTRACT_NAME = "DiceMania";  
  console.log("Deploying DiceMania contract...");

  const [deployer] = await (hre.ethers as any).getSigners();
  const provider = deployer.provider;
  if (!provider) {
    throw new Error("Provider not available");
  }
  const network = await provider.getNetwork();
  const blockNumber = await provider.getBlockNumber();
  
  const diceMania = await hre.ethers.deployContract(CONTRACT_NAME);
  await diceMania.waitForDeployment();
  
  const contractAddress = String((diceMania as any).target);
  const owner = await diceMania.owner();
  const poolId = await diceMania.poolId();
  const pointsPerBet = await diceMania.POINTS_PER_BET();
  const pointsPerWin = await diceMania.POINTS_PER_WIN();
  
  console.log("✅ DiceMania contract deployed successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("Owner:", owner);
  console.log("Initial Pool ID:", poolId.toString());
  console.log("Points per Bet:", pointsPerBet.toString());
  console.log("Points per Win:", pointsPerWin.toString());
  
  // Create deployment data object
  const deploymentData = {
    contractName: CONTRACT_NAME,
    contractAddress: contractAddress,
    network: {
      name: network.name,
      chainId: network.chainId.toString(),
    },
    deployer: {
      address: deployer.address,
    },
    owner: owner,
    deploymentInfo: {
      timestamp: new Date().toISOString(),
      blockNumber: blockNumber.toString(),
    },
    contractConfig: {
      initialPoolId: poolId.toString(),
      pointsPerBet: pointsPerBet.toString(),
      pointsPerWin: pointsPerWin.toString(),
    },
  };
  
  // Write to JSON file
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentsDir, `deployment-${network.chainId}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
  
  console.log("\n📄 Deployment data saved to:", deploymentFile);
  
  return contractAddress;
}

async function main() {
  await deployDiceMania();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});