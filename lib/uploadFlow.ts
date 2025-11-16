/**
 * Example: Complete Upload Flow
 * Convert to FHIR → Upload to IPFS → Register on Blockchain
 */

import { convertTextToFhir } from './convertPdfToFhir';
import { uploadToIPFS } from './ipfs';
import { ethers } from 'ethers';

// Import smart contract ABIs
import MediFlowAccessControlABI from './abis/MediFlowAccessControl.json';
import MediFlowAuditLogABI from './abis/MediFlowAuditLog.json';

// Smart contract addresses (from deployment)
const ACCESS_CONTROL_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const AUDIT_LOG_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

export interface UploadResult {
  success: boolean;
  recordId: string;
  ipfsHash: string;
  ipfsUrl: string;
  transactionHash: string;
  message: string;
}

/**
 * Complete upload flow: Text → FHIR → IPFS → Blockchain
 */
export async function uploadHealthRecord(
  clinicalText: string,
  patientName: string,
  walletAddress: string
): Promise<UploadResult> {
  try {
    // Step 1: Convert text to FHIR JSON
    console.log('Step 1: Converting to FHIR...');
    const result = await convertTextToFhir(clinicalText);
    const fhirData = result.fhirData;
    
    // Step 2: Upload FHIR JSON to IPFS
    console.log('Step 2: Uploading to IPFS...');
    const ipfsResult = await uploadToIPFS(fhirData);
    console.log('IPFS Hash:', ipfsResult.hash);
    console.log('IPFS URL:', ipfsResult.url);

    // Step 3: Register record on blockchain
    console.log('Step 3: Registering on blockchain...');
    
    // Connect to wallet
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Connect to smart contract
    const accessControl = new ethers.Contract(
      ACCESS_CONTROL_ADDRESS,
      MediFlowAccessControlABI,
      signer
    );

    const auditLog = new ethers.Contract(
      AUDIT_LOG_ADDRESS,
      MediFlowAuditLogABI,
      signer
    );

    // Generate unique record ID
    const recordId = ethers.id(`${walletAddress}-${Date.now()}`);

    // Register record on AccessControl contract
    const registerTx = await accessControl.registerRecord(recordId, ipfsResult.hash);
    console.log('Transaction sent:', registerTx.hash);
    
    const receipt = await registerTx.wait();
    console.log('Transaction confirmed:', receipt.hash);

    // Log audit entry
    const auditTx = await auditLog.logAudit(
      recordId,
      'UPLOAD',
      JSON.stringify({
        fileName: 'Clinical Note',
        fileSize: ipfsResult.size,
        timestamp: new Date().toISOString(),
      })
    );
    await auditTx.wait();

    // Step 4: Save to localStorage for quick access
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const records = JSON.parse(localStorage.getItem(`records_${user.walletAddress}`) || '[]');
    
    records.push({
      id: recordId,
      fileName: 'Clinical Note',
      resourceType: 'DocumentReference',
      ipfsHash: ipfsResult.hash,
      ipfsUrl: ipfsResult.url,
      createdAt: new Date().toISOString(),
      fileSize: ipfsResult.size,
      transactionHash: receipt.hash,
    });

    localStorage.setItem(`records_${user.walletAddress}`, JSON.stringify(records));

    return {
      success: true,
      recordId,
      ipfsHash: ipfsResult.hash,
      ipfsUrl: ipfsResult.url,
      transactionHash: receipt.hash,
      message: 'Record uploaded successfully!',
    };

  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

/**
 * Upload file (PDF/Image) to IPFS and register on blockchain
 */
export async function uploadFileRecord(
  file: File,
  walletAddress: string
): Promise<UploadResult> {
  try {
    console.log('Uploading file:', file.name);

    // Step 1: Read file and convert to FHIR
    const text = await file.text();
    const result = await convertTextToFhir(text);
    const fhirData = result.fhirData;

    // Step 2: Upload to IPFS
    const ipfsResult = await uploadToIPFS(fhirData);

    // Step 3: Register on blockchain (same as above)
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const accessControl = new ethers.Contract(
      ACCESS_CONTROL_ADDRESS,
      MediFlowAccessControlABI,
      signer
    );

    const recordId = ethers.id(`${walletAddress}-${Date.now()}`);
    const registerTx = await accessControl.registerRecord(recordId, ipfsResult.hash);
    const receipt = await registerTx.wait();

    // Step 4: Save to localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const records = JSON.parse(localStorage.getItem(`records_${user.walletAddress}`) || '[]');
    
    records.push({
      id: recordId,
      fileName: file.name,
      resourceType: 'DocumentReference',
      ipfsHash: ipfsResult.hash,
      ipfsUrl: ipfsResult.url,
      createdAt: new Date().toISOString(),
      fileSize: file.size,
      transactionHash: receipt.hash,
    });

    localStorage.setItem(`records_${user.walletAddress}`, JSON.stringify(records));

    return {
      success: true,
      recordId,
      ipfsHash: ipfsResult.hash,
      ipfsUrl: ipfsResult.url,
      transactionHash: receipt.hash,
      message: 'File uploaded successfully!',
    };

  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
}
