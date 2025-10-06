import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, bsc, bscTestnet, arbitrum } from 'wagmi/chains'
import { coinbaseWallet, injected, walletConnect, metaMask } from 'wagmi/connectors'
import { l1Chain, l2Chain } from './config/chains'

// Get RPC URLs from environment with CORS proxy support
const L1_RPC_URL = import.meta.env.VITE_L1_RPC_URL || '';
const isDevelopment = import.meta.env.DEV;
const baseL2RpcUrl = import.meta.env.VITE_L2_RPC_URL || '';
const L2_RPC_URL = isDevelopment ? 
  `${window.location.origin}/api/rpc` : 
  baseL2RpcUrl;

// Debug configuration
console.group('🔧 Wagmi Configuration Debug');
console.log('L1 Chain:', l1Chain);
console.log('L2 Chain:', l2Chain);
console.log('L1 RPC URL:', L1_RPC_URL);
console.log('Original L2 RPC URL:', baseL2RpcUrl);
console.log('Effective L2 RPC URL:', L2_RPC_URL);
console.log('Development mode:', isDevelopment);
console.groupEnd();

export const config = createConfig({
  chains: [l1Chain, l2Chain, mainnet, sepolia, bsc, bscTestnet, arbitrum],
  connectors: [
    injected(),
    coinbaseWallet(),
    walletConnect({ projectId: import.meta.env.VITE_WC_PROJECT_ID }),
    metaMask(),
  ],
  transports: {
    [l1Chain.id]: http(L1_RPC_URL, {
      timeout: 10_000,
      retryCount: 3,
      retryDelay: 1000,
    }),
    [l2Chain.id]: http(L2_RPC_URL, {
      timeout: 10_000,
      retryCount: 3,
      retryDelay: 1000,
    }),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
    [arbitrum.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
