export interface BridgeToken {
  symbol: string;
  name: string;
  icon: string;
  decimals: number;
  isNative: boolean;
  addresses: {
    [chainId: number]: string;
  };
}

// Get chain IDs from environment
const L1_CHAIN_ID = parseInt(import.meta.env.VITE_L1_CHAIN_ID || '11155111');
const L2_CHAIN_ID = parseInt(import.meta.env.VITE_L2_CHAIN_ID || '98765432103');
const L1_COIN_SYMBOL = import.meta.env.VITE_L1_COIN_SYMBOL || 'ETH';
const L2_COIN_SYMBOL = import.meta.env.VITE_L2_COIN_SYMBOL || 'TDXG';

// Define available tokens (dynamic based on environment)
export const BRIDGE_TOKENS: BridgeToken[] = [
  {
    symbol: L1_COIN_SYMBOL,
    name: L1_COIN_SYMBOL === 'ETH' ? 'Ethereum' : L1_COIN_SYMBOL,
    icon: L1_COIN_SYMBOL === 'ETH' ? 'Ⓔ' : '💎',
    decimals: 18,
    isNative: true,
    addresses: {
      // Native tokens don't have contract addresses
    },
  },
  // Add wrapped version of L2 native token if different from L1
  ...(L2_COIN_SYMBOL !== L1_COIN_SYMBOL ? [{
    symbol: L2_COIN_SYMBOL,
    name: L2_COIN_SYMBOL,
    icon: '🪙',
    decimals: 18,
    isNative: false,
    addresses: {
      [L2_CHAIN_ID]: '0x0000000000000000000000000000000000000000', // Placeholder
    },
  }] : []),
  // Common ERC-20 tokens (only on Sepolia for now)
  ...(L1_CHAIN_ID === 11155111 ? [
    {
      symbol: 'USDT',
      name: 'Tether USD',
      icon: '₮',
      decimals: 6,
      isNative: false,
      addresses: {
        [L1_CHAIN_ID]: '0x7169D38820dfd117C3FA1f22a697dba58d90BA06',
      },
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      icon: '◉',
      decimals: 6,
      isNative: false,
      addresses: {
        [L1_CHAIN_ID]: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      },
    },
    {
      symbol: 'WETH',
      name: 'Wrapped Ethereum',
      icon: '🔷',
      decimals: 18,
      isNative: false,
      addresses: {
        [L1_CHAIN_ID]: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
      },
    },
    {
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      icon: '◈',
      decimals: 18,
      isNative: false,
      addresses: {
        [L1_CHAIN_ID]: '0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844',
      },
    },
  ] : []),
];

// Get tokens available for a specific chain
export const getAvailableTokensForChain = (chainId: number): BridgeToken[] => {
  return BRIDGE_TOKENS.filter(token => {
    // Native tokens are available on all chains
    if (token.isNative) return true;
    
    // ERC-20 tokens are available if they have an address on this chain
    return token.addresses[chainId] !== undefined;
  });
};

// Get native token for a specific chain
export const getNativeTokenForChain = (chainId: number): BridgeToken => {
  const nativeToken = BRIDGE_TOKENS.find(token => token.isNative);
  if (!nativeToken) {
    throw new Error('No native token found');
  }
  return nativeToken;
};

// Get token by symbol
export const getTokenBySymbol = (symbol: string): BridgeToken | undefined => {
  return BRIDGE_TOKENS.find(token => token.symbol === symbol);
};

// Get token address for a specific chain
export const getTokenAddress = (token: BridgeToken, chainId: number): string | undefined => {
  if (token.isNative) return undefined;
  return token.addresses[chainId];
};

// Check if token is available on a specific chain
export const isTokenAvailableOnChain = (token: BridgeToken, chainId: number): boolean => {
  if (token.isNative) return true;
  return token.addresses[chainId] !== undefined;
};