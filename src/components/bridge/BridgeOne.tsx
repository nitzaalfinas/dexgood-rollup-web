// Maksudnya adalah Bridge dari L1 ke L2
import React, { useState, useEffect } from 'react';
import { useAccount, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseUnits, formatUnits } from 'viem';
import { bridgeConfig } from '@/config/bridge';
import { BridgeToken, getNativeTokenForChain, getTokenAddress } from '@/config/tokens';
import { useTokenBalance, useTokenAllowance, useTokenApproval } from '@/hooks/useTokens';
import Button from '../ui/Button';
import ModalConnectWallet from '../navbar/ModalConnectWallet';
import TokenSelector from './TokenSelector';
// Import chains from config if needed
// import { getL1Chain, getL2Chain } from '../../config/chains';

// Simple SVG Icon Component
const ArrowUpDownIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
  </svg>
);

interface BridgeProps {
  className?: string;
}

const BridgeOne: React.FC<BridgeProps> = ({ className = '' }) => {
  // Initialize chains from config
  const L1_CHAIN = bridgeConfig.chains.from;
  const L2_CHAIN = bridgeConfig.chains.to;

  const [amount, setAmount] = useState('');
  const [fromChain, setFromChain] = useState(L1_CHAIN);
  const [toChain, setToChain] = useState(L2_CHAIN);
  const [fromToken, setFromToken] = useState<BridgeToken>(getNativeTokenForChain(L1_CHAIN.id));
  const [toToken, setToToken] = useState<BridgeToken>(getNativeTokenForChain(L2_CHAIN.id));
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  
  // Get token balance for the current chain
  const { data: balance } = useTokenBalance(
    fromToken,
    address,
    fromChain.id
  );

  // Token approval hooks (only for ERC-20 tokens)
  const bridgeContractAddress = (import.meta.env.VITE_L1_BRIDGE_CONTRACT || '') as `0x${string}`; // Ambil dari .env

  const { data: allowance, refetch: refetchAllowance } = useTokenAllowance(
    fromToken,
    address,
    bridgeContractAddress,
    fromChain.id
  );
  const { approve, isPending: isApproving, isSuccess: isApprovalSuccess } = useTokenApproval();

  // Smart contract interaction hooks
  const { writeContract, isPending: isDepositPending, error: depositError, data: depositTxData } = useWriteContract();
  const { isLoading: isDepositConfirming, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({
    hash: depositTxData,
  });

  const handleFromTokenSelect = (token: BridgeToken) => {
    setFromToken(token);
    setAmount(''); // Reset amount when changing token
    
    // Automatically set the same token for "To" section
    setToToken(token);
  };

  const handleSwapChains = () => {
    const temp = fromChain;
    setFromChain(toChain);
    setToChain(temp);
    
    // Keep the same token, just swap the chains
    // Token stays the same on both sides
    setAmount(''); // Reset amount when swapping chains
  };  const handleMaxClick = () => {
    if (balance) {
      let maxAmount: number;
      
      if (fromToken.isNative) {
        // Reserve some native token for gas fees
        maxAmount = parseFloat(formatEther(balance));
        const reserveForGas = 0.01; // Reserve 0.01 for gas
        maxAmount = Math.max(0, maxAmount - reserveForGas);
      } else {
        // For ERC-20 tokens, use full balance
        maxAmount = parseFloat(formatUnits(balance, fromToken.decimals));
      }
      
      setAmount(maxAmount.toString());
    }
  };

    const handleApprove = async () => {
    if (!fromToken.isNative && amount) {
      const tokenAddress = getTokenAddress(fromToken, fromChain.id);
      if (tokenAddress) {
        const amountToApprove = parseUnits(amount, fromToken.decimals);
        await approve(tokenAddress as `0x${string}`, bridgeContractAddress, amountToApprove);
      }
    }
  };

  // Bridge L1 ABI - Simplified version
  const BRIDGE_L1_ABI = [
    {
      name: 'depositETH',
      type: 'function',
      stateMutability: 'payable',
      inputs: [],
      outputs: []
    },
    {
      name: 'depositERC20',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'token', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      outputs: []
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, name: 'depositId', type: 'uint256' },
        { indexed: true, name: 'user', type: 'address' },
        { indexed: false, name: 'amount', type: 'uint256' },
        { indexed: false, name: 'timestamp', type: 'uint256' }
      ],
      name: 'DepositETH',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, name: 'depositId', type: 'uint256' },
        { indexed: true, name: 'user', type: 'address' },
        { indexed: true, name: 'token', type: 'address' },
        { indexed: false, name: 'amount', type: 'uint256' },
        { indexed: false, name: 'timestamp', type: 'uint256' }
      ],
      name: 'DepositERC20',
      type: 'event'
    }
  ] as const;

  const handleDeposit = async () => {
    try {
      if (!amount || !address) {
        alert('Invalid amount or address');
        return;
      }

      if (!bridgeContractAddress) {
        alert('Bridge contract address not configured');
        return;
      }

      const amountInWei = parseUnits(amount, fromToken.decimals);

      if (fromToken.isNative) {
        // Deposit native ETH
        await writeContract({
          address: bridgeContractAddress,
          abi: BRIDGE_L1_ABI,
          functionName: 'depositETH',
          value: amountInWei,
        });
        console.log('ETH Deposit transaction initiated');
      } else {
        // Deposit ERC20 token
        const tokenAddress = getTokenAddress(fromToken, fromChain.id);
        if (!tokenAddress) {
          alert('Token address not found');
          return;
        }

        await writeContract({
          address: bridgeContractAddress,
          abi: BRIDGE_L1_ABI,
          functionName: 'depositERC20',
          args: [tokenAddress as `0x${string}`, amountInWei],
        });
        console.log('ERC20 Deposit transaction initiated');
      }
    } catch (error: any) {
      console.error('Deposit error:', error);
      const errorMessage = error?.message || error?.reason || 'Unknown error';
      alert(`Deposit failed: ${errorMessage}`);
    }
  };

  const handleMainAction = async () => {
    if (!isConnected) {
      setShowConnectModal(true);
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!isTermsAccepted) {
      alert('Please accept the Terms and Conditions');
      return;
    }

    // Check if we're on the correct chain (L1)
    if (chain?.id !== fromChain.id) {
      try {
        await switchChain({ chainId: fromChain.id });
      } catch (error) {
        console.error('Failed to switch chain:', error);
        return;
      }
    }

    // Step 1: If ERC-20 token needs approval, do approval first
    if (!fromToken.isNative && needsApproval) {
      await handleApprove();
      return;
    }

    // Step 2: If approved or native token, proceed with deposit
    await handleDeposit();
  };

  // Check if approval is needed
  useEffect(() => {
    if (!fromToken.isNative && amount && allowance !== undefined && allowance !== null) {
      const amountBigInt = parseUnits(amount, fromToken.decimals);
      const allowanceBigInt = BigInt(allowance.toString());
      setNeedsApproval(allowanceBigInt < amountBigInt);
      setIsApproved(allowanceBigInt >= amountBigInt);
    } else {
      setNeedsApproval(false);
      setIsApproved(fromToken.isNative); // native token tidak perlu approve
    }
  }, [fromToken, amount, allowance]);

  // Refetch allowance after successful approval
  useEffect(() => {
    if (isApprovalSuccess) {
      refetchAllowance();
    }
  }, [isApprovalSuccess, refetchAllowance]);

  // Reset form after successful deposit
  useEffect(() => {
    if (isDepositSuccess) {
      // Reset form after 3 seconds
      const timer = setTimeout(() => {
        setAmount('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isDepositSuccess]);

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return '0';
    if (fromToken.isNative) {
      return parseFloat(formatEther(balance)).toFixed(4);
    }
    return parseFloat(formatUnits(balance, fromToken.decimals)).toFixed(4);
  };

  const isAmountValid = amount && parseFloat(amount) > 0;
  const hasInsufficientBalance = balance && amount && 
    parseFloat(amount) > parseFloat(formatBalance(balance));

  return (
    <div className={`max-w-md mx-auto bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 ${className}`}>
      

      {/* From Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">From:</span>
          <span className="text-sm text-gray-400">
            Balance: {isConnected ? formatBalance(balance) : '0'} {fromToken.symbol}
          </span>
        </div>
        
        <div className="relative">
          <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Chain Selector */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      S
                    </span>
                  </div>
                  <div className="bg-transparent text-white font-medium outline-none cursor-pointer">
                    Sepolia
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {/* Token Selector */}
                <TokenSelector
                  selectedToken={fromToken}
                  onTokenSelect={handleFromTokenSelect}
                  chainId={fromChain.id}
                  className="ml-2"
                />
              </div>
              
              <div className="text-right">
                <input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-transparent text-white text-2xl font-semibold text-right outline-none w-full max-w-[120px] placeholder-gray-500"
                />
                <div className="flex items-center gap-2 justify-end mt-1">
                  <span className="text-sm text-gray-400">{fromToken.symbol}</span>
                  {isConnected && balance && Number(balance) > 0 ? (
                    <button
                      onClick={handleMaxClick}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      MAX
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={handleSwapChains}
          className="p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-full border border-gray-600/50 transition-colors"
        >
          <ArrowUpDownIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* To Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">To:</span>
          <span className="text-sm text-gray-400">
            Receive: {amount || '0'} {toToken.symbol}
          </span>
        </div>
        
        <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Chain Selector */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {toChain.id === L1_CHAIN.id ? 'S' : 'G'}
                  </span>
                </div>
                <select 
                  className="bg-transparent text-white font-medium outline-none cursor-pointer"
                  value={toChain.id}
                  onChange={(e) => {
                    const chainId = parseInt(e.target.value);
                    if (chainId === L1_CHAIN.id) {
                      setToChain(L1_CHAIN);
                    } else {
                      setToChain(L2_CHAIN);
                    }
                  }}
                >
                  <option value={L1_CHAIN.id}>{L1_CHAIN.name}</option>
                  <option value={L2_CHAIN.id}>{L2_CHAIN.name}</option>
                </select>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {/* Token Display (Read-only) */}
              <div className="flex items-center gap-2 ml-2 px-3 py-2">
                <span className="text-lg">{toToken.icon}</span>
                <span className="font-medium text-white">{toToken.symbol}</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-semibold text-white">
                {amount || '0'}
              </div>
              <div className="text-sm text-gray-400 mt-1">{toToken.symbol}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Receive Address */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Receive</span>
          <button className="text-sm text-gray-400 hover:text-white transition-colors">
            Send to custom address
          </button>
        </div>
        <div className="text-sm text-white bg-gray-700/30 p-3 rounded-lg border border-gray-600/30">
          {isConnected && address ? (
            `${address.slice(0, 6)}...${address.slice(-4)}`
          ) : (
            'Connect wallet to see address'
          )}
        </div>
      </div>

      {/* Bridge Process Steps Indicator */}
      {isConnected && isAmountValid && (
        <div className="mb-4 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
          <div className="text-sm text-gray-300 mb-2">Bridge Process:</div>
          <div className="flex items-center gap-4">
            {/* Step 1: Token Selection */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">✓</span>
              </div>
              <span className="text-xs text-gray-300">Token Selected</span>
            </div>
            
            {/* Step 2: Approval (if needed) */}
            {!fromToken.isNative && (
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  isApproved ? 'bg-green-500' : needsApproval ? 'bg-yellow-500' : 'bg-gray-500'
                }`}>
                  <span className="text-xs text-white">
                    {isApproved ? '✓' : isApproving ? '...' : '2'}
                  </span>
                </div>
                <span className="text-xs text-gray-300">
                  {isApproved ? 'Approved' : 'Approve Token'}
                </span>
              </div>
            )}
            
            {/* Step 3: Deposit */}
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                (fromToken.isNative || isApproved) ? 'bg-blue-500' : 'bg-gray-500'
              }`}>
                <span className="text-xs text-white">
                  {fromToken.isNative ? '2' : '3'}
                </span>
              </div>
              <span className="text-xs text-gray-300">Deposit to L1</span>
            </div>
          </div>
        </div>
      )}

      {/* Terms and Conditions */}
      <div className="mb-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isTermsAccepted}
            onChange={(e) => setIsTermsAccepted(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-400">
            I have read and agree to the{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300 underline">
              Terms and Conditions
            </a>
          </span>
        </label>
      </div>

      {/* Bridge Button - Step by Step Process */}
      <Button
        onClick={handleMainAction}
        disabled={
          !isAmountValid ||
          hasInsufficientBalance ||
          (isConnected && !isTermsAccepted) ||
          isApproving ||
          isDepositPending ||
          isDepositConfirming
        }
        className="w-full py-4 text-lg font-semibold"
        variant={hasInsufficientBalance ? "danger" : "primary"}
      >
        {!isConnected
          ? "Connect Wallet"
          : hasInsufficientBalance
            ? "Insufficient Balance"
            : !isAmountValid
              ? "Enter Amount"
              : !isTermsAccepted
                ? "Accept Terms to Continue"
                : needsApproval && !fromToken.isNative
                  ? isApproving
                    ? "Approving..."
                    : `Step 1: Approve ${fromToken.symbol}`
                  : isDepositPending
                    ? "Confirming Deposit..."
                    : isDepositConfirming
                      ? "Processing Transaction..."
                      : isDepositSuccess
                        ? "Deposit Successful!"
                        : `Step 2: Deposit to L1`
        }
      </Button>

      {/* Deposit Status Messages */}
      {depositError && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
          <div className="text-sm text-red-300">
            Deposit Error: {depositError.message}
          </div>
        </div>
      )}

      {isDepositSuccess && (
        <div className="mb-4 p-3 bg-green-900/30 border border-green-500/50 rounded-lg">
          <div className="text-sm text-green-300">
            ✅ Deposit successful! Your funds will be available on L2 shortly.
            {depositTxData && (
              <div className="mt-2">
                <a 
                  href={`https://sepolia.etherscan.io/tx/${depositTxData}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 underline"
                >
                  View on Etherscan
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Connect Wallet Modal */}
      <ModalConnectWallet
        open={showConnectModal}
        onClose={() => setShowConnectModal(false)}
      />
    </div>
  );
};

export default BridgeOne;