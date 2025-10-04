import { useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  Connector,
} from "wagmi";
import Modal from "@/components/ui/Modal";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";

interface ModalConnectWalletProps {
  open: boolean;
  onClose: () => void;
}

const getWalletIcon = (connectorId: string) => {
  switch (connectorId) {
    case "metaMaskSDK":
      return "/img/icon/wallets/MetaMask.svg";
    case "coinbaseWalletSDK":
      return "/img/icon/wallets/Coinbase-Wallet.svg";
    case "walletConnect":
      return "/img/icon/wallets/WalletConnect.svg";
    default:
      return "/img/icon/wallets/Wallet.svg";
  }
};

const ModalConnectWallet = ({ open, onClose }: ModalConnectWalletProps) => {
  const account = useAccount();
  const connect = useConnect();
  const { disconnect } = useDisconnect();
  const [loadingConnector, setLoadingConnector] = useState<string | null>(null);

  const handleConnect = (connector: Connector) => {
    setLoadingConnector(connector.id);
    connect.connect({ connector });
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="sm">
      {account.isConnected ? (
        <div>
          {/* Header */}
          <h2 className="text-2xl font-semibold text-center text-white mb-6">
            Wallet Connected
          </h2>

          {/* Account Details */}
          <div className="bg-main-bg/30 rounded-lg p-4 mb-6 border border-white/10">
            {/* Wallet Provider */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <span className="text-sm text-main-link">Wallet Provider</span>
              <div className="flex items-center gap-2">
                <img
                  src={getWalletIcon(account.connector?.id || "")}
                  alt="Wallet icon"
                  className="w-5 h-5 rounded"
                />
                <span className="font-medium text-white text-sm">
                  {account.connector?.name || "Unknown Wallet"}
                </span>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <span className="text-sm text-main-link">Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success-bg rounded-full"></div>
                <span className="font-medium text-white text-sm capitalize">
                  {account.status}
                </span>
              </div>
            </div>

            {/* Network */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <span className="text-sm text-main-link">Network</span>
              <span className="font-medium text-white text-sm">
                {account.chain?.name || "Unknown Network"}
              </span>
            </div>

            {/* Chain ID */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <span className="text-sm text-main-link">Chain ID</span>
              <span className="font-medium text-sm">#{account.chainId}</span>
            </div>

            {/* Wallet Address */}
            <div>
              <div className="text-sm text-main-link mb-2">Wallet Address</div>
              <div className="font-mono rounded px-3 py-3 text-xs break-all border border-white/10">
                {account.address}
              </div>
            </div>
          </div>

          <Button
            onClick={() => {
              disconnect();
              onClose();
            }}
            variant="danger"
            className="w-full justify-center py-2.5 text-sm"
          >
            Disconnect Wallet
          </Button>
        </div>
      ) : (
        <div>
          <img
            src="/img/dexgood-logo.png"
            alt=""
            className="w-16 h-16 mx-auto mb-5"
          />
          <h1 className="text-xl mb-2 font-medium text-center leading-4">
            Connect Wallet
          </h1>
          <p className="text-center mb-5 text-main-link">
            Connect your wallet to DexGood
          </p>
          <div className="flex flex-col gap-2">
            {connect.connectors.map((connector) => (
              <Button
                key={connector.id}
                onClick={() => handleConnect(connector)}
                variant="transparent"
                disabled={connect.status === "pending"}
                className="w-full py-3 text-sm"
              >
                <img
                  src={getWalletIcon(connector.id)}
                  alt={`${connector.name} icon`}
                  className="w-6 h-6 me-1 rounded-sm"
                />
                <span className="font-medium">
                  {loadingConnector === connector.id &&
                  connect.status === "pending" ? (
                    <Spinner size="small" />
                  ) : (
                    `${connector.name}`
                  )}
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ModalConnectWallet;
