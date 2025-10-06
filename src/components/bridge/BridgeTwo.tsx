// Bridge dari L2 ke L1 (Withdraw)
import React, { useState, useEffect } from 'react';
import { useAccount, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseUnits, formatUnits } from 'viem';
import { bridgeConfig } from '@/config/bridge';
import { BridgeToken, getNativeTokenForChain, getTokenAddress } from '@/config/tokens';
import { useTokenBalance, useTokenAllowance, useTokenApproval } from '@/hooks/useTokens';
import Button from '../ui/Button';
import ModalConnectWallet from '../navbar/ModalConnectWallet';
import TokenSelector from './TokenSelector';

// Simple SVG Icon Component
const ArrowUpDownIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
  </svg>
);

interface BridgeTwoProps {
  className?: string;
  onSwapDirection?: () => void; // Function to switch to BridgeOne
}

const BridgeTwo: React.FC<BridgeTwoProps> = ({ className = '', onSwapDirection }) => {
  // Initialize chains from config (swapped for L2->L1)
  const L2_CHAIN = bridgeConfig.chains.to; // L2 as source
  const L1_CHAIN = bridgeConfig.chains.from; // L1 as destination

  const [amount, setAmount] = useState('');
  const [fromChain, setFromChain] = useState(L2_CHAIN);
  const [toChain, setToChain] = useState(L1_CHAIN);
  const [fromToken, setFromToken] = useState<BridgeToken>(getNativeTokenForChain(L2_CHAIN.id));
  const [toToken, setToToken] = useState<BridgeToken>(getNativeTokenForChain(L1_CHAIN.id));
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  
  // Get token balance for L2 chain
  const { data: balance } = useTokenBalance(
    fromToken,
    address,
    fromChain.id
  );

  // Token approval hooks (only for ERC-20 tokens on L2)
  const bridgeL2ContractAddress = (import.meta.env.VITE_L2_BRIDGE_CONTRACT || '') as `0x${string}`;

  const { data: allowance, refetch: refetchAllowance } = useTokenAllowance(
    fromToken,
    address,
    bridgeL2ContractAddress,
    fromChain.id
  );
  const { approve, isPending: isApproving, isSuccess: isApprovalSuccess } = useTokenApproval();

  // Smart contract interaction hooks
  const { writeContract, isPending: isWithdrawPending, error: withdrawError, data: withdrawTxData } = useWriteContract();
  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({
    hash: withdrawTxData,
  });

  const handleFromTokenSelect = (token: BridgeToken) => {
    setFromToken(token);
    setAmount(''); // Reset amount when changing token
    
    // Automatically set the same token for "To" section
    setToToken(token);
  };

  const handleSwapChains = () => {
    // Call parent function to switch to BridgeOne
    if (onSwapDirection) {
      onSwapDirection();
    }
  };

  const handleMaxClick = () => {
    if (balance) {
      let maxAmount: number;
      
      if (fromToken.isNative) {
        // Reserve some native token for gas fees on L2
        maxAmount = parseFloat(formatEther(balance));
        const reserveForGas = 0.001; // Reserve less on L2 (cheaper gas)
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
        await approve(tokenAddress as `0x${string}`, bridgeL2ContractAddress, amountToApprove);
      }
    }
  };

  // Bridge L2 ABI - For withdraw functions
  const BRIDGE_L2_ABI = [
    {
      name: 'withdrawETH',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'amount', type: 'uint256' }
      ],
      outputs: []
    },
    {
      name: 'withdrawERC20',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'l2Token', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      outputs: []
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, name: 'withdrawId', type: 'uint256' },
        { indexed: true, name: 'user', type: 'address' },
        { indexed: false, name: 'amount', type: 'uint256' },
        { indexed: false, name: 'timestamp', type: 'uint256' }
      ],
      name: 'WithdrawETH',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, name: 'withdrawId', type: 'uint256' },
        { indexed: true, name: 'user', type: 'address' },
        { indexed: true, name: 'l2Token', type: 'address' },
        { indexed: true, name: 'l1Token', type: 'address' },
        { indexed: false, name: 'amount', type: 'uint256' },
        { indexed: false, name: 'timestamp', type: 'uint256' }
      ],
      name: 'WithdrawERC20',
      type: 'event'
    }
  ] as const;

  const handleWithdraw = async () => {
    try {
      if (!amount || !address) {
        alert('Invalid amount or address');
        return;
      }

      if (!bridgeL2ContractAddress) {
        alert('L2 Bridge contract address not configured');
        return;
      }

      const amountInWei = parseUnits(amount, fromToken.decimals);

      if (fromToken.isNative) {
        // Withdraw native ETH from L2
        await writeContract({
          address: bridgeL2ContractAddress,
          abi: BRIDGE_L2_ABI,
          functionName: 'withdrawETH',
          args: [amountInWei],
        });
        console.log('ETH Withdraw transaction initiated');
      } else {
        // Withdraw ERC20 token from L2
        const l2TokenAddress = getTokenAddress(fromToken, fromChain.id);
        if (!l2TokenAddress) {
          alert('L2 Token address not found');
          return;
        }

        await writeContract({
          address: bridgeL2ContractAddress,
          abi: BRIDGE_L2_ABI,
          functionName: 'withdrawERC20',
          args: [l2TokenAddress as `0x${string}`, amountInWei],
        });
        console.log('ERC20 Withdraw transaction initiated');
      }
    } catch (error: any) {
      console.error('Withdraw error:', error);
      const errorMessage = error?.message || error?.reason || 'Unknown error';
      alert(`Withdraw failed: ${errorMessage}`);
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

    // Check if we're on the correct chain (L2)
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

    // Step 2: If approved or native token, proceed with withdraw
    await handleWithdraw();
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

  // Reset form after successful withdraw
  useEffect(() => {
    if (isWithdrawSuccess) {
      // Reset form after 3 seconds
      const timer = setTimeout(() => {
        setAmount('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isWithdrawSuccess]);

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
      {/* From Section - L2 */}
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
                {/* Chain Selector - L2 */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {import.meta.env.VITE_L2_COIN_SYMBOL?.charAt(0) || 'L2'}
                    </span>
                  </div>
                  <div className="bg-transparent text-white font-medium outline-none cursor-pointer">
                    {import.meta.env.VITE_L2_NAME || 'L2 Network'}
                  </div>
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
          title="Switch to L1 → L2 Bridge"
        >
          <ArrowUpDownIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* To Section - L1 */}
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
              {/* Chain Selector - L1 */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {import.meta.env.VITE_L1_COIN_SYMBOL?.charAt(0) || 'L1'}
                  </span>
                </div>
                <div className="bg-transparent text-white font-medium outline-none cursor-pointer">
                  {import.meta.env.VITE_L1_NAME || 'L1 Network'}
                </div>
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

      {/* Withdraw Process Steps Indicator */}
      {isConnected && isAmountValid && (
        <div className="mb-4 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
          <div className="text-sm text-gray-300 mb-2">Withdraw Process:</div>
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
            
            {/* Step 3: Withdraw */}
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                (fromToken.isNative || isApproved) ? 'bg-blue-500' : 'bg-gray-500'
              }`}>
                <span className="text-xs text-white">
                  {fromToken.isNative ? '2' : '3'}
                </span>
              </div>
              <span className="text-xs text-gray-300">Withdraw from L2</span>
            </div>
          </div>
        </div>
      )}

      {/* Warning Message for L2→L1 */}
      <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
        <div className="text-sm text-yellow-300">
          ⚠️ <strong>L2 → L1 Withdrawal:</strong> After initiating withdrawal on L2, 
          you'll need to manually claim your funds on L1 after the challenge period 
          (typically 7 days on mainnet, shorter on testnet).
        </div>
      </div>

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
            I understand the withdrawal process and agree to the{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300 underline">
              Terms and Conditions
            </a>
          </span>
        </label>
      </div>

      {/* Withdraw Button - Step by Step Process */}
      <Button
        onClick={handleMainAction}
        disabled={
          !isAmountValid ||
          hasInsufficientBalance ||
          (isConnected && !isTermsAccepted) ||
          isApproving ||
          isWithdrawPending ||
          isWithdrawConfirming
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
                  : isWithdrawPending
                    ? "Confirming Withdrawal..."
                    : isWithdrawConfirming
                      ? "Processing Transaction..."
                      : isWithdrawSuccess
                        ? "Withdrawal Initiated!"
                        : `Step 2: Withdraw from L2`
        }
      </Button>

      {/* Withdraw Status Messages */}
      {withdrawError && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
          <div className="text-sm text-red-300">
            Withdraw Error: {withdrawError.message}
          </div>
        </div>
      )}

      {isWithdrawSuccess && (
        <div className="mb-4 p-3 bg-green-900/30 border border-green-500/50 rounded-lg">
          <div className="text-sm text-green-300">
            ✅ Withdrawal initiated! 
            <div className="mt-2">
              <strong>Next Steps:</strong>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Wait for challenge period (typically 7 days)</li>
                <li>Return to manually claim your funds on L1</li>
                <li>Transaction will be available for claiming after the period</li>
              </ol>
            </div>
            {withdrawTxData && (
              <div className="mt-2">
                <a 
                  href={`${import.meta.env.VITE_L2_EXPLORER_URL}/tx/${withdrawTxData}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 underline"
                >
                  View on Explorer
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

export default BridgeTwo;