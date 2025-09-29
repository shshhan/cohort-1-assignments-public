'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useMiniAMMContract } from '@/hooks/useContracts';
import { useTransaction } from '@/hooks/useTransaction';
import { useLPBalance, usePoolReserves } from '@/hooks/useBalances';
import { CONTRACTS } from '@/utils/constants';
import { formatTokenAmount, parseTokenAmount } from '@/utils/format';

export default function RemoveLiquidity() {
  const { address: userAddress } = useAccount();
  const ammContract = useMiniAMMContract(CONTRACTS.MINI_AMM);
  const { balance: lpBalance, totalSupply: lpTotalSupply, isLoading: balanceLoading, refetch: refetchLpBalance } = useLPBalance();
  const { reserves, isLoading: reservesLoading, refetch: refetchReserves } = usePoolReserves();
  const { isLoading, isSuccess, execute, reset } = useTransaction();

  const [amount, setAmount] = useState('');
  const [amountA, setAmountA] = useState('0');
  const [amountB, setAmountB] = useState('0');

  useEffect(() => {
    if (isSuccess) {
      setAmount('');
      const timer = setTimeout(() => reset(), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, reset]);

  useEffect(() => {
    if (!amount || !reserves || !lpTotalSupply || lpTotalSupply === 0n) {
      setAmountA('0');
      setAmountB('0');
      return;
    }
    try {
      const lpAmount = parseTokenAmount(amount);
      const { reserveX, reserveY } = reserves;
      
      const receivedA = (lpAmount * reserveX) / lpTotalSupply;
      const receivedB = (lpAmount * reserveY) / lpTotalSupply;

      setAmountA(formatTokenAmount(receivedA));
      setAmountB(formatTokenAmount(receivedB));
    } catch {
      setAmountA('0');
      setAmountB('0');
    }
  }, [amount, reserves, lpTotalSupply]);

  const handleRemoveLiquidity = async () => {
    if (!ammContract || !userAddress || !amount) return;

    const lpAmount = parseTokenAmount(amount);
    try {
      await execute(
        () => ammContract.removeLiquidity(lpAmount),
        {
          refresh: ['balances', 'pool', 'lp'],
          onSuccess: () => {
            refetchLpBalance();
            refetchReserves();
          },
        }
      );
    } catch (error) {
      console.error('Remove liquidity failed', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">🔥 Remove Liquidity</h2>
      
      <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">Your LP Token Balance:</p>
        <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
          {balanceLoading ? 'Loading...' : `${formatTokenAmount(lpBalance)} LP`}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">LP Amount to Remove</label>
        <input 
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          className="w-full bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg focus:outline-none text-xl font-mono"
          disabled={isLoading}
        />
      </div>

      <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">You will receive (approximately):</p>
        <p className="text-md font-mono text-gray-800 dark:text-gray-200">{amountA} TokenA</p>
        <p className="text-md font-mono text-gray-800 dark:text-gray-200">{amountB} TokenB</p>
      </div>

      <button
        onClick={handleRemoveLiquidity}
        disabled={!ammContract || !amount || isLoading || reservesLoading || balanceLoading || parseFloat(amount) <= 0 || lpBalance < parseTokenAmount(amount)}
        className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg"
      >
        {isLoading ? 'Removing...' : 'Remove Liquidity'}
      </button>
    </div>
  );
}
