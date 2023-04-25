import "../styles/global.css"
import "@rainbow-me/rainbowkit/styles.css"
import type { AppProps } from "next/app"

import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit"
import { argentWallet, trustWallet } from "@rainbow-me/rainbowkit/wallets"
import { magicConnectConnector } from "../connector/magicConnect"

import { createClient, configureChains, WagmiConfig } from "wagmi"
import { sepolia, goerli, polygonMumbai, optimismGoerli } from "wagmi/chains"
import { jsonRpcProvider } from "wagmi/providers/jsonRpc"

type ChainIdToRpcUrl = {
  [key: number]: string
}

// Custom RPC Endpoints
const chainIdToRpcUrl: ChainIdToRpcUrl = {
  11155111: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL!,
  420: process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL!,
  80001: process.env.NEXT_PUBLIC_POLYGON_RPC_URL!,
  5: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL!,
}

// Configure chains, providers, and webSocketProvider
const { chains, provider, webSocketProvider } = configureChains(
  [sepolia, goerli, polygonMumbai, optimismGoerli],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: chainIdToRpcUrl[chain.id],
      }),
    }),
  ]
)

// Rainbowkit default wallets
const { wallets } = getDefaultWallets({
  appName: "RainbowKit Mint NFT Demo",
  chains,
})

const demoAppInfo = {
  appName: "RainbowKit Mint NFT Demo",
}

// Create connectors for wallets
// Include Magic Connect to the list of wallets to display in wallet selector modal
const connectors = connectorsForWallets([
  {
    groupName: "Magic",
    wallets: [magicConnectConnector({ chains })],
  },
  ...wallets,
  {
    groupName: "Other",
    wallets: [argentWallet({ chains }), trustWallet({ chains })],
  },
])

// Create the Wagmi client
const wagmiClient = createClient({
  autoConnect: true, // autoconnect not working correctly with Magic Connect
  connectors,
  provider,
  webSocketProvider,
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider appInfo={demoAppInfo} chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

export default MyApp
