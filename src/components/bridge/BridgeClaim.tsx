// Component untuk claim withdrawal dari L2 ke L1
import React, { useState, useEffect } from 'react';
import { useAccount, useSwitchChain, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { formatEther, formatUnits, keccak256, toHex } from 'viem';
import { bridgeConfig } from '@/config/bridge';
import Button from '../ui/Button';
import ModalConnectWallet from '../navbar/ModalConnectWallet';

interface PendingWithdrawal {
  withdrawId: string;
  user: string;
  token: string;
  amount: bigint;
  timestamp: number;
  isProcessed: boolean;
  canClaim: boolean;
  timeRemaining?: number;
}

interface BridgeClaimProps {
  className?: string;
}

const BridgeClaim: React.FC<BridgeClaimProps> = ({ className = '' }) => {
  const L1_CHAIN = bridgeConfig.chains.from;
  const [pendingWithdrawals, setPendingWithdrawals] = useState<PendingWithdrawal[]>([]);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<PendingWithdrawal | null>(null);

  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();

  // Smart contract interaction hooks
  const { writeContract, isPending: isClaimPending, error: claimError, data: claimTxData } = useWriteContract();
  const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: claimTxData,
  });

  // Bridge L1 ABI - For release functions
  const BRIDGE_L1_ABI = [
    {
      name: 'releaseETH',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'withdrawId', type: 'uint256' },
        { name: 'user', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'l2TxHash', type: 'bytes32' }
      ],
      outputs: []
    },
    {
      name: 'releaseERC20',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'withdrawId', type: 'uint256' },
        { name: 'user', type: 'address' },
        { name: 'token', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'l2TxHash', type: 'bytes32' }
      ],
      outputs: []
    },
    {
      name: 'processedWithdrawals',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: '', type: 'uint256' }],
      outputs: [{ name: '', type: 'bool' }]
    },
    {
      name: 'TIMELOCK_DURATION',
      type: 'function',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ name: '', type: 'uint256' }]
    }
  ] as const;

  const bridgeL1ContractAddress = (import.meta.env.VITE_L1_BRIDGE_CONTRACT || '') as `0x${string}`;

  // Read timelock duration from contract
  const { data: timelockDuration } = useReadContract({
    address: bridgeL1ContractAddress,
    abi: BRIDGE_L1_ABI,
    functionName: 'TIMELOCK_DURATION',
  });

  // Fetch pending withdrawals from API/backend
  useEffect(() => {
    const fetchPendingWithdrawals = async () => {
      if (!address) return;

      try {
        // Call your backend API to get pending withdrawals for this user
        const response = await fetch(`/api/bridge/withdrawals/${address}`);
        const data = await response.json();
        
        if (data.success) {
          const withdrawals = data.withdrawals.map((w: any) => ({
            ...w,
            canClaim: Date.now() > (w.timestamp * 1000) + (Number(timelockDuration || 0) * 1000),
            timeRemaining: Math.max(0, ((w.timestamp * 1000) + (Number(timelockDuration || 0) * 1000)) - Date.now())
          }));
          setPendingWithdrawals(withdrawals);
        }
      } catch (error) {
        console.error('Failed to fetch pending withdrawals:', error);
      }
    };

    if (address && timelockDuration) {
      fetchPendingWithdrawals();
      // Refresh every 30 seconds
      const interval = setInterval(fetchPendingWithdrawals, 30000);
      return () => clearInterval(interval);
    }
  }, [address, timelockDuration]);

  const handleClaim = async (withdrawal: PendingWithdrawal, l2TxHash: string) => {
    try {
      if (!address) {
        alert('Wallet not connected');
        return;
      }

      if (!bridgeL1ContractAddress) {
        alert('L1 Bridge contract address not configured');
        return;
      }

      // Check if we're on L1
      if (chain?.id !== L1_CHAIN.id) {
        try {
          await switchChain({ chainId: L1_CHAIN.id });
        } catch (error) {
          console.error('Failed to switch to L1:', error);
          return;
        }
      }

      const l2TxHashBytes = keccak256(toHex(l2TxHash));

      if (withdrawal.token === '0x0000000000000000000000000000000000000000') {
        // Claim ETH
        await writeContract({
          address: bridgeL1ContractAddress,
          abi: BRIDGE_L1_ABI,
          functionName: 'releaseETH',
          args: [
            BigInt(withdrawal.withdrawId),
            withdrawal.user as `0x${string}`,
            withdrawal.amount,
            l2TxHashBytes
          ],
        });
      } else {
        // Claim ERC20
        await writeContract({
          address: bridgeL1ContractAddress,
          abi: BRIDGE_L1_ABI,
          functionName: 'releaseERC20',
          args: [
            BigInt(withdrawal.withdrawId),
            withdrawal.user as `0x${string}`,
            withdrawal.token as `0x${string}`,
            withdrawal.amount,
            l2TxHashBytes
          ],
        });
      }

      console.log('Claim transaction initiated');
    } catch (error: any) {
      console.error('Claim error:', error);
      const errorMessage = error?.message || error?.reason || 'Unknown error';
      alert(`Claim failed: ${errorMessage}`);
    }
  };

  const formatTimeRemaining = (milliseconds: number) => {
    if (milliseconds <= 0) return 'Ready to claim';
    
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const formatAmount = (amount: bigint, token: string) => {
    if (token === '0x0000000000000000000000000000000000000000') {
      return parseFloat(formatEther(amount)).toFixed(4) + ' ETH';
    }
    // For ERC20, you might need to get decimals from token contract
    return parseFloat(formatUnits(amount, 18)).toFixed(4) + ' Token';
  };

  if (!isConnected) {
    return (
      <div className={`max-w-md mx-auto bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 ${className}`}>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-4">Claim L1 Withdrawals</h3>
          <p className="text-gray-400 mb-6">Connect your wallet to view pending withdrawals</p>
          <Button onClick={() => setShowConnectModal(true)} className="w-full">
            Connect Wallet
          </Button>
        </div>
        
        <ModalConnectWallet
          open={showConnectModal}
          onClose={() => setShowConnectModal(false)}
        />
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Claim L1 Withdrawals</h3>
        <p className="text-sm text-gray-400">
          Complete your L2 → L1 withdrawals after the challenge period
        </p>
      </div>

      {pendingWithdrawals.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-400">No pending withdrawals found</p>
          <p className="text-sm text-gray-500 mt-2">
            Withdrawals initiated on L2 will appear here after processing
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingWithdrawals.map((withdrawal, index) => (
            <div key={withdrawal.withdrawId} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-medium text-white">
                    Withdrawal #{withdrawal.withdrawId}
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatAmount(withdrawal.amount, withdrawal.token)}
                  </div>
                </div>
                <div className="text-right">
                  {withdrawal.isProcessed ? (
                    <div className="text-green-400 text-sm font-medium">✅ Claimed</div>
                  ) : withdrawal.canClaim ? (
                    <div className="text-green-400 text-sm font-medium">🟢 Ready</div>
                  ) : (
                    <div className="text-yellow-400 text-sm font-medium">⏳ Pending</div>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-400 mb-3">
                {withdrawal.canClaim ? (
                  <span className="text-green-400">Ready to claim on L1</span>
                ) : (
                  <span>{formatTimeRemaining(withdrawal.timeRemaining || 0)}</span>
                )}
              </div>

              {!withdrawal.isProcessed && withdrawal.canClaim && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="L2 Transaction Hash"
                    className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white text-sm placeholder-gray-400"
                    onBlur={(e) => {
                      const updatedWithdrawals = [...pendingWithdrawals];
                      updatedWithdrawals[index] = { 
                        ...withdrawal, 
                        l2TxHash: e.target.value 
                      };
                      setPendingWithdrawals(updatedWithdrawals);
                    }}
                  />
                  <Button
                    onClick={() => handleClaim(withdrawal, (withdrawal as any).l2TxHash || '')}
                    disabled={
                      isClaimPending || 
                      isClaimConfirming || 
                      !(withdrawal as any).l2TxHash
                    }
                    className="w-full"
                    size="sm"
                  >
                    {isClaimPending ? 'Claiming...' : isClaimConfirming ? 'Confirming...' : 'Claim on L1'}
                  </Button>
                </div>
              )}

              {!withdrawal.canClaim && !withdrawal.isProcessed && (
                <div className="text-xs text-gray-500">
                  Challenge period active. You can claim after the timelock expires.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Status Messages */}
      {claimError && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
          <div className="text-sm text-red-300">
            Claim Error: {claimError.message}
          </div>
        </div>
      )}

      {isClaimSuccess && (
        <div className="mt-4 p-3 bg-green-900/30 border border-green-500/50 rounded-lg">
          <div className="text-sm text-green-300">
            ✅ Claim successful! Your funds have been released on L1.
            {claimTxData && (
              <div className="mt-2">
                <a 
                  href={`${import.meta.env.VITE_L1_EXPLORER_URL}/tx/${claimTxData}`}
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

      <ModalConnectWallet
        open={showConnectModal}
        onClose={() => setShowConnectModal(false)}
      />
    </div>
  );
};

export default BridgeClaim;