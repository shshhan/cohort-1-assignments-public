import { ethers } from 'ethers';

// Wei를 Ether로 변환하고 포맷팅 (표시용)
export function formatTokenAmount(
  amount: bigint | string | number,
  decimals: number = 18,
  displayDecimals: number = 6
): string {
  try {
    const formatted = ethers.formatUnits(amount.toString(), decimals);
    const num = parseFloat(formatted);

    if (num === 0) return '0';
    if (num < 0.000001) return '< 0.000001';

    return num.toFixed(displayDecimals).replace(/\.?0+$/, '');
  } catch {
    return '0';
  }
}

// 정밀도를 유지한 문자열 반환 (계산용)
export function formatTokenAmountExact(
  amount: bigint | string | number,
  decimals: number = 18
): string {
  try {
    const formatted = ethers.formatUnits(amount.toString(), decimals);
    return formatted.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  } catch {
    return '0';
  }
}

// Ether를 Wei로 변환
export function parseTokenAmount(
  amount: string,
  decimals: number = 18
): bigint {
  try {
    if (!amount || amount.trim() === '') return 0n;
    return ethers.parseUnits(amount, decimals);
  } catch {
    return 0n;
  }
}

// 주소 축약
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// 숫자를 천단위 구분자로 포맷팅
export function formatNumber(num: number | string, decimals = 2): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

// 퍼센트 포맷팅
export function formatPercent(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

// 가격 영향 계산
export function calculatePriceImpact(
  inputAmount: bigint,
  outputAmount: bigint,
  inputReserve: bigint,
  outputReserve: bigint
): number {
  if (inputReserve === 0n || outputReserve === 0n) return 0;
  
  const inputAmountFloat = Number(inputAmount) / 1e18;
  const outputAmountFloat = Number(outputAmount) / 1e18;
  const inputReserveFloat = Number(inputReserve) / 1e18;
  const outputReserveFloat = Number(outputReserve) / 1e18;
  
  const idealOutput = (inputAmountFloat * outputReserveFloat) / inputReserveFloat;
  const priceImpact = (idealOutput - outputAmountFloat) / idealOutput;
  
  return priceImpact;
}
