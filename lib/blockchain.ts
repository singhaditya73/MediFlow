import { ethers } from "ethers";

// Contract ABIs and addresses will be loaded from networks.json
let accessControlContract: ethers.Contract | null = null;
let auditLogContract: ethers.Contract | null = null;
let provider: ethers.BrowserProvider | null = null;
let signer: ethers.JsonRpcSigner | null = null;

/**
 * Initialize blockchain connection with MetaMask
 */
export async function initBlockchain() {
  try {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      throw new Error("MetaMask not detected. Please install MetaMask to continue.");
    }

    // Connect to MetaMask
    provider = new ethers.BrowserProvider(window.ethereum);
    
    // Request account access
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    
    // Check network
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    console.log("Connected to network:", network.name, "Chain ID:", chainId);
    
    // Load network configurations
    const networks = await import("./networks.json");
    
    // Find the matching network configuration
    let networkConfig;
    if (chainId === 31337) {
      networkConfig = networks.localhost;
      console.log("🔧 Using Localhost network");
    } else if (chainId === 11155111) {
      networkConfig = networks.sepolia;
      console.log("🌐 Using Sepolia testnet");
    } else {
      throw new Error(
        `Unsupported network. Please connect MetaMask to:\n` +
        `• Localhost (Chain ID: 31337) for local testing, or\n` +
        `• Sepolia Testnet (Chain ID: 11155111) for testnet\n` +
        `Current Chain ID: ${chainId}`
      );
    }
    
    // Verify contracts are deployed
    if (networkConfig.contracts.MediFlowAccessControl.address === "UPDATE_AFTER_DEPLOYMENT") {
      throw new Error(
        `Contracts not deployed to ${networkConfig.network}. Please deploy first.`
      );
    }
    
    // Load contract ABIs
    const accessControlAbi = await import("./abis/MediFlowAccessControl.json");
    const auditLogAbi = await import("./abis/MediFlowAuditLog.json");
    
    const signerAddress = await signer.getAddress();
    console.log("✅ Connected with address:", signerAddress);
    console.log("📍 Access Control:", networkConfig.contracts.MediFlowAccessControl.address);
    console.log("📍 Audit Log:", networkConfig.contracts.MediFlowAuditLog.address);
    
    accessControlContract = new ethers.Contract(
      networkConfig.contracts.MediFlowAccessControl.address,
      accessControlAbi.default,
      signer
    );
    
    auditLogContract = new ethers.Contract(
      networkConfig.contracts.MediFlowAuditLog.address,
      auditLogAbi.default,
      signer
    );
    
    return { provider, signer, accessControlContract, auditLogContract };
  } catch (error) {
    console.error("❌ Failed to initialize blockchain:", error);
    throw error;
  }
}

/**
 * Register a record on blockchain
 */
export async function registerRecordOnChain(
  recordId: string,
  ipfsHash: string
): Promise<{
  transactionHash: string;
  gasUsed: string;
  blockNumber: number;
  blockHash: string;
  blockTime: string;
  timestamp: number;
}> {
  if (!accessControlContract) {
    await initBlockchain();
  }
  
  const tx = await accessControlContract!.registerRecord(recordId, ipfsHash);
  const receipt = await tx.wait();
  
  // Get block information
  const block = await provider!.getBlock(receipt.blockNumber);
  
  return {
    transactionHash: receipt.hash,
    gasUsed: receipt.gasUsed.toString(),
    blockNumber: receipt.blockNumber,
    blockHash: receipt.blockHash,
    blockTime: new Date(block!.timestamp * 1000).toLocaleString(),
    timestamp: block!.timestamp,
  };
}

/**
 * Grant access on blockchain
 */
export async function grantAccessOnChain(
  recordId: string,
  receiverAddress: string,
  accessLevel: number,
  expiresAt: number = 0
): Promise<{
  transactionHash: string;
  gasUsed: string;
  blockNumber: number;
  blockHash: string;
  blockTime: string;
  timestamp: number;
}> {
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
  
  // Get block information
  const block = await provider!.getBlock(receipt.blockNumber);
  
  return {
    transactionHash: receipt.hash,
    gasUsed: receipt.gasUsed.toString(),
    blockNumber: receipt.blockNumber,
    blockHash: receipt.blockHash,
    blockTime: new Date(block!.timestamp * 1000).toLocaleString(),
    timestamp: block!.timestamp,
  };
}

/**
 * Revoke access on blockchain
 */
export async function revokeAccessOnChain(
  recordId: string,
  receiverAddress: string
): Promise<{
  transactionHash: string;
  gasUsed: string;
  blockNumber: number;
  blockHash: string;
  blockTime: string;
  timestamp: number;
}> {
  if (!accessControlContract) {
    await initBlockchain();
  }
  
  const tx = await accessControlContract!.revokeAccess(
    recordId,
    receiverAddress
  );
  const receipt = await tx.wait();
  
  // Get block information
  const block = await provider!.getBlock(receipt.blockNumber);
  
  return {
    transactionHash: receipt.hash,
    gasUsed: receipt.gasUsed.toString(),
    blockNumber: receipt.blockNumber,
    blockHash: receipt.blockHash,
    blockTime: new Date(block!.timestamp * 1000).toLocaleString(),
    timestamp: block!.timestamp,
  };
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
): Promise<{
  transactionHash: string;
  gasUsed: string;
  blockNumber: number;
  blockHash: string;
  blockTime: string;
  timestamp: number;
}> {
  if (!auditLogContract) {
    await initBlockchain();
  }
  
  const tx = await auditLogContract!.logAudit(recordId, action, metadata);
  const receipt = await tx.wait();
  
  // Get block information
  const block = await provider!.getBlock(receipt.blockNumber);
  
  return {
    transactionHash: receipt.hash,
    gasUsed: receipt.gasUsed.toString(),
    blockNumber: receipt.blockNumber,
    blockHash: receipt.blockHash,
    blockTime: new Date(block!.timestamp * 1000).toLocaleString(),
    timestamp: block!.timestamp,
  };
}

/**
 * Get audit trail for a record
 */
export async function getAuditTrail(recordId: string): Promise<Array<{
  recordId: string;
  user: string;
  action: string;
  timestamp: number;
  metadata: string;
  previousHash: string;
}>> {
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
