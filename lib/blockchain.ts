import { ethers } from "ethers";

// Contract ABIs and addresses will be loaded from deployment.json
let accessControlContract: ethers.Contract | null = null;
let auditLogContract: ethers.Contract | null = null;
let provider: ethers.JsonRpcProvider | null = null;
let signer: ethers.JsonRpcSigner | null = null;

/**
 * Initialize blockchain connection
 */
export async function initBlockchain() {
  try {
    // Connect to local Hardhat node
    provider = new ethers.JsonRpcProvider("http://localhost:8545");
    
    // Get signer (you might want to use MetaMask in production)
    signer = await provider.getSigner();
    
    // Load deployment info
    const deployment = await import("../deployment.json");
    
    // Initialize contracts
    const { MediFlowAccessControl, MediFlowAuditLog } = await import(
      "./contracts/MediFlowAccessControl.json"
    );
    
    accessControlContract = new ethers.Contract(
      deployment.contracts.MediFlowAccessControl,
      JSON.parse(MediFlowAccessControl.abi),
      signer
    );
    
    const auditLogAbi = await import("./contracts/MediFlowAuditLog.json");
    auditLogContract = new ethers.Contract(
      deployment.contracts.MediFlowAuditLog,
      JSON.parse(auditLogAbi.default.abi),
      signer
    );
    
    return { provider, signer, accessControlContract, auditLogContract };
  } catch (error) {
    console.error("Failed to initialize blockchain:", error);
    throw error;
  }
}

/**
 * Register a record on blockchain
 */
export async function registerRecordOnChain(
  recordId: string,
  ipfsHash: string
): Promise<string> {
  if (!accessControlContract) {
    await initBlockchain();
  }
  
  const tx = await accessControlContract!.registerRecord(recordId, ipfsHash);
  const receipt = await tx.wait();
  
  return receipt.hash;
}

/**
 * Grant access on blockchain
 */
export async function grantAccessOnChain(
  recordId: string,
  receiverAddress: string,
  accessLevel: number,
  expiresAt: number = 0
): Promise<string> {
  if (!accessControlContract) {
    await initBlockchain();
  }
  
  const tx = await accessControlContract!.grantAccess(
    recordId,
    receiverAddress,
    accessLevel,
    expiresAt
  );
  const receipt = await tx.wait();
  
  return receipt.hash;
}

/**
 * Revoke access on blockchain
 */
export async function revokeAccessOnChain(
  recordId: string,
  receiverAddress: string
): Promise<string> {
  if (!accessControlContract) {
    await initBlockchain();
  }
  
  const tx = await accessControlContract!.revokeAccess(
    recordId,
    receiverAddress
  );
  const receipt = await tx.wait();
  
  return receipt.hash;
}

/**
 * Check if address has access
 */
export async function checkAccessOnChain(
  recordId: string,
  userAddress: string
): Promise<boolean> {
  if (!accessControlContract) {
    await initBlockchain();
  }
  
  return await accessControlContract!.hasAccess(recordId, userAddress);
}

/**
 * Log audit entry on blockchain
 */
export async function logAuditOnChain(
  recordId: string,
  action: string,
  metadata: string
): Promise<string> {
  if (!auditLogContract) {
    await initBlockchain();
  }
  
  const tx = await auditLogContract!.logAudit(recordId, action, metadata);
  const receipt = await tx.wait();
  
  return receipt.hash;
}

/**
 * Get audit trail for a record
 */
export async function getAuditTrail(recordId: string): Promise<any[]> {
  if (!auditLogContract) {
    await initBlockchain();
  }
  
  const indices = await auditLogContract!.getRecordAudits(recordId);
  const entries = [];
  
  for (const index of indices) {
    const entry = await auditLogContract!.getAuditEntry(index);
    entries.push({
      recordId: entry[0],
      user: entry[1],
      action: entry[2],
      timestamp: Number(entry[3]),
      metadata: entry[4],
      previousHash: entry[5],
    });
  }
  
  return entries;
}

/**
 * Get blockchain provider
 */
export function getProvider() {
  return provider;
}

/**
 * Get signer
 */
export function getSigner() {
  return signer;
}
