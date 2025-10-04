import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect, Connector } from "wagmi";
import {
  Typography,
  Button,
  Box,
} from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  minWidth: "300px",
  borderRadius: `calc(8px + 8px)`,
  border: "1px solid",
  borderColor: "hsla(220, 20%, 80%, 0.4)",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const Settings = () => {
  const account = useAccount();
  const connect = useConnect();
  const { disconnect } = useDisconnect();
  const [loadingConnector, setLoadingConnector] = useState<string | null>(null);

  const handleConnect = (connector: Connector) => {
    setLoadingConnector(connector.id);
    connect.connect({ connector });
  };

  useEffect(() => {
    if (connect.error?.message) console.error(connect.error.message);
  }, [connect.error]);

  return (
    <Box sx={style}>
      {account.isConnected ? (
        <>
          {/* Account */}
          <Typography variant="h6" component="h2" align="center" gutterBottom>
            Account
          </Typography>

          <div style={{marginBottom: '1.5rem'}}>
            <Typography variant="body1">
              <strong>Status:</strong> {account.status}
            </Typography>
            <Typography variant="body1">
              <strong>Address:</strong> {account.address}
            </Typography>
            <Typography variant="body1">
              <strong>Chain ID:</strong> {account.chainId}
            </Typography>
            <Typography variant="body1">
              <strong>Connected to:</strong> {account.connector?.name}
            </Typography>
          </div>

          <Button
            onClick={() => disconnect()}
            variant="contained"
            color="error"
            fullWidth
          >
            Disconnect
          </Button>
        </>
      ) : (
        <>
          {/* Connect Wallet */}
          <Typography variant="h6" component="h2" align="center" gutterBottom>
            Connect Wallet
          </Typography>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
          >
            {connect.connectors.map((connector) => (
              <Button
                onClick={() => handleConnect(connector)}
                key={connector.id}
                variant="outlined"
                loading={
                  loadingConnector === connector.id &&
                  connect.status === "pending"
                }
                disabled={connect.status === "pending"}
                fullWidth
              >
                {connector.name}
              </Button>
            ))}
          </div>
        </>
      )}
    </Box>
  );
};

export default Settings;
