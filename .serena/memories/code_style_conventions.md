# Code Style and Conventions

## Solidity Style Guide
- **Pragma Version**: ^0.8.30 (consistent across all contracts)
- **License**: UNLICENSED
- **Import Style**: Named imports preferred (e.g., `{IERC20}`)
- **Contract Naming**: PascalCase (e.g., `MiniAMM`, `MockERC20`)
- **Function Naming**: camelCase (e.g., `addLiquidity`, `freeMintTo`)
- **Variable Naming**: camelCase for local, camelCase for state variables
- **Visibility**: Explicit visibility modifiers required

## Code Organization
- **Interfaces**: Separate interface files (IMiniAMM.sol, IMockERC20.sol)
- **Inheritance**: Use OpenZeppelin contracts as base classes
- **State Variables**: Declared at contract level with explicit visibility
- **Functions**: Public/external functions first, then internal/private

## Error Handling
- **Require Statements**: Use descriptive error messages
- **Input Validation**: Check for zero addresses and invalid parameters
- **Example**: `require(_tokenX != address(0), "tokenX cannot be zero address");`

## Documentation
- **Comments**: Minimal inline comments, focus on why not what
- **Function Documentation**: Not extensively used in current codebase
- **TODOs**: Marked with "implement" or "complete the function"

## Dependencies
- **OpenZeppelin**: Primary library for standard implementations
- **Remapping**: `@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/`
- **Import Paths**: Use remapped paths for clarity