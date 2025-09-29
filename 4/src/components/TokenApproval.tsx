'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useTokenContract } from '@/hooks/useContracts';
import { useTransaction } from '@/hooks/useTransaction';
import { formatTokenAmount, parseTokenAmount } from '@/utils/format';
import { CONTRACTS } from '@/utils/constants';
import { ethers } from 'ethers';
import { subscribeRefresh } from '@/utils/refreshBus';

interface TokenApprovalProps {
  tokenAddress: string;
  spenderAddress?: string;
  symbol: string;
}

export default function TokenApproval({ 
  tokenAddress, 
  spenderAddress = CONTRACTS.MINI_AMM!,
  symbol 
}: TokenApprovalProps) {
  const { address: userAddress } = useAccount();
  const tokenContract = useTokenContract(tokenAddress);
  const { isLoading, isSuccess, execute, reset } = useTransaction();

  const [allowance, setAllowance] = useState<bigint>(0n);
  const [amount, setAmount] = useState('');
  const [isCheckingAllowance, setIsCheckingAllowance] = useState(false);

  const checkAllowance = useCallback(async () => {
    if (!tokenContract || !userAddress || !spenderAddress) return;
    setIsCheckingAllowance(true);
    try {
      const currentAllowance = await tokenContract.allowance(userAddress, spenderAddress);
      setAllowance(currentAllowance);
    } catch (err) {
      console.error('Failed to check allowance:', err);
    } finally {
      setIsCheckingAllowance(false);
    }
  }, [tokenContract, userAddress, spenderAddress]);

  useEffect(() => {
    checkAllowance();
    const interval = setInterval(checkAllowance, 10000);
    return () => clearInterval(interval);
  }, [checkAllowance]);

  useEffect(() => {
    return subscribeRefresh((topics) => {
      if (topics.includes('allowances') || topics.includes('all')) {
        checkAllowance();
      }
    });
  }, [checkAllowance]);

  useEffect(() => {
    if (isSuccess) {
      setAmount('');
      const timer = setTimeout(() => reset(), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, reset]);

  const handleApprove = async () => {
    if (!tokenContract || !userAddress || !amount) return;
    const amountWei = parseTokenAmount(amount, 18);
    try {
      await execute(
        () => tokenContract.approve(spenderAddress, amountWei),
        {
          refresh: ['allowances'],
          onSuccess: () => checkAllowance(),
        }
      );
    } catch (error) {
      console.error('Approve transaction failed', error);
    }
  };

  const handleMaxApprove = async () => {
    if (!tokenContract || !userAddress) return;
    try {
      await execute(
        () => tokenContract.approve(spenderAddress, ethers.MaxUint256),
        {
          refresh: ['allowances'],
          onSuccess: () => checkAllowance(),
        }
      );
    } catch (error) {
      console.error('Max approve transaction failed', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">{symbol} Token Approval</h3>
      
      <div className="space-y-3">
        <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
          <p className="text-sm text-gray-600 dark:text-gray-400">Current Allowance:</p>
          {isCheckingAllowance ? (
            <div className="animate-pulse bg-gray-200 dark:bg-gray-600 h-5 w-32 rounded mt-1"></div>
          ) : (
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatTokenAmount(allowance, 18, 4)} {symbol}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount to Approve</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleApprove}
            disabled={!tokenContract || !amount || isLoading || !userAddress}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isLoading ? 'Processing...' : 'Approve'}
          </button>
          
          <button
            onClick={handleMaxApprove}
            disabled={!tokenContract || isLoading || !userAddress}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isLoading ? 'Processing...' : 'Max Approve'}
          </button>
        </div>
      </div>
    </div>
  );
}
