import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useTokenContract, useMiniAMMContract } from './useContracts';
import { subscribeRefresh } from '@/utils/refreshBus';

// 토큰 잔액 훅
export function useTokenBalance(tokenAddress?: string | null, accountAddress?: string | null) {
  const { address: connectedAddress } = useAccount();
  const userAddress = accountAddress ?? connectedAddress;
  const tokenContract = useTokenContract(tokenAddress ?? undefined);
  const [balance, setBalance] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!tokenContract || !userAddress) {
      setBalance(0n);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const bal = await tokenContract.balanceOf(userAddress);
      setBalance(bal);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      setError(err as Error);
      setBalance(0n);
    } finally {
      setIsLoading(false);
    }
  }, [tokenContract, userAddress]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    fetchBalance();

    interval = setInterval(fetchBalance, 10000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchBalance]);

  useEffect(() => {
    return subscribeRefresh((topics) => {
      if (topics.includes('balances') || topics.includes('all')) {
        fetchBalance();
      }
    });
  }, [fetchBalance]);

  return { balance, isLoading, error, refetch: fetchBalance };
}

// 풀 예비금 훅
export function usePoolReserves() {
  const miniAMM = useMiniAMMContract();
  const [reserves, setReserves] = useState({
    reserveX: 0n,
    reserveY: 0n,
    k: 0n,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchReserves = useCallback(async () => {
    if (!miniAMM) {
      setReserves({ reserveX: 0n, reserveY: 0n, k: 0n });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [xReserve, yReserve, kValue] = await Promise.all([
        miniAMM.xReserve(),
        miniAMM.yReserve(),
        miniAMM.k(),
      ]);

      setReserves({
        reserveX: xReserve,
        reserveY: yReserve,
        k: kValue,
      });
    } catch (err) {
      console.error('Failed to fetch reserves:', err);
      setError(err as Error);
      setReserves({ reserveX: 0n, reserveY: 0n, k: 0n });
    } finally {
      setIsLoading(false);
    }
  }, [miniAMM]);

  useEffect(() => {
    fetchReserves();

    const interval = setInterval(fetchReserves, 5000);
    return () => clearInterval(interval);
  }, [fetchReserves]);

  useEffect(() => {
    return subscribeRefresh((topics) => {
      if (topics.includes('pool') || topics.includes('all')) {
        fetchReserves();
      }
    });
  }, [fetchReserves]);

  return { reserves, isLoading, error, refetch: fetchReserves };
}

// LP 토큰 잔액 훅
export function useLPBalance() {
  const { address: userAddress } = useAccount();
  const miniAMM = useMiniAMMContract();
  const [balance, setBalance] = useState<bigint>(0n);
  const [totalSupply, setTotalSupply] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLPBalance = useCallback(async () => {
    if (!miniAMM || !userAddress) {
      setBalance(0n);
      setTotalSupply(0n);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [bal, supply] = await Promise.all([
        miniAMM.balanceOf(userAddress),
        miniAMM.totalSupply(),
      ]);

      setBalance(bal);
      setTotalSupply(supply);
    } catch (err) {
      console.error('Failed to fetch LP balance:', err);
      setError(err as Error);
      setBalance(0n);
      setTotalSupply(0n);
    } finally {
      setIsLoading(false);
    }
  }, [miniAMM, userAddress]);

  useEffect(() => {
    fetchLPBalance();
    
    // 10초마다 자동 새로고침
    const interval = setInterval(fetchLPBalance, 10000);
    return () => clearInterval(interval);
  }, [fetchLPBalance]);

  useEffect(() => {
    return subscribeRefresh((topics) => {
      if (topics.includes('lp') || topics.includes('balances') || topics.includes('all')) {
        fetchLPBalance();
      }
    });
  }, [fetchLPBalance]);

  return { balance, totalSupply, isLoading, error, refetch: fetchLPBalance };
}

// 모든 잔액을 한번에 가져오는 훅
export function useAllBalances(tokenXAddress: string, tokenYAddress: string) {
  const tokenXBalance = useTokenBalance(tokenXAddress);
  const tokenYBalance = useTokenBalance(tokenYAddress);
  const lpBalance = useLPBalance();
  const poolReserves = usePoolReserves();

  return {
    tokenX: tokenXBalance,
    tokenY: tokenYBalance,
    lp: lpBalance,
    pool: poolReserves,
    isLoading: 
      tokenXBalance.isLoading || 
      tokenYBalance.isLoading || 
      lpBalance.isLoading || 
      poolReserves.isLoading,
  };
}
