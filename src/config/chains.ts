import { Chain } from 'wagmi/chains';
import { sepolia, mainnet, arbitrum } from 'wagmi/chains';

// Environment variables
const L1_CHAIN_ID = parseInt(import.meta.env.VITE_L1_CHAIN_ID || '11155111');
const L1_NAME = import.meta.env.VITE_L1_NAME || 'Ethereum Sepolia';
const L1_COIN_SYMBOL = import.meta.env.VITE_L1_COIN_SYMBOL || 'ETH';
const L1_RPC_URL = import.meta.env.VITE_L1_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
const L1_EXPLORER_URL = import.meta.env.VITE_L1_EXPLORER_URL || 'https://sepolia.etherscan.io';

const L2_CHAIN_ID = parseInt(import.meta.env.VITE_L2_CHAIN_ID || '98765432103');
const L2_NAME = import.meta.env.VITE_L2_NAME || 'Dexgood Testnet';
const L2_COIN_SYMBOL = import.meta.env.VITE_L2_COIN_SYMBOL || 'TDXG';
const L2_RPC_URL = import.meta.env.VITE_L2_RPC_URL || 'https://testnet-scan.dexgood.com/rpc';
const L2_EXPLORER_URL = import.meta.env.VITE_L2_EXPLORER_URL || 'https://testnet-scan.dexgood.com';

// L1 Chain from environment
export const l1Chain: Chain = L1_CHAIN_ID === sepolia.id ? sepolia : L1_CHAIN_ID === mainnet.id ? mainnet : {
  id: L1_CHAIN_ID,
  name: L1_NAME,
  nativeCurrency: {
    name: L1_COIN_SYMBOL,
    symbol: L1_COIN_SYMBOL,
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [L1_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: `${L1_NAME} Explorer`,
      url: L1_EXPLORER_URL,
    },
  },
  testnet: L1_CHAIN_ID !== mainnet.id,
};

// L2 Chain from environment
export const l2Chain: Chain = {
  id: L2_CHAIN_ID,
  name: L2_NAME,
  nativeCurrency: {
    name: L2_COIN_SYMBOL,
    symbol: L2_COIN_SYMBOL,
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [L2_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: `${L2_NAME} Explorer`,
      url: L2_EXPLORER_URL,
    },
  },
  testnet: true,
};

// Legacy export for backward compatibility
export const goodNetTestnet = l2Chain;

// Bridge configuration from environment
export const BRIDGE_CONFIG = {
  L1_CHAIN: l1Chain,
  L2_CHAIN: l2Chain,
  L1_TOKEN_SYMBOL: L1_COIN_SYMBOL,
  L2_TOKEN_SYMBOL: L2_COIN_SYMBOL,
  NATIVE_CURRENCY: L1_COIN_SYMBOL,
};

// Current active configuration (now directly from env)
export const ACTIVE_BRIDGE_CONFIG = BRIDGE_CONFIG;

// Helper functions
export const getL1Chain = (): Chain => ACTIVE_BRIDGE_CONFIG.L1_CHAIN;
export const getL2Chain = (): Chain => ACTIVE_BRIDGE_CONFIG.L2_CHAIN;
export const getL1TokenSymbol = (): string => ACTIVE_BRIDGE_CONFIG.L1_TOKEN_SYMBOL;
export const getL2TokenSymbol = (): string => ACTIVE_BRIDGE_CONFIG.L2_TOKEN_SYMBOL;
export const getNativeCurrency = (): string => ACTIVE_BRIDGE_CONFIG.NATIVE_CURRENCY;

// Chain display configurations (dynamic based on env)
export const CHAIN_CONFIG = {
  [L1_CHAIN_ID]: {
    name: L1_NAME,
    shortName: L1_NAME.split(' ')[0], // First word
    icon: L1_COIN_SYMBOL.charAt(0), // First letter of symbol
    color: '#627EEA',
    bgColor: 'bg-blue-500',
  },
  [L2_CHAIN_ID]: {
    name: L2_NAME,
    shortName: L2_NAME.split(' ')[0], // First word
    icon: L2_COIN_SYMBOL.charAt(0), // First letter of symbol
    color: '#FF6600',
    bgColor: 'bg-orange-500',
  },
  // Fallback for well-known chains
  [mainnet.id]: {
    name: 'Ethereum',
    shortName: 'Ethereum',
    icon: 'E',
    color: '#627EEA',
    bgColor: 'bg-blue-500',
  },
  [arbitrum.id]: {
    name: 'Arbitrum One',
    shortName: 'Arbitrum',
    icon: 'A',
    color: '#2D374B',
    bgColor: 'bg-blue-400',
  },
};

// Get chain configuration
export const getChainConfig = (chainId: number) => {
  return CHAIN_CONFIG[chainId] || {
    name: 'Unknown',
    shortName: 'Unknown',
    icon: '?',
    color: '#6B7280',
    bgColor: 'bg-gray-500',
  };
};

// Validate if chains are properly configured
export const validateBridgeConfig = () => {
  const l1Chain = getL1Chain();
  const l2Chain = getL2Chain();
  
  if (!l1Chain || !l2Chain) {
    throw new Error('Bridge chains are not properly configured');
  }
  
  if (l1Chain.id === l2Chain.id) {
    throw new Error('L1 and L2 chains cannot be the same');
  }
  
  return { l1Chain, l2Chain };
};