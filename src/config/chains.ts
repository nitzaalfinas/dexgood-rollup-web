import { Chain } from 'wagmi/chains';
import { sepolia, mainnet, arbitrum } from 'wagmi/chains';

// GoodNet Testnet chain definition
export const goodNetTestnet: Chain = {
  id: 98765432103,
  name: 'GoodNet Testnet',
  nativeCurrency: {
    name: 'TDXG',
    symbol: 'TDXG',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-scan.dexgood.com/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'GoodNet Testnet Explorer',
      url: 'https://testnet-scan.dexgood.com',
    },
  },
  testnet: true,
};

// Environment detection (commented out for now)
// const isProduction = import.meta.env.VITE_ENVIRONMENT === 'production';
const isDevelopment = import.meta.env.VITE_ENVIRONMENT === 'development' || !import.meta.env.VITE_ENVIRONMENT;

// Bridge chain configurations
export const BRIDGE_CONFIG = {
  development: {
    L1_CHAIN: sepolia,
    L2_CHAIN: goodNetTestnet,
    L1_TOKEN_SYMBOL: 'SepoliaETH',
    L2_TOKEN_SYMBOL: 'TDXG',
    NATIVE_CURRENCY: 'ETH', // What users see as the token being bridged
  },
  production: {
    L1_CHAIN: mainnet,
    L2_CHAIN: arbitrum, // You can replace this with your production L2 chain
    L1_TOKEN_SYMBOL: 'ETH',
    L2_TOKEN_SYMBOL: 'ETH',
    NATIVE_CURRENCY: 'ETH',
  }
};

// Current active configuration
export const ACTIVE_BRIDGE_CONFIG = isDevelopment 
  ? BRIDGE_CONFIG.development 
  : BRIDGE_CONFIG.production;

// Helper functions
export const getL1Chain = (): Chain => ACTIVE_BRIDGE_CONFIG.L1_CHAIN;
export const getL2Chain = (): Chain => ACTIVE_BRIDGE_CONFIG.L2_CHAIN;
export const getL1TokenSymbol = (): string => ACTIVE_BRIDGE_CONFIG.L1_TOKEN_SYMBOL;
export const getL2TokenSymbol = (): string => ACTIVE_BRIDGE_CONFIG.L2_TOKEN_SYMBOL;
export const getNativeCurrency = (): string => ACTIVE_BRIDGE_CONFIG.NATIVE_CURRENCY;

// Chain display configurations
export const CHAIN_CONFIG = {
  [sepolia.id]: {
    name: 'Sepolia',
    shortName: 'Sepolia',
    icon: 'E', // Ethereum-like
    color: '#627EEA',
    bgColor: 'bg-blue-500',
  },
  [goodNetTestnet.id]: {
    name: 'GoodNet Testnet',
    shortName: 'GoodNet',
    icon: 'G',
    color: '#FF6600',
    bgColor: 'bg-orange-500',
  },
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