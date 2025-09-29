'use client';

import { useTokenBalance } from '@/hooks/useBalances';
import { formatTokenAmount } from '@/utils/format';

interface TokenBalanceProps {
  tokenAddress: string;
  userAddress: string;
  symbol: string;
}

export default function TokenBalance({ tokenAddress, userAddress, symbol }: TokenBalanceProps) {
  const { balance, isLoading, error } = useTokenBalance(tokenAddress, userAddress);

  const Skeleton = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">{symbol} Balance</h3>
      <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
        {isLoading ? (
          <div className="animate-pulse h-8 w-36 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ) : error ? (
          <span className="text-red-500 text-sm">Error</span>
        ) : (
          <span>{formatTokenAmount(balance, 18, 4)}</span>
        )}
      </div>
    </div>
  );
}
