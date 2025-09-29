'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { defineChain } from 'viem';
import { RainbowKitProvider, getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

// 1. Flare Coston2 테스트넷 정의
const coston2 = defineChain({
  id: 114,
  name: 'Flare Testnet Coston2',
  nativeCurrency: {
    decimals: 18,
    name: 'Coston2 Flare',
    symbol: 'C2FLR',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL_SEPOLIA || 'https://coston2-api.flare.network/ext/C/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Coston2 Explorer',
      url: 'https://coston2-explorer.flare.network',
    },
  },
  testnet: true,
});

// 2. RainbowKit에서 기본 지갑 가져오기
const { wallets } = getDefaultWallets();

// 3. 커넥터 설정
const connectors = connectorsForWallets(
  [
    ...wallets,
  ],
  {
    appName: 'MiniAMM DeFi App',
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  }
);

// 4. Wagmi 설정 (Coston2만 사용)
const config = createConfig({
  connectors,
  chains: [coston2],
  transports: {
    [coston2.id]: http(),
  },
});

// 5. React Query 클라이언트
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          coolMode
          modalSize="compact"
          showRecentTransactions={true}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
