import React, { useState } from 'react';
import { useReadContract, useAccount, usePublicClient } from 'wagmi';
import { isAddress, getAddress } from 'viem';
import { envConfig } from '@/config/env';
import { rpcCallWithProxy } from '@/utils/corsProxy';

// Helper function to decode hex string to UTF-8
const decodeHexString = (hex: string): string => {
  try {
    if (!hex || hex === '0x') return 'No data';
    
    // Remove 0x prefix
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
    
    // For ABI encoded strings, skip the first 64 chars (offset + length)
    if (cleanHex.length > 128) {
      // Get length from bytes 32-64
      const lengthHex = cleanHex.slice(64, 128);
      const length = parseInt(lengthHex, 16) * 2; // Convert to hex char count
      
      // Get actual string data
      const dataHex = cleanHex.slice(128, 128 + length);
      
      // Convert hex to string
      let result = '';
      for (let i = 0; i < dataHex.length; i += 2) {
        const hexByte = dataHex.substr(i, 2);
        if (hexByte !== '00') { // Skip null bytes
          result += String.fromCharCode(parseInt(hexByte, 16));
        }
      }
      return result || 'Empty string';
    }
    
    return 'Invalid format';
  } catch (error) {
    return `Decode error: ${error}`;
  }
};

const TokenDebugger: React.FC = () => {
  const [tokenAddress, setTokenAddress] = useState('0x1b4010C6eEe02e0701c0A8dbb4e6cDCA86921c2e');
  const { address: userAddress, chain } = useAccount();
  const publicClient = usePublicClient();

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
      inputs: [],
      name: 'totalSupply',
      outputs: [{ name: '', type: 'uint256' }],
      type: 'function',
    },
  ] as const;

  const { data: tokenName, error: nameError, isLoading: nameLoading } = useReadContract({
    address: isAddress(tokenAddress) ? getAddress(tokenAddress) : undefined,
    abi: ERC20_ABI,
    functionName: 'name',
    chainId: chain?.id,
    query: {
      enabled: isAddress(tokenAddress) && !!chain,
      retry: 5,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  });

  const { data: tokenSymbol, error: symbolError, isLoading: symbolLoading } = useReadContract({
    address: isAddress(tokenAddress) ? getAddress(tokenAddress) : undefined,
    abi: ERC20_ABI,
    functionName: 'symbol',
    chainId: chain?.id,
    query: {
      enabled: isAddress(tokenAddress) && !!chain,
      retry: 5,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  });

  const { data: tokenDecimals, error: decimalsError, isLoading: decimalsLoading } = useReadContract({
    address: isAddress(tokenAddress) ? getAddress(tokenAddress) : undefined,
    abi: ERC20_ABI,
    functionName: 'decimals',
    chainId: chain?.id,
    query: {
      enabled: isAddress(tokenAddress) && !!chain,
      retry: 5,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  });

  const { data: totalSupply, error: totalSupplyError } = useReadContract({
    address: isAddress(tokenAddress) ? getAddress(tokenAddress) : undefined,
    abi: ERC20_ABI,
    functionName: 'totalSupply',
    chainId: chain?.id,
    query: {
      enabled: isAddress(tokenAddress) && !!chain,
      retry: 5,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  });

  const [debugResults, setDebugResults] = useState<any>({});
  const [isDebugRunning, setIsDebugRunning] = useState(false);

  const testDirectRPCCall = async () => {
    if (!publicClient || !isAddress(tokenAddress)) {
      setDebugResults({
        error: 'Invalid token address or no public client',
        tokenAddress,
        hasPublicClient: !!publicClient,
        isValidAddress: isAddress(tokenAddress)
      });
      return;
    }

    setIsDebugRunning(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      tokenAddress,
      chainId: chain?.id,
      chainName: chain?.name,
      rpcUrl: chain?.rpcUrls?.default?.http?.[0],
    };

    try {
      console.log('=== STARTING DEBUG TESTS ===');
      
      // Test 1: Basic RPC connectivity
      try {
        console.log('Test 1: Basic RPC connectivity...');
        const blockNumber = await publicClient.getBlockNumber();
        results.blockNumber = Number(blockNumber);
        results.rpcConnectivity = 'SUCCESS';
        console.log('✅ RPC connectivity: SUCCESS, Block:', blockNumber);
      } catch (error: any) {
        results.rpcConnectivity = 'FAILED';
        results.rpcError = error.message;
        console.log('❌ RPC connectivity: FAILED', error.message);
      }

      // Test 2: Contract code existence
      try {
        console.log('Test 2: Contract code existence...');
        const code = await publicClient.getBytecode({
          address: getAddress(tokenAddress),
        });
        results.contractExists = !!code && code !== '0x';
        results.codeLength = code?.length || 0;
        console.log('Contract code:', code?.length ? `${code.length} chars` : 'No code');
        
        if (!code || code === '0x') {
          results.warning = 'No contract code found at this address - this is not a contract!';
        }
      } catch (error: any) {
        results.contractCheckError = error.message;
        console.log('❌ Contract check failed:', error.message);
      }

      // Test 3: Raw eth_call for name function
      try {
        console.log('Test 3: Raw eth_call...');
        const rawResult = await publicClient.request({
          method: 'eth_call',
          params: [
            {
              to: getAddress(tokenAddress),
              data: '0x06fdde03', // name() function selector
            },
            'latest'
          ],
        });
        results.rawNameCall = rawResult;
        console.log('✅ Raw name call result:', rawResult);
      } catch (error: any) {
        results.rawNameCallError = error.message;
        console.log('❌ Raw name call failed:', error.message);
      }

      // Test 4: Direct contract call using viem
      try {
        console.log('Test 4: Direct contract call...');
        const nameResult = await publicClient.readContract({
          address: getAddress(tokenAddress),
          abi: ERC20_ABI,
          functionName: 'name',
        });
        results.directNameCall = nameResult;
        console.log('✅ Direct name call result:', nameResult);
      } catch (error: any) {
        results.directNameCallError = error.message;
        console.log('❌ Direct name call failed:', error.message);
      }

      // Test 5: Check if address is externally owned account
      try {
        console.log('Test 5: Check account type...');
        const balance = await publicClient.getBalance({
          address: getAddress(tokenAddress),
        });
        results.addressBalance = balance.toString();
        console.log('Address balance:', balance.toString());
      } catch (error: any) {
        results.balanceCheckError = error.message;
      }

      // Test 6: Manual fetch to RPC endpoint with CORS proxy fallback
      try {
        console.log('Test 6: Manual fetch test with CORS handling...');
        const rpcUrl = chain?.rpcUrls?.default?.http?.[0];
        if (rpcUrl) {
          // Test name() function with CORS proxy
          const nameResult = await rpcCallWithProxy(
            rpcUrl,
            'eth_call',
            [
              {
                to: tokenAddress,
                data: '0x06fdde03', // name()
              },
              'latest'
            ],
            1
          );
          
          // Test symbol() function with CORS proxy
          const symbolResult = await rpcCallWithProxy(
            rpcUrl,
            'eth_call',
            [
              {
                to: tokenAddress,
                data: '0x95d89b41', // symbol()
              },
              'latest'
            ],
            2
          );
          
          results.manualFetch = {
            nameCall: {
              status: 200,
              result: nameResult,
            },
            symbolCall: {
              status: 200,
              result: symbolResult,
            }
          };
          console.log('Manual fetch with CORS proxy - name result:', nameResult);
          console.log('Manual fetch with CORS proxy - symbol result:', symbolResult);
        }
      } catch (error: any) {
        results.manualFetchError = error.message;
        console.log('❌ Manual fetch with CORS proxy failed:', error.message);
      }

      // Test 7: Debug wagmi configuration
      try {
        console.log('Test 7: Wagmi configuration debug...');
        results.wagmiConfig = {
          currentChainId: chain?.id,
          expectedL2ChainId: envConfig.L2_CHAIN_ID,
          chainMatch: chain?.id === envConfig.L2_CHAIN_ID,
          chainRpcUrl: chain?.rpcUrls?.default?.http?.[0],
          envRpcUrl: envConfig.L2_RPC_URL,
          rpcMatch: chain?.rpcUrls?.default?.http?.[0] === envConfig.L2_RPC_URL,
        };
        console.log('Wagmi config debug:', results.wagmiConfig);
      } catch (error: any) {
        results.wagmiConfigError = error.message;
      }

      console.log('=== DEBUG TESTS COMPLETED ===');
      console.log('Full results:', results);

    } catch (error: any) {
      results.generalError = error.message;
      console.error('General debug error:', error);
    }

    setDebugResults(results);
    setIsDebugRunning(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-xl">
      <h2 className="text-xl font-bold text-white mb-6">Token Debugger</h2>
      
      {/* Environment Config */}
      <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">Environment Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <div className="font-semibold text-blue-400 mb-2">L1 Network</div>
            <div>Chain ID: {envConfig.L1_CHAIN_ID}</div>
            <div>Name: {envConfig.L1_NAME}</div>
            <div>Symbol: {envConfig.L1_COIN_SYMBOL}</div>
            <div>RPC: {envConfig.L1_RPC_URL}</div>
            <div>Bridge: {envConfig.L1_BRIDGE_CONTRACT}</div>
          </div>
          <div>
            <div className="font-semibold text-orange-400 mb-2">L2 Network</div>
            <div>Chain ID: {envConfig.L2_CHAIN_ID}</div>
            <div>Name: {envConfig.L2_NAME}</div>
            <div>Symbol: {envConfig.L2_COIN_SYMBOL}</div>
            <div>RPC: {envConfig.L2_RPC_URL}</div>
            <div>Bridge: {envConfig.L2_BRIDGE_CONTRACT}</div>
          </div>
        </div>
      </div>

      {/* Current Chain Info */}
      <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">Current Wallet Connection</h3>
        <div className="text-sm text-gray-300">
          <div>Connected Chain ID: {chain?.id}</div>
          <div>Connected Chain Name: {chain?.name}</div>
          <div>RPC URL: {chain?.rpcUrls?.default?.http?.[0]}</div>
          <div>User Address: {userAddress}</div>
          <div className="mt-2">
            <span className={`px-2 py-1 rounded text-xs ${
              chain?.id === envConfig.L1_CHAIN_ID 
                ? 'bg-blue-600 text-white' 
                : chain?.id === envConfig.L2_CHAIN_ID 
                  ? 'bg-orange-600 text-white'
                  : 'bg-red-600 text-white'
            }`}>
              {chain?.id === envConfig.L1_CHAIN_ID 
                ? 'Connected to L1' 
                : chain?.id === envConfig.L2_CHAIN_ID 
                  ? 'Connected to L2'
                  : 'Connected to Unknown Chain'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Token Address Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Token Address to Test:
        </label>
        <input
          type="text"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          placeholder="0x1b4010C6eEe02e0701c0A8dbb4e6cDCA86921c2e"
        />
        <div className="mt-1 text-xs text-gray-400">
          Default: 0x1b4010C6eEe02e0701c0A8dbb4e6cDCA86921c2e (your problematic token)
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setTokenAddress('0x1b4010C6eEe02e0701c0A8dbb4e6cDCA86921c2e')}
          className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded"
        >
          Use Problem Token
        </button>
        <button
          onClick={() => {
            if (envConfig.L2_BRIDGE_CONTRACT) {
              setTokenAddress(envConfig.L2_BRIDGE_CONTRACT);
            }
          }}
          className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded"
        >
          Test Bridge Contract
        </button>
        <button
          onClick={() => window.open(`${envConfig.L2_EXPLORER_URL}/address/${tokenAddress}`, '_blank')}
          className="px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white text-sm rounded"
        >
          View in Explorer
        </button>
      </div>

      {/* Test Button */}
      <button
        onClick={testDirectRPCCall}
        disabled={isDebugRunning}
        className={`mb-6 px-4 py-2 text-white rounded-lg ${
          isDebugRunning 
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-500'
        }`}
      >
        {isDebugRunning ? 'Running Tests...' : 'Run Comprehensive Debug Test'}
      </button>

      {/* Results */}
      <div className="space-y-4">
        <div className="p-4 bg-gray-700/50 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Token Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Name:</div>
              <div className="text-white">
                {nameLoading ? (
                  <span className="text-yellow-400">Loading...</span>
                ) : nameError ? (
                  <span className="text-red-400">Error: {nameError.message}</span>
                ) : tokenName ? (
                  <span className="text-green-400">{tokenName}</span>
                ) : (
                  <span className="text-gray-500">No data</span>
                )}
              </div>
            </div>

            <div>
              <div className="text-gray-400">Symbol:</div>
              <div className="text-white">
                {symbolLoading ? (
                  <span className="text-yellow-400">Loading...</span>
                ) : symbolError ? (
                  <span className="text-red-400">Error: {symbolError.message}</span>
                ) : tokenSymbol ? (
                  <span className="text-green-400">{tokenSymbol}</span>
                ) : (
                  <span className="text-gray-500">No data</span>
                )}
              </div>
            </div>

            <div>
              <div className="text-gray-400">Decimals:</div>
              <div className="text-white">
                {decimalsLoading ? (
                  <span className="text-yellow-400">Loading...</span>
                ) : decimalsError ? (
                  <span className="text-red-400">Error: {decimalsError.message}</span>
                ) : tokenDecimals !== undefined ? (
                  <span className="text-green-400">{tokenDecimals}</span>
                ) : (
                  <span className="text-gray-500">No data</span>
                )}
              </div>
            </div>

            <div>
              <div className="text-gray-400">Total Supply:</div>
              <div className="text-white">
                {totalSupplyError ? (
                  <span className="text-red-400">Error: {totalSupplyError.message}</span>
                ) : totalSupply ? (
                  <span className="text-green-400">{totalSupply.toString()}</span>
                ) : (
                  <span className="text-gray-500">No data</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Comprehensive Debug Results */}
        {Object.keys(debugResults).length > 0 && (
          <div className="p-4 bg-gray-700/50 rounded-lg mb-4">
            <h3 className="text-lg font-semibold text-white mb-4">🔍 Comprehensive Debug Results</h3>
            
            {/* Summary */}
            <div className="mb-4 p-3 bg-gray-800 rounded">
              <h4 className="text-white font-semibold mb-2">Quick Summary:</h4>
              <div className="text-sm space-y-1">
                <div className={`${debugResults.rpcConnectivity === 'SUCCESS' ? 'text-green-400' : 'text-red-400'}`}>
                  RPC Connection: {debugResults.rpcConnectivity || 'Not tested'}
                </div>
                <div className={`${debugResults.contractExists ? 'text-green-400' : 'text-red-400'}`}>
                  Contract Exists: {debugResults.contractExists ? 'YES' : 'NO'}
                </div>
                <div className={`${debugResults.directNameCall ? 'text-green-400' : 'text-red-400'}`}>
                  Viem Direct Call: {debugResults.directNameCall ? 'YES' : 'NO'}
                </div>
                <div className={`${debugResults.manualFetch?.nameCall?.result?.result ? 'text-green-400' : 'text-red-400'}`}>
                  Manual RPC Call: {debugResults.manualFetch?.nameCall?.result?.result ? 'YES' : 'NO'}
                </div>
                <div className={`${debugResults.wagmiConfig?.chainMatch ? 'text-green-400' : 'text-red-400'}`}>
                  Wagmi Chain Config: {debugResults.wagmiConfig?.chainMatch ? 'CORRECT' : 'MISMATCH'}
                </div>
              </div>
              
              {/* Decoded Results */}
              {debugResults.manualFetch?.nameCall?.result?.result && (
                <div className="mt-3 p-2 bg-green-900/30 border border-green-600 rounded text-green-300 text-sm">
                  <div className="font-semibold">✅ Manual RPC Success:</div>
                  <div>Raw: {debugResults.manualFetch.nameCall.result.result}</div>
                  <div>Decoded Name: {decodeHexString(debugResults.manualFetch.nameCall.result.result)}</div>
                  {debugResults.manualFetch.symbolCall?.result?.result && (
                    <div>Decoded Symbol: {decodeHexString(debugResults.manualFetch.symbolCall.result.result)}</div>
                  )}
                </div>
              )}
              
              {debugResults.warning && (
                <div className="mt-2 p-2 bg-yellow-900/50 border border-yellow-600 rounded text-yellow-300 text-sm">
                  ⚠️ {debugResults.warning}
                </div>
              )}
            </div>

            {/* Detailed Results */}
            <details>
              <summary className="text-white cursor-pointer mb-2">📋 Detailed Debug Information</summary>
              <pre className="mt-2 text-xs text-gray-300 overflow-auto max-h-96 bg-gray-800 p-3 rounded">
                {JSON.stringify(debugResults, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Raw Debug Info */}
        <details className="p-4 bg-gray-700/50 rounded-lg">
          <summary className="text-white cursor-pointer">Wagmi Hook Debug Information</summary>
          <pre className="mt-2 text-xs text-gray-300 overflow-auto">
            {JSON.stringify({
              tokenAddress,
              chainId: chain?.id,
              isValidAddress: isAddress(tokenAddress),
              tokenName,
              nameError: nameError?.message,
              nameLoading,
              tokenSymbol,
              symbolError: symbolError?.message,
              symbolLoading,
              tokenDecimals,
              decimalsError: decimalsError?.message,
              decimalsLoading,
              totalSupply: totalSupply?.toString(),
              totalSupplyError: totalSupplyError?.message,
            }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default TokenDebugger;