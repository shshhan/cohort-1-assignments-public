'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useMiniAMMContract, useTokenContract } from '@/hooks/useContracts';
import { usePoolReserves } from '@/hooks/useBalances';
import { useTransaction } from '@/hooks/useTransaction';
import { CONTRACTS } from '@/utils/constants';
import { formatTokenAmount, formatTokenAmountExact, parseTokenAmount } from '@/utils/format';
import { calculateProportionalAmount } from '@/utils/calculations';
import { subscribeRefresh } from '@/utils/refreshBus';

const { TOKEN_X, TOKEN_Y, MINI_AMM } = CONTRACTS;

export default function AddLiquidity() {
  const { address: userAddress } = useAccount();
  const ammContract = useMiniAMMContract(MINI_AMM);
  const { reserves, isLoading: reservesLoading, refetch: refetchReserves } = usePoolReserves();
  const { isLoading, isSuccess, execute, reset } = useTransaction();

  const tokenAContract = useTokenContract(TOKEN_X);
  const tokenBContract = useTokenContract(TOKEN_Y);

  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [lastEdited, setLastEdited] = useState<'A' | 'B'>('A');
  const [allowanceA, setAllowanceA] = useState(0n);
  const [allowanceB, setAllowanceB] = useState(0n);

  const checkAllowances = useCallback(async () => {
    if (!userAddress || !MINI_AMM) return;
    try {
      if (tokenAContract) setAllowanceA(await tokenAContract.allowance(userAddress, MINI_AMM));
      if (tokenBContract) setAllowanceB(await tokenBContract.allowance(userAddress, MINI_AMM));
    } catch (error) {
      console.error('Failed to fetch allowances:', error);
    }
  }, [MINI_AMM, tokenAContract, tokenBContract, userAddress]);

  useEffect(() => {
    if (!userAddress || !MINI_AMM) return;
    checkAllowances();
    const interval = setInterval(checkAllowances, 5000);
    return () => clearInterval(interval);
  }, [checkAllowances, userAddress, MINI_AMM]);

  useEffect(() => {
    return subscribeRefresh((topics) => {
      if (topics.includes('allowances') || topics.includes('all')) {
        checkAllowances();
      }
    });
  }, [checkAllowances]);

  useEffect(() => {
    if (!reserves || reserves.reserveX === 0n || reserves.reserveY === 0n) return;
    const { reserveX, reserveY } = reserves;
    try {
      if (lastEdited === 'A') {
        if (amountA === '') { setAmountB(''); return; }
        const proportionalB = calculateProportionalAmount(parseTokenAmount(amountA), reserveX, reserveY);
        setAmountB(formatTokenAmountExact(proportionalB));
      } else {
        if (amountB === '') { setAmountA(''); return; }
        const proportionalA = calculateProportionalAmount(parseTokenAmount(amountB), reserveY, reserveX);
        setAmountA(formatTokenAmountExact(proportionalA));
      }
    } catch { setAmountA(''); setAmountB(''); }
  }, [amountA, amountB, reserves, lastEdited]);

  useEffect(() => {
    if (isSuccess) {
      setAmountA('');
      setAmountB('');
      const timer = setTimeout(() => reset(), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, reset]);

  const handleAddLiquidity = async () => {
    if (!ammContract || !userAddress || !amountA || !amountB) return;
    
    const amountX = parseTokenAmount(amountA);
    const amountY = parseTokenAmount(amountB);

    if (allowanceA < amountX || allowanceB < amountY) {
      alert('Error: Allowance is not enough for one or both tokens.');
      return;
    }

    try {
      await execute(
        () => ammContract.addLiquidity(amountX, amountY),
        {
          refresh: ['balances', 'allowances', 'pool', 'lp'],
          onSuccess: () => refetchReserves(),
        }
      );
    } catch (error) {
      console.error('Add liquidity failed', error);
    }
  };

  const handleAmountAChange = (e: React.ChangeEvent<HTMLInputElement>) => { setAmountA(e.target.value); setLastEdited('A'); };
  const handleAmountBChange = (e: React.ChangeEvent<HTMLInputElement>) => { setAmountB(e.target.value); setLastEdited('B'); };

  const isApprovedA = allowanceA >= parseTokenAmount(amountA || '0');
  const isApprovedB = allowanceB >= parseTokenAmount(amountB || '0');
  const buttonDisabled = !ammContract || !amountA || !amountB || isLoading || reservesLoading || !isApprovedA || !isApprovedB;

  const getButtonText = () => {
    if (isLoading) return 'Adding...';
    if (!isApprovedA) return 'Approve TokenA First';
    if (!isApprovedB) return 'Approve TokenB First';
    return 'Add Liquidity';
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">💧 Add Liquidity</h2>
      
      <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">TokenA Amount</label>
        <input
          type="text"
          inputMode="decimal"
          value={amountA}
          onChange={handleAmountAChange}
          placeholder="0.0"
          className="w-full bg-transparent text-xl font-mono focus:outline-none text-gray-900 dark:text-white mt-1"
          disabled={isLoading || reservesLoading}
        />
      </div>

      <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">TokenB Amount</label>
        <input
          type="text"
          inputMode="decimal"
          value={amountB}
          onChange={handleAmountBChange}
          placeholder="0.0"
          className="w-full bg-transparent text-xl font-mono focus:outline-none text-gray-900 dark:text-white mt-1"
          disabled={isLoading || reservesLoading}
        />
      </div>

      <button onClick={handleAddLiquidity} disabled={buttonDisabled} className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg">
        {getButtonText()}
      </button>
    </div>
  );
}
