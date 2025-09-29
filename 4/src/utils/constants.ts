// 스마트 컨트랙트 주소 (Coredao Testnet에 배포됨)
export const CONTRACTS = {
  TOKEN_X: process.env.NEXT_PUBLIC_TOKEN_X_ADDRESS,
  TOKEN_Y: process.env.NEXT_PUBLIC_TOKEN_Y_ADDRESS,
  MINI_AMM: process.env.NEXT_PUBLIC_MINI_AMM_ADDRESS,
  MINI_AMM_FACTORY: process.env.NEXT_PUBLIC_MINI_AMM_FACTORY_ADDRESS,
} as const;

// 체인 설정
export const CHAIN_CONFIG = {
  DEFAULT_CHAIN_ID: 11155111, // Sepolia
  BLOCK_EXPLORER_URL: "https://sepolia.etherscan.io",
} as const;

// 트랜잭션 설정
export const TX_CONFIG = {
  DEFAULT_GAS_LIMIT: 500000n,
  DEFAULT_SLIPPAGE_TOLERANCE: 0.5, // 0.5%
  MAX_SLIPPAGE_TOLERANCE: 5, // 5%
} as const;

// UI 설정
export const UI_CONFIG = {
  DEBOUNCE_DELAY: 500, // ms
  REFRESH_INTERVAL: 10000, // 10초
  DECIMAL_PLACES: 6,
} as const;

// 토큰 정보 (임시)
export const TOKEN_INFO = {
  TOKEN_X: {
    symbol: "TOKX",
    name: "Token X",
    decimals: 18,
  },
  TOKEN_Y: {
    symbol: "TOKY",
    name: "Token Y",
    decimals: 18,
  },
  LP_TOKEN: {
    symbol: "MINI-LP",
    name: "MiniAMM LP Token",
    decimals: 18,
  },
} as const;