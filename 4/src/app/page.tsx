'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import WalletConnection from '@/components/WalletConnection';
import TokenBalance from '@/components/TokenBalance';
import TokenMinter from '@/components/TokenMinter';
import TokenApproval from '@/components/TokenApproval';
import Swap from '@/components/Swap';
import AddLiquidity from '@/components/AddLiquidity';
import RemoveLiquidity from '@/components/RemoveLiquidity';
import { CONTRACTS } from '@/utils/constants';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const tokens = [
    { symbol: 'TokenA', address: CONTRACTS.TOKEN_X },
    { symbol: 'TokenB', address: CONTRACTS.TOKEN_Y },
  ];

  const WelcomeMessage = () => (
    <div className="flex flex-col items-center justify-center mt-32">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Welcome to MiniAMM DeFi!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Connect your wallet to swap tokens and manage liquidity.
        </p>
        <div className="flex justify-center">
          <WalletConnection />
        </div>
      </div>
    </div>
  );

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <header className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              🔄 MiniAMM DeFi
            </h1>
            <WalletConnection />
          </div>
        </header>
        <main className="max-w-7xl mx-auto p-6">
          <WelcomeMessage />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🔄 MiniAMM DeFi
          </h1>
          <WalletConnection />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {isConnected && address ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
            {/* Left Column: Core Actions */}
            <div className="space-y-8">
              <section>
                <Swap />
              </section>
              <section>
                <AddLiquidity />
              </section>
              <section>
                <RemoveLiquidity />
              </section>
            </div>

            {/* Right Column: Balances and Token Management */}
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">💰 My Balances</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {tokens.map(token => (
                    <TokenBalance 
                      key={token.symbol}
                      tokenAddress={token.address!}
                      userAddress={address}
                      symbol={token.symbol}
                    />
                  ))}
                  <TokenBalance 
                    key="LP Token"
                    tokenAddress={CONTRACTS.MINI_AMM!}
                    userAddress={address}
                    symbol="LP Token"
                  />
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">🛠️ Token Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {tokens.map(token => (
                    <div key={token.symbol} className="space-y-6 bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-md">
                      <TokenMinter 
                        tokenAddress={token.address!}
                        symbol={token.symbol}
                      />
                      <TokenApproval
                        tokenAddress={token.address!}
                        symbol={token.symbol}
                        spenderAddress={CONTRACTS.MINI_AMM!}
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <WelcomeMessage />
        )}
      </main>
    </div>
  );
}
