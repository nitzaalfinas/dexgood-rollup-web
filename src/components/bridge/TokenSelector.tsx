import React, { useState, useRef, useEffect } from 'react';
import { useReadContract, useAccount } from 'wagmi';
import { isAddress, getAddress } from 'viem';
import { BridgeToken, getAvailableTokensForChain } from '@/config/tokens';

// ERC-20 ABI for getting token info
const ERC20_ABI = [
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
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
] as const;

interface TokenSelectorProps {
  selectedToken: BridgeToken;
  onTokenSelect: (token: BridgeToken) => void;
  chainId: number;
  className?: string;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({
  selectedToken,
  onTokenSelect,
  chainId,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customTokenAddress, setCustomTokenAddress] = useState('');
  const [isLoadingCustomToken, setIsLoadingCustomToken] = useState(false);
  const [customTokenError, setCustomTokenError] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { address: userAddress } = useAccount();

  const availableTokens = getAvailableTokensForChain(chainId);

  // Read custom token info
  const { data: tokenName } = useReadContract({
    address: isAddress(customTokenAddress) ? getAddress(customTokenAddress) : undefined,
    abi: ERC20_ABI,
    functionName: 'name',
    chainId,
    query: {
      enabled: isAddress(customTokenAddress),
    },
  });

  const { data: tokenSymbol } = useReadContract({
    address: isAddress(customTokenAddress) ? getAddress(customTokenAddress) : undefined,
    abi: ERC20_ABI,
    functionName: 'symbol',
    chainId,
    query: {
      enabled: isAddress(customTokenAddress),
    },
  });

  const { data: tokenDecimals } = useReadContract({
    address: isAddress(customTokenAddress) ? getAddress(customTokenAddress) : undefined,
    abi: ERC20_ABI,
    functionName: 'decimals',
    chainId,
    query: {
      enabled: isAddress(customTokenAddress),
    },
  });

  const { data: tokenBalance } = useReadContract({
    address: isAddress(customTokenAddress) ? getAddress(customTokenAddress) : undefined,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    chainId,
    query: {
      enabled: isAddress(customTokenAddress) && !!userAddress,
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCustomInput(false);
        setCustomTokenAddress('');
        setCustomTokenError('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTokenSelect = (token: BridgeToken) => {
    onTokenSelect(token);
    setIsOpen(false);
    setShowCustomInput(false);
    setCustomTokenAddress('');
    setCustomTokenError('');
  };

  const handleCustomTokenSubmit = async () => {
    if (!customTokenAddress.trim()) {
      setCustomTokenError('Please enter a token address');
      return;
    }

    if (!isAddress(customTokenAddress)) {
      setCustomTokenError('Invalid token address');
      return;
    }

    setIsLoadingCustomToken(true);
    setCustomTokenError('');

    try {
      // Wait a bit for the contract calls to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!tokenSymbol || !tokenName || tokenDecimals === undefined) {
        setCustomTokenError('Unable to read token information. Please check the address.');
        setIsLoadingCustomToken(false);
        return;
      }

      // Create custom token object
      const customToken: BridgeToken = {
        symbol: tokenSymbol,
        name: tokenName,
        icon: '🪙', // Default icon for custom tokens
        decimals: tokenDecimals,
        isNative: false,
        addresses: {
          [chainId]: getAddress(customTokenAddress),
        },
      };

      // Select the custom token
      onTokenSelect(customToken);
      setIsOpen(false);
      setShowCustomInput(false);
      setCustomTokenAddress('');
      setCustomTokenError('');
    } catch (error) {
      console.error('Error reading custom token:', error);
      setCustomTokenError('Failed to read token information');
    } finally {
      setIsLoadingCustomToken(false);
    }
  };

  const formatBalance = (balance: bigint | undefined, decimals: number) => {
    if (!balance) return '0';
    const divisor = BigInt(10 ** decimals);
    const quotient = balance / divisor;
    const remainder = balance % divisor;
    const remainderStr = remainder.toString().padStart(decimals, '0');
    const trimmedRemainder = remainderStr.replace(/0+$/, '');
    return trimmedRemainder ? `${quotient}.${trimmedRemainder}` : quotient.toString();
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Token Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-600/50 hover:bg-gray-600/70 rounded-lg border border-gray-500/50 transition-colors min-w-[120px]"
      >
        <span className="text-lg">{selectedToken.icon}</span>
        <span className="font-medium text-white">{selectedToken.symbol}</span>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-gray-800 border border-gray-600 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
          {/* Predefined Tokens */}
          <div className="p-2">
            <div className="text-xs text-gray-400 mb-2 px-2">Available Tokens</div>
            {availableTokens.map((token) => (
              <button
                key={token.symbol}
                onClick={() => handleTokenSelect(token)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-700/50 transition-colors ${
                  selectedToken.symbol === token.symbol ? 'bg-gray-700/30' : ''
                }`}
              >
                <span className="text-xl">{token.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium text-white">{token.symbol}</div>
                  <div className="text-sm text-gray-400">{token.name}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-600 my-2"></div>

          {/* Custom Token Section */}
          <div className="p-2">
            {!showCustomInput ? (
              <button
                onClick={() => setShowCustomInput(true)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-700/50 transition-colors text-blue-400"
              >
                <span className="text-xl">➕</span>
                <div className="flex-1 text-left">
                  <div className="font-medium">Add Custom Token</div>
                  <div className="text-sm text-gray-400">Enter token contract address</div>
                </div>
              </button>
            ) : (
              <div className="px-3 py-3">
                <div className="text-sm text-gray-400 mb-3">Enter Token Address</div>
                
                {/* Token Address Input */}
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="0x..."
                    value={customTokenAddress}
                    onChange={(e) => {
                      setCustomTokenAddress(e.target.value);
                      setCustomTokenError('');
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  {customTokenError && (
                    <div className="text-red-400 text-xs mt-1">{customTokenError}</div>
                  )}
                </div>

                {/* Token Info Display */}
                {isAddress(customTokenAddress) && tokenSymbol && tokenName && (
                  <div className="mb-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">🪙</span>
                      <div className="flex-1">
                        <div className="font-medium text-white">{tokenSymbol}</div>
                        <div className="text-sm text-gray-400">{tokenName}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Decimals: {tokenDecimals}
                        </div>
                        {userAddress && tokenBalance !== undefined && (
                          <div className="text-xs text-gray-400 mt-1">
                            Balance: {formatBalance(tokenBalance, tokenDecimals || 18)} {tokenSymbol}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomTokenAddress('');
                      setCustomTokenError('');
                    }}
                    className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCustomTokenSubmit}
                    disabled={!customTokenAddress || isLoadingCustomToken || !isAddress(customTokenAddress)}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
                  >
                    {isLoadingCustomToken ? 'Loading...' : 'Add Token'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenSelector;