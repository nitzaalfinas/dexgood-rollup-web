import { useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { BridgeToken, getTokenAddress } from '@/config/tokens';
import { getAddress, isAddress } from 'viem';

const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }, { name: '_spender', type: 'address' }],
    name: 'allowance',
    outputs: [{ name: 'remaining', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ name: '_spender', type: 'address' }, { name: '_value', type: 'uint256' }],
    name: 'approve',
    outputs: [{ name: 'success', type: 'bool' }],
    type: 'function',
  },
  // Additional functions for reading token info
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
] as const;

// Hook for getting token balance
export const useTokenBalance = (token: BridgeToken, address: `0x${string}` | undefined, chainId: number) => {
  // For native tokens, use wagmi's useBalance
  const nativeBalance = useBalance({
    address,
    chainId,
    query: {
      enabled: !!token.isNative && !!address,
    },
  });

  // For ERC-20 tokens, use contract read
  const tokenAddress = getTokenAddress(token, chainId);
  const erc20Balance = useReadContract({
    address: tokenAddress && isAddress(tokenAddress) ? getAddress(tokenAddress) : undefined,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId,
    query: {
      enabled: !token.isNative && !!tokenAddress && !!address && isAddress(tokenAddress),
    },
  });

  if (token.isNative) {
    return {
      data: nativeBalance.data?.value,
      isLoading: nativeBalance.isLoading,
      error: nativeBalance.error,
      refetch: nativeBalance.refetch,
    };
  }

  return {
    data: erc20Balance.data as bigint | undefined,
    isLoading: erc20Balance.isLoading,
    error: erc20Balance.error,
    refetch: erc20Balance.refetch,
  };
};

// Hook for getting token allowance
export const useTokenAllowance = (
  token: BridgeToken,
  owner: `0x${string}` | undefined,
  spender: `0x${string}`,
  chainId: number
) => {
  const tokenAddress = getTokenAddress(token, chainId);
  
  return useReadContract({
    address: tokenAddress && isAddress(tokenAddress) ? getAddress(tokenAddress) : undefined,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: owner ? [owner, spender] : undefined,
    chainId,
    query: {
      enabled: !token.isNative && !!tokenAddress && !!owner && isAddress(tokenAddress),
    },
  });
};

// Hook for approving token spend
export const useTokenApproval = () => {
  const { writeContract, data: hash, isPending, isSuccess, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = (tokenAddress: `0x${string}`, spender: `0x${string}`, amount: bigint) => {
    if (!isAddress(tokenAddress)) {
      throw new Error('Invalid token address');
    }
    
    writeContract({
      address: getAddress(tokenAddress),
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spender, amount],
    });
  };

  return {
    approve,
    hash,
    isPending: isPending || isConfirming,
    isSuccess: isConfirmed,
    error,
  };
};

// Hook to get custom token information
export function useCustomTokenInfo(tokenAddress: string, chainId: number) {
  const validAddress = isAddress(tokenAddress) ? getAddress(tokenAddress) : undefined;

  const { data: name } = useReadContract({
    address: validAddress,
    abi: ERC20_ABI,
    functionName: 'name',
    chainId,
    query: {
      enabled: !!validAddress,
    },
  });

  const { data: symbol } = useReadContract({
    address: validAddress,
    abi: ERC20_ABI,
    functionName: 'symbol',
    chainId,
    query: {
      enabled: !!validAddress,
    },
  });

  const { data: decimals } = useReadContract({
    address: validAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
    chainId,
    query: {
      enabled: !!validAddress,
    },
  });

  return {
    name,
    symbol,
    decimals,
    isLoading: !name || !symbol || decimals === undefined,
    isValid: !!(name && symbol && decimals !== undefined),
  };
}