import React, { useState } from 'react';
import BridgeOne from './BridgeOne';
import BridgeTwo from './BridgeTwo';
import BridgeClaim from './BridgeClaim';

interface BridgeContainerProps {
  className?: string;
}

type BridgeMode = 'L1_TO_L2' | 'L2_TO_L1' | 'CLAIM';

const BridgeContainer: React.FC<BridgeContainerProps> = ({ className = '' }) => {
  const [bridgeMode, setBridgeMode] = useState<BridgeMode>('L1_TO_L2');

  const handleSwapDirection = () => {
    setBridgeMode(prev => prev === 'L1_TO_L2' ? 'L2_TO_L1' : 'L1_TO_L2');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Mode Selector Tabs */}
      <div className="mb-4 text-center">
        <div className="inline-flex items-center bg-gray-800/30 backdrop-blur-sm rounded-lg p-1 border border-gray-700/50">
          <button
            onClick={() => setBridgeMode('L1_TO_L2')}
            className={`px-4 py-2 rounded-md transition-all ${
              bridgeMode === 'L1_TO_L2'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">{import.meta.env.VITE_L1_COIN_SYMBOL?.charAt(0) || 'L1'}</span>
              </div>
              <span className="text-sm">→</span>
              <div className="w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">{import.meta.env.VITE_L2_COIN_SYMBOL?.charAt(0) || 'L2'}</span>
              </div>
            </div>
            <div className="text-xs mt-1">Deposit</div>
          </button>

          <button
            onClick={() => setBridgeMode('L2_TO_L1')}
            className={`px-4 py-2 rounded-md transition-all ${
              bridgeMode === 'L2_TO_L1'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">{import.meta.env.VITE_L2_COIN_SYMBOL?.charAt(0) || 'L2'}</span>
              </div>
              <span className="text-sm">→</span>
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">{import.meta.env.VITE_L1_COIN_SYMBOL?.charAt(0) || 'L1'}</span>
              </div>
            </div>
            <div className="text-xs mt-1">Withdraw</div>
          </button>

          <button
            onClick={() => setBridgeMode('CLAIM')}
            className={`px-4 py-2 rounded-md transition-all ${
              bridgeMode === 'CLAIM'
                ? 'bg-green-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-xs mt-1">Claim</div>
          </button>
        </div>
      </div>

      {/* Bridge Components */}
      <div className="relative">
        {bridgeMode === 'L1_TO_L2' && (
          <BridgeOne onSwapDirection={handleSwapDirection} />
        )}
        {bridgeMode === 'L2_TO_L1' && (
          <BridgeTwo onSwapDirection={handleSwapDirection} />
        )}
        {bridgeMode === 'CLAIM' && (
          <BridgeClaim />
        )}
      </div>

      {/* Additional Info */}
      <div className="mt-6 text-center">
        <div className="text-sm text-gray-400">
          {bridgeMode === 'L1_TO_L2' && (
            <>
              <div className="mb-2">
                <span className="text-blue-400">Deposit Process:</span> Lock tokens on L1 → Mint wrapped tokens on L2
              </div>
              <div className="text-xs">
                ⏱️ Estimated time: ~1-2 minutes
              </div>
            </>
          )}
          {bridgeMode === 'L2_TO_L1' && (
            <>
              <div className="mb-2">
                <span className="text-orange-400">Withdrawal Process:</span> Burn/lock tokens on L2 → Manual claim on L1
              </div>
              <div className="text-xs">
                ⏱️ Challenge period: ~7 days (testnet may be shorter)
              </div>
            </>
          )}
          {bridgeMode === 'CLAIM' && (
            <>
              <div className="mb-2">
                <span className="text-green-400">Claim Process:</span> Complete L2 withdrawals after challenge period
              </div>
              <div className="text-xs">
                💡 You need the L2 transaction hash to claim your funds
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BridgeContainer;