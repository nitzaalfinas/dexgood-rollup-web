import { getL1Chain, getL2Chain } from './chains';

export const bridgeConfig = {
  chains: {
    from: getL1Chain(),
    to: getL2Chain()
  },
  contracts: {
    l1Bridge: import.meta.env.VITE_L1_BRIDGE_CONTRACT || '',
    l2Bridge: import.meta.env.VITE_L2_BRIDGE_CONTRACT || '',
  },
  rpc: {
    l1: import.meta.env.VITE_L1_RPC_URL || '',
    l2: import.meta.env.VITE_L2_RPC_URL || '',
  },
  explorers: {
    l1: import.meta.env.VITE_L1_EXPLORER_URL || '',
    l2: import.meta.env.VITE_L2_EXPLORER_URL || '',
  },
  fees: {
    baseFee: '0.001',
    percentageFee: 0.1,
  }
};