import { useEffect, useState } from 'react';
import { usePublicClient, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import type { MockERC20, MiniAMM } from '@/types/ethers-contracts';
import { MockERC20__factory, MiniAMM__factory } from '@/types/ethers-contracts/factories';
import { CONTRACTS } from '@/utils/constants';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

type ChainContracts = {
  ensRegistry?: { address?: string };
};

type ChainInfo = {
  id?: number;
  name?: string;
  contracts?: ChainContracts;
};

type TransportWithUrl = {
  type?: string;
  transports?: Array<{ value?: { url?: string } }>;
  url?: string;
};

type PublicClientLike = {
  chain?: ChainInfo;
  transport?: TransportWithUrl;
} | null | undefined;

type WalletClientLike = {
  account?: { address?: string };
  chain?: ChainInfo;
  transport?: {
    value?: unknown;
    request?: unknown;
  };
} | null | undefined;

type RequestCapable = {
  request: (...args: unknown[]) => Promise<unknown>;
};

type TransportItemWithUrl = {
  value?: { url?: string };
};

type WindowWithEthereum = Window & { ethereum?: unknown };

const hasRequestMethod = (value: unknown): value is RequestCapable => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'request' in value &&
    typeof (value as { request?: unknown }).request === 'function'
  );
};

const hasUrl = (item: TransportItemWithUrl | undefined): item is { value: { url: string } } => {
  return typeof item?.value?.url === 'string';
};

// Wagmi 클라이언트를 ethers.js Provider/Signer로 변환
function publicClientToProvider(publicClient: PublicClientLike) {
  if (!publicClient) return null;

  const { chain, transport } = publicClient;
  const network = {
    chainId: chain?.id,
    name: chain?.name ?? 'unknown',
    ensAddress: chain?.contracts?.ensRegistry?.address,
  };

  try {
    if (transport?.type === 'fallback' && transport.transports?.length) {
      const fallback = transport.transports.find(hasUrl);
      if (fallback?.value?.url) {
        return new ethers.JsonRpcProvider(fallback.value.url, network);
      }
    }

    if (typeof transport?.url === 'string') {
      return new ethers.JsonRpcProvider(transport.url, network);
    }
  } catch (error) {
    console.error('Failed to create provider from public client transport:', error);
  }

  return null;
}

async function walletClientToSigner(walletClient: WalletClientLike) {
  if (!walletClient) return null;

  const { account, chain } = walletClient;
  const network = {
    chainId: chain?.id,
    name: chain?.name ?? 'unknown',
    ensAddress: chain?.contracts?.ensRegistry?.address,
  };

  const globalEthereum =
    typeof window !== 'undefined' ? (window as WindowWithEthereum).ethereum : undefined;

  const candidateProviders = [
    walletClient?.transport?.value,
    walletClient?.transport,
    walletClient,
    globalEthereum,
  ].filter(hasRequestMethod);

  for (const providerSource of candidateProviders) {
    try {
      const browserProvider = new ethers.BrowserProvider(providerSource, network);
      const signer = await browserProvider.getSigner(account?.address);
      if (signer) {
        return signer;
      }
    } catch (error) {
      console.warn('Failed to derive signer from provider source:', error);
    }
  }

  return null;
}

// 개별 토큰 컨트랙트 훅
export function useTokenContract(address?: string | null): MockERC20 | null {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [contract, setContract] = useState<MockERC20 | null>(null);

  useEffect(() => {
    let isStale = false;

    async function initContract() {
      try {
        if (!address || address === ZERO_ADDRESS) {
          if (!isStale) setContract(null);
          return;
        }

        if (walletClient) {
          const signer = await walletClientToSigner(walletClient);
          if (!isStale && signer) {
            setContract(MockERC20__factory.connect(address, signer));
            return;
          }
        }

        const provider = publicClientToProvider(publicClient);
        if (!isStale && provider) {
          setContract(MockERC20__factory.connect(address, provider));
          return;
        }

        if (!isStale) setContract(null);
      } catch (error) {
        console.error('Failed to initialize token contract:', error);
        if (!isStale) setContract(null);
      }
    }

    initContract();

    return () => {
      isStale = true;
    };
  }, [address, publicClient, walletClient]);

  return contract;
}

// MiniAMM 컨트랙트 훅
export function useMiniAMMContract(address: string | undefined = CONTRACTS.MINI_AMM): MiniAMM | null {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [contract, setContract] = useState<MiniAMM | null>(null);

  useEffect(() => {
    let isStale = false;

    async function initContract() {
      try {
        if (!address || address === ZERO_ADDRESS) {
          if (!isStale) setContract(null);
          return;
        }

        if (walletClient) {
          const signer = await walletClientToSigner(walletClient);
          if (!isStale && signer) {
            setContract(MiniAMM__factory.connect(address, signer));
            return;
          }
        }

        const provider = publicClientToProvider(publicClient);
        if (!isStale && provider) {
          setContract(MiniAMM__factory.connect(address, provider));
          return;
        }

        if (!isStale) setContract(null);
      } catch (error) {
        console.error('Failed to initialize MiniAMM contract:', error);
        if (!isStale) setContract(null);
      }
    }

    initContract();

    return () => {
      isStale = true;
    };
  }, [address, publicClient, walletClient]);

  return contract;
}

// 모든 컨트랙트를 한번에 가져오는 훅
export function useAllContracts() {
  const tokenX = useTokenContract(CONTRACTS.TOKEN_X!);
  const tokenY = useTokenContract(CONTRACTS.TOKEN_Y!);
  const miniAMM = useMiniAMMContract();
  
  return {
    tokenX,
    tokenY,
    miniAMM,
  };
}
