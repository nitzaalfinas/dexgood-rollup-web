import React from 'react';
import BridgeContainer from '../bridge/BridgeContainer';

const BridgeSection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-main-bg to-gray-900" id="bridge">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Bridge Your Assets
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Seamlessly transfer your assets between Ethereum and Arbitrum with our secure bridge solution
          </p>
        </div>
        
        <div className="flex justify-center">
          <BridgeContainer className="w-full max-w-md" />
        </div>
        
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50">
            <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Secure</h3>
            <p className="text-gray-400 text-sm">
              Your assets are protected by battle-tested smart contracts and security audits
            </p>
          </div>
          
          <div className="text-center p-6 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50">
            <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Fast</h3>
            <p className="text-gray-400 text-sm">
              Experience near-instant transfers with optimized gas fees and quick confirmations
            </p>
          </div>
          
          <div className="text-center p-6 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50">
            <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Reliable</h3>
            <p className="text-gray-400 text-sm">
              Built on proven infrastructure with 99.9% uptime and 24/7 monitoring
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BridgeSection;