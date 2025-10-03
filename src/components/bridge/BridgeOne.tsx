// Maksudnya adalah Bridge dari L1 ke L2
import React, { useState, useEffect } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { formatEther, parseUnits, formatUnits } from 'viem';
import { bridgeConfig } from '@/config/bridge';
import { BridgeToken, getNativeTokenForChain, getTokenAddress, isTokenAvailableOnChain } from '@/config/tokens';
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

  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  
  // Get token balance for the current chain
  const { data: balance } = useTokenBalance(
    fromToken,
    address,
    fromChain.id
  );

  // Token approval hooks (only for ERC-20 tokens)
  const bridgeContractAddress = '0x1234567890123456789012345678901234567890' as `0x${string}`; // Replace with actual bridge contract
  const { data: allowance, refetch: refetchAllowance } = useTokenAllowance(
    fromToken,
    address,
    bridgeContractAddress,
    fromChain.id
  );
  const { approve, isPending: isApproving, isSuccess: isApprovalSuccess } = useTokenApproval();

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
        approve(tokenAddress as `0x${string}`, bridgeContractAddress, amountToApprove);
      }
    }
  };

  const handleBridge = async () => {
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

    // Check if we're on the correct chain
    if (chain?.id !== fromChain.id) {
      try {
        await switchChain({ chainId: fromChain.id });
      } catch (error) {
        console.error('Failed to switch chain:', error);
        return;
      }
    }

    // Check if approval is needed for ERC-20 tokens
    if (!fromToken.isNative && needsApproval) {
      handleApprove();
      return;
    }

    // Here you would implement the actual bridge logic
    console.log('Bridging:', {
      amount,
      token: fromToken.symbol,
      from: fromChain.name,
      to: toChain.name,
      address,
    });
    
    // For now, just show an alert
    alert(`Bridge ${amount} ${fromToken.symbol} from ${fromChain.name} to ${toChain.name}`);
  };

  // Check if approval is needed
  useEffect(() => {
    if (!fromToken.isNative && amount && allowance !== undefined) {
      const amountBigInt = parseUnits(amount, fromToken.decimals);
      setNeedsApproval(allowance < amountBigInt);
    } else {
      setNeedsApproval(false);
    }
  }, [fromToken, amount, allowance]);

  // Refetch allowance after successful approval
  useEffect(() => {
    if (isApprovalSuccess) {
      refetchAllowance();
    }
  }, [isApprovalSuccess, refetchAllowance]);

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

      {/* Bridge Button */}
      <Button
        onClick={handleBridge}
        disabled={!isAmountValid || hasInsufficientBalance || (isConnected && !isTermsAccepted) || isApproving}
        className="w-full py-4 text-lg font-semibold"
        variant={hasInsufficientBalance ? "danger" : "primary"}
      >
        {!isConnected 
          ? "Connect Wallet"
          : hasInsufficientBalance 
            ? "Insufficient Balance"
            : !isAmountValid
              ? "Enter Amount"
              : isApproving
                ? "Approving..."
                : needsApproval && !fromToken.isNative
                  ? `Approve ${fromToken.symbol}`
                  : `Bridge to ${toChain.name}`
        }
      </Button>

      {/* Connect Wallet Modal */}
      <ModalConnectWallet
        open={showConnectModal}
        onClose={() => setShowConnectModal(false)}
      />
    </div>
  );
};

export default BridgeOne;