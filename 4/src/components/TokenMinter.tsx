'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseTokenAmount } from '@/utils/format';
import { MockERC20__factory } from '@/types/ethers-contracts';
import toast from 'react-hot-toast';
import { emitRefresh } from '@/utils/refreshBus';

interface TokenMinterProps {
  tokenAddress: string;
  symbol: string;
}

export default function TokenMinter({ tokenAddress, symbol }: TokenMinterProps) {
  const [amount, setAmount] = useState('');
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const resolveErrorMessage = (err: unknown): string => {
    if (typeof err === 'object' && err !== null) {
      const withShortMessage = err as { shortMessage?: unknown };
      const withMessage = err as { message?: unknown };
      if (typeof withShortMessage.shortMessage === 'string' && withShortMessage.shortMessage.length > 0) {
        return withShortMessage.shortMessage;
      }
      if (typeof withMessage.message === 'string' && withMessage.message.length > 0) {
        return withMessage.message;
      }
    }
    return 'An unknown error occurred.';
  };

  const handleMint = async () => {
    if (!amount) return;
    const amountWei = parseTokenAmount(amount, 18);
    
    writeContract({
      address: tokenAddress as `0x${string}`,
      abi: MockERC20__factory.abi,
      functionName: 'freeMintToSender',
      args: [amountWei],
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    });

  useEffect(() => {
    if (isConfirmed) {
      toast.success('Mint successful!');
      setAmount('');
      emitRefresh('balances');
    }
    if (error) {
      toast.error(resolveErrorMessage(error));
    }
  }, [isConfirmed, error]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
        Mint {symbol} Tokens
      </h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Amount to Mint
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={isPending || isConfirming}
          />
        </div>

        <button
          onClick={handleMint}
          disabled={!amount || isPending || isConfirming}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isPending || isConfirming ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Minting...
            </span>
          ) : (
            `Mint ${amount || '0'} ${symbol}`
          )}
        </button>
      </div>
    </div>
  );
}
