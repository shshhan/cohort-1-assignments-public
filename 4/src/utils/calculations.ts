'use client';

/**
 * Calculates the output amount for a swap based on the constant product formula.
 * 
 * @param amountIn The amount of the input token.
 * @param reserveIn The reserve of the input token in the pool.
 * @param reserveOut The reserve of the output token in the pool.
 * @returns The calculated output amount.
 */
export function calculateSwapOutput(
  amountIn: bigint,
  reserveIn: bigint,
  reserveOut: bigint
): bigint {
  if (amountIn <= 0n || reserveIn <= 0n || reserveOut <= 0n) {
    return 0n;
  }

  const k = reserveIn * reserveOut;
  const newReserveIn = reserveIn + amountIn;
  
  if (newReserveIn === 0n) return 0n; // Should not happen if reserveIn > 0

  const newReserveOut = k / newReserveIn;
  const amountOut = reserveOut - newReserveOut;

  return amountOut > 0n ? amountOut : 0n;
}

/**
 * Calculates the proportional amount of one token given the amount of the other and pool reserves.
 * 
 * @param amountA The amount of the first token.
 * @param reserveA The reserve of the first token.
 * @param reserveB The reserve of the second token.
 * @returns The proportional amount of the second token.
 */
export function calculateProportionalAmount(
  amountA: bigint,
  reserveA: bigint,
  reserveB: bigint
): bigint {
  if (amountA <= 0n || reserveA <= 0n || reserveB <= 0n) {
    return 0n;
  }

  return (amountA * reserveB) / reserveA;
}
