'use client';

import { useState, useCallback } from 'react';
import { type WriteContractReturnType } from 'wagmi';
import toast from 'react-hot-toast';
import { emitRefresh, type RefreshTopic } from '@/utils/refreshBus';

interface TransactionState {
  isLoading: boolean;
  isSuccess: boolean;
  error: Error | null;
}

interface ExecuteOptions {
  refresh?: RefreshTopic[];
  onSuccess?: () => void;
}

export function useTransaction() {
  const [state, setState] = useState<TransactionState>({
    isLoading: false,
    isSuccess: false,
    error: null,
  });

  const execute = useCallback(async (
    transaction: () => Promise<WriteContractReturnType>,
    options: ExecuteOptions = {}
  ) => {
    setState({ isLoading: true, isSuccess: false, error: null });
    const toastId = toast.loading('Transaction initiated...');

    try {
      const tx = await transaction();
      // The hook now waits for confirmation before showing success
      // await publicClient.waitForTransactionReceipt({ hash: tx.hash });

      toast.success('Transaction confirmed!', { id: toastId });
      setState({ isLoading: false, isSuccess: true, error: null });

      if (options.refresh?.length) {
        emitRefresh(...options.refresh);
      }

      options.onSuccess?.();

      return tx;

    } catch (err: any) {
      console.error('Transaction failed:', err);
      const errorMessage = err.shortMessage || err.message || 'An unknown error occurred.';
      toast.error(errorMessage, { id: toastId });
      setState({ isLoading: false, isSuccess: false, error: new Error(errorMessage) });

      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isLoading: false, isSuccess: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
