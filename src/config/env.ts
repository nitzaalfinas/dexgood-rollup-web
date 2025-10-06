// Environment configuration and validation
export interface EnvironmentConfig {
  // L1 Configuration
  L1_CHAIN_ID: number;
  L1_NAME: string;
  L1_COIN_SYMBOL: string;
  L1_BRIDGE_CONTRACT: string;
  L1_EXPLORER_URL: string;
  L1_RPC_URL: string;

  // L2 Configuration
  L2_CHAIN_ID: number;
  L2_NAME: string;
  L2_COIN_SYMBOL: string;
  L2_BRIDGE_CONTRACT: string;
  L2_EXPLORER_URL: string;
  L2_RPC_URL: string;

  // Other Configuration
  WC_PROJECT_ID: string;
  DOMAIN_EVM: string;
  ENVIRONMENT: string;
}

// Get environment configuration with validation
export const getEnvironmentConfig = (): EnvironmentConfig => {
  // Use proxy URL for development to avoid CORS issues
  const isDevelopment = import.meta.env.DEV;
  const baseL2RpcUrl = import.meta.env.VITE_L2_RPC_URL || 'https://testnet-scan.dexgood.com/rpc';
  const developmentL2RpcUrl = isDevelopment ? 
    `${window.location.origin}/api/rpc` : 
    baseL2RpcUrl;

  const config: EnvironmentConfig = {
    // L1 Configuration
    L1_CHAIN_ID: parseInt(import.meta.env.VITE_L1_CHAIN_ID || '11155111'),
    L1_NAME: import.meta.env.VITE_L1_NAME || 'Ethereum Sepolia',
    L1_COIN_SYMBOL: import.meta.env.VITE_L1_COIN_SYMBOL || 'ETH',
    L1_BRIDGE_CONTRACT: import.meta.env.VITE_L1_BRIDGE_CONTRACT || '',
    L1_EXPLORER_URL: import.meta.env.VITE_L1_EXPLORER_URL || 'https://sepolia.etherscan.io',
    L1_RPC_URL: import.meta.env.VITE_L1_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',

    // L2 Configuration
    L2_CHAIN_ID: parseInt(import.meta.env.VITE_L2_CHAIN_ID || '98765432103'),
    L2_NAME: import.meta.env.VITE_L2_NAME || 'Dexgood Testnet',
    L2_COIN_SYMBOL: import.meta.env.VITE_L2_COIN_SYMBOL || 'TDXG',
    L2_BRIDGE_CONTRACT: import.meta.env.VITE_L2_BRIDGE_CONTRACT || '',
    L2_EXPLORER_URL: import.meta.env.VITE_L2_EXPLORER_URL || 'https://testnet-scan.dexgood.com',
    L2_RPC_URL: developmentL2RpcUrl,

    // Other Configuration
    WC_PROJECT_ID: import.meta.env.VITE_WC_PROJECT_ID || '',
    DOMAIN_EVM: import.meta.env.VITE_DOMAIN_EVI || 'http://localhost:3000',
    ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
  };

  // Log CORS workaround info
  if (isDevelopment && console) {
    console.log('🔧 Development mode: Using proxy URL for L2 RPC to avoid CORS');
    console.log('Original L2 RPC:', baseL2RpcUrl);
    console.log('Proxy L2 RPC:', developmentL2RpcUrl);
  }

  return config;
};

// Validate environment configuration
export const validateEnvironmentConfig = (): { isValid: boolean; errors: string[] } => {
  const config = getEnvironmentConfig();
  const errors: string[] = [];

  // Validate required fields
  if (!config.L1_BRIDGE_CONTRACT) {
    errors.push('VITE_L1_BRIDGE_CONTRACT is required');
  }
  if (!config.L2_BRIDGE_CONTRACT) {
    errors.push('VITE_L2_BRIDGE_CONTRACT is required');
  }
  if (!config.L1_RPC_URL) {
    errors.push('VITE_L1_RPC_URL is required');
  }
  if (!config.L2_RPC_URL) {
    errors.push('VITE_L2_RPC_URL is required');
  }

  // Validate chain IDs
  if (config.L1_CHAIN_ID === config.L2_CHAIN_ID) {
    errors.push('L1 and L2 chain IDs must be different');
  }
  if (isNaN(config.L1_CHAIN_ID) || config.L1_CHAIN_ID <= 0) {
    errors.push('Invalid L1 chain ID');
  }
  if (isNaN(config.L2_CHAIN_ID) || config.L2_CHAIN_ID <= 0) {
    errors.push('Invalid L2 chain ID');
  }

  // Validate URLs
  const urlPattern = /^https?:\/\/.+/;
  if (!urlPattern.test(config.L1_RPC_URL)) {
    errors.push('Invalid L1 RPC URL format');
  }
  if (!urlPattern.test(config.L2_RPC_URL)) {
    errors.push('Invalid L2 RPC URL format');
  }
  if (!urlPattern.test(config.L1_EXPLORER_URL)) {
    errors.push('Invalid L1 Explorer URL format');
  }
  if (!urlPattern.test(config.L2_EXPLORER_URL)) {
    errors.push('Invalid L2 Explorer URL format');
  }

  // Validate contract addresses
  const addressPattern = /^0x[a-fA-F0-9]{40}$/;
  if (!addressPattern.test(config.L1_BRIDGE_CONTRACT)) {
    errors.push('Invalid L1 bridge contract address format');
  }
  if (!addressPattern.test(config.L2_BRIDGE_CONTRACT)) {
    errors.push('Invalid L2 bridge contract address format');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Log environment configuration for debugging
export const logEnvironmentConfig = (): void => {
  const config = getEnvironmentConfig();
  const validation = validateEnvironmentConfig();

  console.group('🔧 Environment Configuration');
  console.log('Configuration:', config);
  console.log('Validation:', validation);
  
  if (!validation.isValid) {
    console.error('❌ Environment configuration errors:', validation.errors);
  } else {
    console.log('✅ Environment configuration is valid');
  }
  console.groupEnd();
};

// Export configuration instance
export const envConfig = getEnvironmentConfig();

// Legacy export
export const DOMAIN_EVM = envConfig.DOMAIN_EVM;