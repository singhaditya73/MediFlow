/**
 * Wallet utility functions for MetaMask connection and network management
 */

export const LOCALHOST_CHAIN_ID = '0x7A69'; // 31337 in hex (Anvil default)
export const LOCALHOST_RPC_URL = 'http://127.0.0.1:8545';

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.ethereum?.isMetaMask);
}

/**
 * Check if any Ethereum wallet is installed
 */
export function isEthereumWalletInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.ethereum);
}

/**
 * Get the current connected wallet address
 */
export async function getCurrentAccount(): Promise<string | null> {
  if (!window.ethereum) return null;
  
  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });
    return accounts[0] || null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
}

/**
 * Request account access from MetaMask
 */
export async function requestAccounts(): Promise<string[]> {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  return accounts;
}

/**
 * Switch to the localhost Ethereum network
 */
export async function switchToLocalNetwork(): Promise<void> {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: LOCALHOST_CHAIN_ID }],
    });
  } catch (switchError: unknown) {
    // This error code indicates that the chain has not been added to MetaMask
    const error = switchError as { code?: number };
    if (error.code === 4902) {
      await addLocalNetwork();
    } else {
      throw switchError;
    }
  }
}

/**
 * Add localhost network to MetaMask
 */
export async function addLocalNetwork(): Promise<void> {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: LOCALHOST_CHAIN_ID,
        chainName: 'Localhost 8545',
        rpcUrls: [LOCALHOST_RPC_URL],
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
        },
      },
    ],
  });
}

/**
 * Sign a message with MetaMask
 */
export async function signMessage(
  message: string,
  address: string
): Promise<string> {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  const signature = await window.ethereum.request({
    method: 'personal_sign',
    params: [message, address],
  });

  return signature;
}

/**
 * Get the current network chain ID
 */
export async function getCurrentChainId(): Promise<string> {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  const chainId = await window.ethereum.request({
    method: 'eth_chainId',
  });

  return chainId;
}

/**
 * Listen for account changes
 */
export function onAccountsChanged(callback: (accounts: string[]) => void): void {
  if (!window.ethereum?.on) return;
  
  window.ethereum.on('accountsChanged', callback);
}

/**
 * Listen for network changes
 */
export function onChainChanged(callback: (chainId: string) => void): void {
  if (!window.ethereum?.on) return;
  
  window.ethereum.on('chainChanged', callback);
}

/**
 * Remove account change listener
 */
export function removeAccountsChangedListener(callback: (accounts: string[]) => void): void {
  if (!window.ethereum?.removeListener) return;
  
  window.ethereum.removeListener('accountsChanged', callback);
}

/**
 * Remove chain change listener
 */
export function removeChainChangedListener(callback: (chainId: string) => void): void {
  if (!window.ethereum?.removeListener) return;
  
  window.ethereum.removeListener('chainChanged', callback);
}

/**
 * Format wallet address for display (0x1234...5678)
 */
export function formatAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address) return '';
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Check if the user is on the correct network
 */
export async function isOnLocalNetwork(): Promise<boolean> {
  try {
    const chainId = await getCurrentChainId();
    return chainId === LOCALHOST_CHAIN_ID;
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
}
