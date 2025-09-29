# Features
- Connect/disconnect wallet
- Mint MockERC20 tokens
- Approve MiniAMM to spend MockERC20 tokens by calling approve function on the two MockERC20 contracts involved
- Swap tokens on MiniAMM by calling swap function
- Remove/add liquidity on MiniAMM by calling removeLiquidity and addLiquidity functions

# Displays
- Show current amount of MockERC20 tokens in the connected wallet and miniAMM contract
- Show a swap interface:
  - choose which of the two tokens to sell
  - input the amount to sell
  - show the amount of the other token that will be received (calculate using the constant product formula)
  - a button to execute the swap
  - after the swap, temporarily disable a button, show a loading indicator until the transaction is confirmed, and then update all relevant numbers as needed and enable the button again

# Stacks
- Ethers.js@6: blockchain interaction
- RainbowKit: wallet connection
- TypeChain: type-safe contract interaction
  - you need to use types genereated by typechain under src/typs/ethers-contracts when interacting when MiniAMM, MiniAMMFactory, MiniAMMLP and MockERC20.
  - Do NOT use any other methods to interact with a contract since we have a typesafe way to do so.