# MiniAMM DeFi Application - Technical Specification

## Project Overview
Build a decentralized finance (DeFi) application that interfaces with MiniAMM (Automated Market Maker) smart contracts, allowing users to swap tokens, add/remove liquidity, and manage their token balances.

## Technology Stack
- **Frontend Framework**: Next.js 15.5.4 with TypeScript
- **Blockchain Interaction**: Ethers.js v6
- **Wallet Connection**: RainbowKit
- **Type Safety**: TypeChain (pre-generated types in `src/types/ethers-contracts`)
- **Styling**: Tailwind CSS v4
- **React**: v19.1.0

## Smart Contract Interfaces

### 1. MiniAMM Contract
- **Location**: `src/types/ethers-contracts/MiniAMM.ts`
- **Key Functions**:
  - `swap(xAmountIn, yAmountIn)`: Execute token swap
  - `addLiquidity(xAmount, yAmount)`: Add liquidity to the pool
  - `removeLiquidity(lpAmount)`: Remove liquidity from the pool
  - `xReserve()`: Get token X reserve amount
  - `yReserve()`: Get token Y reserve amount
  - `k()`: Get constant product value
  - `tokenX()`: Get token X address
  - `tokenY()`: Get token Y address
  - `balanceOf(address)`: Get LP token balance

### 2. MockERC20 Contract
- **Location**: `src/types/ethers-contracts/MockERC20.ts`
- **Key Functions**:
  - `freeMintToSender(amount)`: Mint tokens to caller
  - `approve(spender, amount)`: Approve spending
  - `balanceOf(address)`: Get token balance
  - `allowance(owner, spender)`: Check approval amount
  - `transfer(to, amount)`: Transfer tokens
  - `symbol()`: Get token symbol
  - `decimals()`: Get token decimals

### 3. Supporting Contracts
- **MiniAMMFactory**: Factory for deploying AMM pools
- **MiniAMMLP**: LP token contract

## Implementation Tasks

### Phase 1: Project Setup and Infrastructure

#### 1.1 Install Dependencies
```bash
npm install ethers@6 @rainbow-me/rainbowkit wagmi viem @tanstack/react-query
```

#### 1.2 Configure RainbowKit Provider
- Set up RainbowKit configuration in `app/providers.tsx`
- Configure chains (likely testnet)
- Set up wallet connectors

#### 1.3 Create Base Layout Structure
- Update `app/layout.tsx` to include RainbowKit provider
- Add wallet connection UI component
- Set up basic navigation structure

### Phase 2: Core Components Development

#### 2.1 Wallet Connection Component (`components/WalletConnection.tsx`)
**Features**:
- Connect/disconnect wallet button
- Display connected wallet address
- Show network status
- Handle connection errors

**State Management**:
- Connection status
- Account address
- Chain ID

#### 2.2 Token Balance Display (`components/TokenBalance.tsx`)
**Features**:
- Display balances for Token X and Token Y
- Show balances in both wallet and MiniAMM contract
- Real-time balance updates
- Format token amounts with proper decimals

**Props**:
```typescript
interface TokenBalanceProps {
  tokenAddress: string;
  userAddress: string;
  contractAddress: string;
  symbol: string;
  decimals: number;
}
```

#### 2.3 Token Minting Component (`components/TokenMinter.tsx`)
**Features**:
- Input field for mint amount
- Mint button for each token (X and Y)
- Transaction status indicator
- Error handling

**Functions**:
- Call `freeMintToSender` on MockERC20 contracts
- Handle transaction confirmation
- Update balances after minting

#### 2.4 Token Approval Component (`components/TokenApproval.tsx`)
**Features**:
- Check current allowance
- Input for approval amount
- Approve button for each token
- Show approval status

**Functions**:
- Call `approve` on MockERC20 contracts
- Display current allowance
- Handle infinite approval option

### Phase 3: Swap Interface Implementation

#### 3.1 Swap Component (`components/Swap.tsx`)
**Features**:
- Token selector (Token X or Token Y)
- Input field for sell amount
- Display calculated output amount (using constant product formula)
- Swap button
- Slippage tolerance setting
- Price impact warning

**Core Logic**:
```typescript
// Constant Product Formula
// x * y = k
// For selling Token X:
// outputY = yReserve - (k / (xReserve + inputX))
// For selling Token Y:
// outputX = xReserve - (k / (yReserve + inputY))
```

**State Management**:
- Selected input token
- Input amount
- Calculated output amount
- Transaction status
- Loading state

**Functions**:
1. `calculateOutput()`: Calculate output using AMM formula
2. `executeSwap()`: Call swap function on MiniAMM
3. `checkAllowance()`: Verify token approval
4. `handleSwap()`: Complete swap workflow

### Phase 4: Liquidity Management

#### 4.1 Add Liquidity Component (`components/AddLiquidity.tsx`)
**Features**:
- Dual input fields for Token X and Token Y
- Calculate proportional amounts
- Display pool share percentage
- Add liquidity button
- Show LP tokens to receive

**Functions**:
- Calculate optimal liquidity amounts
- Check and request approvals
- Execute `addLiquidity` transaction
- Update LP token balance

#### 4.2 Remove Liquidity Component (`components/RemoveLiquidity.tsx`)
**Features**:
- Input for LP token amount or percentage slider
- Display tokens to receive
- Remove liquidity button
- Show current LP token balance

**Functions**:
- Calculate token amounts to receive
- Execute `removeLiquidity` transaction
- Update all relevant balances

### Phase 5: Hooks and Utilities

#### 5.1 Contract Hooks (`hooks/useContracts.ts`)
```typescript
export const useTokenContract = (address: string) => {...}
export const useMiniAMMContract = (address: string) => {...}
```

#### 5.2 Balance Hooks (`hooks/useBalances.ts`)
```typescript
export const useTokenBalance = (tokenAddress: string, accountAddress: string) => {...}
export const usePoolReserves = (ammAddress: string) => {...}
```

#### 5.3 Transaction Hooks (`hooks/useTransaction.ts`)
- Handle transaction submission
- Track transaction status
- Show loading states
- Handle errors

#### 5.4 Utilities (`utils/`)
- **format.ts**: Number formatting, decimal handling
- **constants.ts**: Contract addresses, chain configs
- **calculations.ts**: AMM math functions

### Phase 6: State Management

#### 6.1 Context Providers
- **ContractProvider**: Manage contract instances
- **BalanceProvider**: Cache and update balances
- **TransactionProvider**: Handle transaction queue

#### 6.2 State Structure
```typescript
interface AppState {
  wallet: {
    connected: boolean;
    address: string | null;
    chainId: number;
  };
  contracts: {
    tokenX: MockERC20 | null;
    tokenY: MockERC20 | null;
    miniAMM: MiniAMM | null;
  };
  balances: {
    tokenX: bigint;
    tokenY: bigint;
    lpToken: bigint;
  };
  pool: {
    reserveX: bigint;
    reserveY: bigint;
    k: bigint;
  };
  transactions: {
    pending: Transaction[];
    confirmed: Transaction[];
  };
}
```

### Phase 7: UI/UX Requirements

#### 7.1 Loading States
- Show spinner/skeleton during data fetching
- Disable buttons during transaction processing
- Display transaction progress

#### 7.2 Error Handling
- User-friendly error messages
- Retry mechanisms
- Fallback UI for connection issues

#### 7.3 Responsive Design
- Mobile-first approach
- Tablet and desktop optimizations
- Touch-friendly interactions

#### 7.4 Transaction Feedback
- Transaction initiated notification
- Confirmation progress
- Success/failure messages
- Link to transaction on block explorer

### Phase 8: Testing Requirements

#### 8.1 Unit Tests
- Utility functions
- AMM calculations
- Component logic

#### 8.2 Integration Tests
- Wallet connection flow
- Token minting process
- Swap execution
- Liquidity operations

#### 8.3 E2E Tests
- Complete user journey
- Error scenarios
- Edge cases

## File Structure
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── providers.tsx
├── components/
│   ├── WalletConnection.tsx
│   ├── TokenBalance.tsx
│   ├── TokenMinter.tsx
│   ├── TokenApproval.tsx
│   ├── Swap.tsx
│   ├── AddLiquidity.tsx
│   └── RemoveLiquidity.tsx
├── hooks/
│   ├── useContracts.ts
│   ├── useBalances.ts
│   └── useTransaction.ts
├── utils/
│   ├── format.ts
│   ├── constants.ts
│   └── calculations.ts
├── contexts/
│   ├── ContractContext.tsx
│   ├── BalanceContext.tsx
│   └── TransactionContext.tsx
└── types/
    └── ethers-contracts/ (existing)
```

## Contract Addresses (To Be Configured)
```typescript
// utils/constants.ts
export const CONTRACTS = {
  TOKEN_X: "0x...", // MockERC20 for Token X
  TOKEN_Y: "0x...", // MockERC20 for Token Y
  MINI_AMM: "0x...", // MiniAMM contract
  MINI_AMM_FACTORY: "0x...", // MiniAMMFactory
};
```

## Development Workflow

### Step 1: Basic Setup
1. Install all dependencies
2. Set up RainbowKit and providers
3. Configure contract addresses

### Step 2: Wallet & Display
1. Implement wallet connection
2. Create balance display components
3. Test connection flow

### Step 3: Token Operations
1. Implement minting interface
2. Add approval functionality
3. Test token operations

### Step 4: Swap Feature
1. Build swap UI
2. Implement calculation logic
3. Add transaction execution
4. Test swap flow

### Step 5: Liquidity Features
1. Create add liquidity interface
2. Build remove liquidity component
3. Test liquidity operations

### Step 6: Polish & Optimization
1. Add loading states
2. Implement error handling
3. Optimize performance
4. Add analytics

## Success Criteria
- [ ] Users can connect/disconnect wallets
- [ ] Token balances display correctly
- [ ] Users can mint test tokens
- [ ] Token approvals work properly
- [ ] Swap calculations are accurate
- [ ] Swap transactions execute successfully
- [ ] Add liquidity functions correctly
- [ ] Remove liquidity works as expected
- [ ] All transactions show proper feedback
- [ ] UI is responsive and intuitive

## Notes
- Always use TypeChain generated types for contract interaction
- Never use raw contract calls - use typed interfaces only
- Implement proper error boundaries
- Add transaction retry logic for failed transactions
- Consider gas optimization in transaction parameters
- Implement proper decimal handling for token amounts