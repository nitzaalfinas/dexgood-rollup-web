import Card from "@/components/ui/Card";

const WhyUsSection = () => {
  return (
    <section className="container mx-auto my-20">
      <h2 className="text-4xl font-bold text-center tracking-wider mb-8">Why Dexgood?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-8">
          <h3 className="text-2xl font-medium tracking-widest">Your Wallet</h3>
          <p className="mt-2 tracking-wide text-gray-200">
            You trade directly from your wallet and we don't hold your assets so
            it's impossible for us to play with your assets.
          </p>
          <img src="/img/landing/wallet.webp" alt="Wallet" className="w-56 mx-auto mt-8" />
        </Card>

        <Card className="p-8">
          <h3 className="text-2xl font-medium tracking-widest">Web3</h3>
          <p className="mt-2 tracking-wide text-gray-200">
            DEXGOOD guarantees the decentralization that is the foundation of
            web3.
          </p>
          <img src="/img/landing/web3.webp" alt="Web3" className="w-64 mx-auto mt-8" />
        </Card>

        <Card className="p-8">
          <h3 className="text-2xl font-medium tracking-widest">Transparent</h3>
          <p className="mt-2 tracking-wide text-gray-200">
            All data is stored in the blockchain so you can view it easily.
          </p>
          <img src="/img/landing/blockchain.webp" alt="Blockchain" className="w-64 mx-auto mt-8" />
        </Card>
      </div>
    </section>
  );
};

export default WhyUsSection;
