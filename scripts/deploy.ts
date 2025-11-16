import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Starting deployment...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy MediFlowAccessControl
  console.log("\nDeploying MediFlowAccessControl...");
  const AccessControl = await ethers.getContractFactory("MediFlowAccessControl");
  const accessControl = await AccessControl.deploy();
  await accessControl.waitForDeployment();
  const accessControlAddress = await accessControl.getAddress();
  console.log("MediFlowAccessControl deployed to:", accessControlAddress);

  // Deploy MediFlowAuditLog
  console.log("\nDeploying MediFlowAuditLog...");
  const AuditLog = await ethers.getContractFactory("MediFlowAuditLog");
  const auditLog = await AuditLog.deploy();
  await auditLog.waitForDeployment();
  const auditLogAddress = await auditLog.getAddress();
  console.log("MediFlowAuditLog deployed to:", auditLogAddress);

  // Save deployment info
  const deployment = {
    network: "localhost",
    chainId: 31337,
    deployer: deployer.address,
    contracts: {
      MediFlowAccessControl: accessControlAddress,
      MediFlowAuditLog: auditLogAddress,
    },
    deployedAt: new Date().toISOString(),
  };

  const deploymentPath = path.join(__dirname, "../deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
  console.log("\nDeployment info saved to:", deploymentPath);

  // Save ABIs
  const abiPath = path.join(__dirname, "../lib/contracts");
  if (!fs.existsSync(abiPath)) {
    fs.mkdirSync(abiPath, { recursive: true });
  }

  const accessControlArtifact = await ethers.getContractFactory("MediFlowAccessControl");
  const auditLogArtifact = await ethers.getContractFactory("MediFlowAuditLog");

  fs.writeFileSync(
    path.join(abiPath, "MediFlowAccessControl.json"),
    JSON.stringify({
      address: accessControlAddress,
      abi: accessControlArtifact.interface.formatJson(),
    }, null, 2)
  );

  fs.writeFileSync(
    path.join(abiPath, "MediFlowAuditLog.json"),
    JSON.stringify({
      address: auditLogAddress,
      abi: auditLogArtifact.interface.formatJson(),
    }, null, 2)
  );

  console.log("\nABIs saved to:", abiPath);
  console.log("\n✅ Deployment completed successfully!");
  console.log("\nContract addresses:");
  console.log("- MediFlowAccessControl:", accessControlAddress);
  console.log("- MediFlowAuditLog:", auditLogAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
