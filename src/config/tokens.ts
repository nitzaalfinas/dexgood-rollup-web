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

// Define available tokens
export const BRIDGE_TOKENS: BridgeToken[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    icon: 'Ⓔ',
    decimals: 18,
    isNative: true,
    addresses: {
      // Native tokens don't have contract addresses
    },
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    icon: '₮',
    decimals: 6,
    isNative: false,
    addresses: {
      11155111: '0x7169D38820dfd117C3FA1f22a697dba58d90BA06', // Sepolia USDT
    },
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    icon: '◉',
    decimals: 6,
    isNative: false,
    addresses: {
      11155111: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC
    },
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    icon: '🔷',
    decimals: 18,
    isNative: false,
    addresses: {
      11155111: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // Sepolia WETH
    },
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    icon: '◈',
    decimals: 18,
    isNative: false,
    addresses: {
      11155111: '0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844', // Sepolia DAI
    },
  },
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