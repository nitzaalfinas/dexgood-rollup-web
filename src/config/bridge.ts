import { getL1Chain, getL2Chain } from './chains';

export const bridgeConfig = {
  chains: {
    from: getL1Chain(),
    to: getL2Chain()
  },
  contracts: {
    // Bridge contract addresses will be configured here
    l1Bridge: import.meta.env.VITE_L1_BRIDGE_CONTRACT || '',
    l2Bridge: import.meta.env.VITE_L2_BRIDGE_CONTRACT || '',
  },
  fees: {
    // Bridge fees configuration
    baseFee: '0.001', // ETH
    percentageFee: 0.1, // 0.1%
  }
};