import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, bsc, bscTestnet, arbitrum } from 'wagmi/chains'
import { coinbaseWallet, injected, walletConnect, metaMask } from 'wagmi/connectors'
import { goodNetTestnet } from './config/chains'

export const config = createConfig({
  chains: [mainnet, sepolia, bsc, bscTestnet, arbitrum, goodNetTestnet],
  connectors: [
    injected(),
    coinbaseWallet(),
    walletConnect({ projectId: import.meta.env.VITE_WC_PROJECT_ID }),
    metaMask(),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
    [arbitrum.id]: http(),
    [goodNetTestnet.id]: http('https://testnet-scan.dexgood.com/rpc'),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
