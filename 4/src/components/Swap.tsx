'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useMiniAMMContract, useTokenContract } from '@/hooks/useContracts';
import { usePoolReserves } from '@/hooks/useBalances';
import { useTransaction } from '@/hooks/useTransaction';
import { CONTRACTS } from '@/utils/constants';
import { formatTokenAmount, parseTokenAmount } from '@/utils/format';
import { calculateSwapOutput } from '@/utils/calculations';
import { subscribeRefresh } from '@/utils/refreshBus';

const { TOKEN_X, TOKEN_Y, MINI_AMM } = CONTRACTS;

export default function Swap() {
  const { address: userAddress } = useAccount();
  const ammContract = useMiniAMMContract(MINI_AMM);
  const { reserves, refetch: refetchReserves } = usePoolReserves();
  const { isLoading, isSuccess, execute, reset } = useTransaction();

  const [tokenAtoB, setTokenAtoB] = useState(true);
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [allowance, setAllowance] = useState(0n);

  const fromToken = tokenAtoB ? { symbol: 'TokenA', address: TOKEN_X! } : { symbol: 'TokenB', address: TOKEN_Y! };
  const toToken = tokenAtoB ? { symbol: 'TokenB', address: TOKEN_Y! } : { symbol: 'TokenA', address: TOKEN_X! };

  const fromTokenContract = useTokenContract(fromToken.address);

  const checkAllowance = useCallback(async () => {
    if (!fromTokenContract || !userAddress) return;
    try {
      const currentAllowance = await fromTokenContract.allowance(userAddress, MINI_AMM!);
      setAllowance(currentAllowance);
    } catch (error) {
      console.error('Failed to fetch allowance:', error);
    }
  }, [fromTokenContract, userAddress]);

  useEffect(() => {
    checkAllowance();
    const interval = setInterval(checkAllowance, 5000);
    return () => clearInterval(interval);
  }, [checkAllowance]);

  useEffect(() => {
    return subscribeRefresh((topics) => {
      if (topics.includes('allowances') || topics.includes('all')) {
        checkAllowance();
      }
      if (topics.includes('pool') || topics.includes('all')) {
        refetchReserves();
      }
    });
  }, [checkAllowance, refetchReserves]);

  useEffect(() => {
    if (!inputAmount || !reserves) { setOutputAmount(''); return; }
    try {
      const amountIn = parseTokenAmount(inputAmount);
      const { reserveX, reserveY } = reserves;
      const reserveIn = tokenAtoB ? reserveX : reserveY;
      const reserveOut = tokenAtoB ? reserveY : reserveX;
      const amountOut = calculateSwapOutput(amountIn, reserveIn, reserveOut);
      setOutputAmount(formatTokenAmount(amountOut));
    } catch (e) {
      console.error('Calculation error:', e);
      setOutputAmount('');
    }
  }, [inputAmount, reserves, tokenAtoB]);

  useEffect(() => {
    if (isSuccess) {
      setInputAmount('');
      const timer = setTimeout(() => reset(), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, reset]);

  const handleSwap = async () => {
    if (!ammContract || !userAddress || !inputAmount) return;
    
    const amountIn = parseTokenAmount(inputAmount);
    if (allowance < amountIn) {
      alert('Error: Allowance is not enough. Please approve the token first.');
      return;
    }

    const xAmountIn = tokenAtoB ? amountIn : 0n;
    const yAmountIn = tokenAtoB ? 0n : amountIn;

    try {
      await execute(
        () => ammContract.swap(xAmountIn, yAmountIn),
        {
          refresh: ['balances', 'allowances', 'pool', 'lp'],
          onSuccess: () => {
            checkAllowance();
            refetchReserves();
          },
        }
      );
    } catch (error) {
      console.error('Swap failed', error);
    }
  };

  const toggleSwapDirection = () => {
    setTokenAtoB(!tokenAtoB);
    setInputAmount('');
    setOutputAmount('');
    reset();
  };

  const isApproved = allowance >= parseTokenAmount(inputAmount || '0');

  return (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">🔄 Token Swap</h2>
      
      <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">From</label>
        <div className="flex items-center gap-4 mt-1">
          <input type="number" value={inputAmount} onChange={(e) => setInputAmount(e.target.value)} placeholder="0.0" className="w-full bg-transparent text-2xl font-mono focus:outline-none text-gray-900 dark:text-white" disabled={isLoading} />
          <div className="font-semibold text-xl">{fromToken.symbol}</div>
        </div>
      </div>

      <div className="flex justify-center -my-2">
        <button onClick={toggleSwapDirection} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-transform transform hover:rotate-180">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 12l-4-4m4 4l4-4m6 8V4m0 12l4-4m-4 4l-4-4" /></svg>
        </button>
      </div>

      <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">To</label>
        <div className="flex items-center gap-4 mt-1">
          <input type="number" value={outputAmount} readOnly placeholder="0.0" className="w-full bg-transparent text-2xl font-mono focus:outline-none text-gray-900 dark:text-white" />
          <div className="font-semibold text-xl">{toToken.symbol}</div>
        </div>
      </div>

      <button onClick={handleSwap} disabled={!ammContract || !inputAmount || isLoading || parseFloat(inputAmount) <= 0 || !isApproved} className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg">
        {isLoading ? 'Swapping...' : (isApproved ? 'Swap' : 'Approve First')}
      </button>
    </div>
  );
}
