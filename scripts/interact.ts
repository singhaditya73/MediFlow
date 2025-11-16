import { ethers } from "hardhat";
import deployment from "../deployment.json";

async function main() {
  console.log("Interacting with deployed contracts...");

  const [owner, user1, user2] = await ethers.getSigners();
  console.log("Owner address:", owner.address);
  console.log("User1 address:", user1.address);
  console.log("User2 address:", user2.address);

  // Get contract instances
  const accessControl = await ethers.getContractAt(
    "MediFlowAccessControl",
    deployment.contracts.MediFlowAccessControl
  );

  const auditLog = await ethers.getContractAt(
    "MediFlowAuditLog",
    deployment.contracts.MediFlowAuditLog
  );

  // Example: Register a record
  console.log("\n1. Registering a health record...");
  const recordId = "record-" + Date.now();
  const ipfsHash = "QmExampleHash123456789";
  
  const registerTx = await accessControl.registerRecord(recordId, ipfsHash);
  await registerTx.wait();
  console.log("✓ Record registered:", recordId);

  // Log audit entry
  await auditLog.logAudit(recordId, "create", JSON.stringify({ ipfsHash }));
  console.log("✓ Audit entry logged");

  // Example: Grant access
  console.log("\n2. Granting access to user1...");
  const grantTx = await accessControl.grantAccess(
    recordId,
    user1.address,
    1, // Read access
    0  // No expiration
  );
  await grantTx.wait();
  console.log("✓ Access granted to:", user1.address);

  // Log audit entry
  await auditLog.logAudit(
    recordId,
    "grant_access",
    JSON.stringify({ receiver: user1.address, level: "Read" })
  );

  // Example: Check access
  console.log("\n3. Checking access...");
  const hasAccess = await accessControl.hasAccess(recordId, user1.address);
  console.log("✓ User1 has access:", hasAccess);

  // Example: Get access details
  console.log("\n4. Getting access details...");
  const accessDetails = await accessControl.getAccess(recordId, user1.address);
  console.log("✓ Access details:", {
    granter: accessDetails[0],
    level: accessDetails[1],
    expiresAt: accessDetails[2].toString(),
    isActive: accessDetails[3],
    grantedAt: accessDetails[4].toString(),
  });

  // Example: Revoke access
  console.log("\n5. Revoking access...");
  const revokeTx = await accessControl.revokeAccess(recordId, user1.address);
  await revokeTx.wait();
  console.log("✓ Access revoked");

  // Log audit entry
  await auditLog.logAudit(
    recordId,
    "revoke_access",
    JSON.stringify({ receiver: user1.address })
  );

  // Example: Verify access revoked
  const hasAccessAfterRevoke = await accessControl.hasAccess(recordId, user1.address);
  console.log("✓ User1 has access after revoke:", hasAccessAfterRevoke);

  // Example: Get audit trail
  console.log("\n6. Getting audit trail...");
  const auditCount = await auditLog.getAuditCount();
  console.log("✓ Total audit entries:", auditCount.toString());

  const recordAudits = await auditLog.getRecordAudits(recordId);
  console.log("✓ Audit entries for record:", recordAudits.length);

  console.log("\n✅ Interaction completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
