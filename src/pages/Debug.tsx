import React from 'react';
import TokenDebugger from '@/components/debug/TokenDebugger';
import NavBar from '@/components/layouts/NavBar';
import { Box } from '@mui/material';

const DebugPage: React.FC = () => {
  return (
    <>
      <NavBar />
      <Box sx={{ minHeight: "100vh", width: "100vw", py: 4 }}>
        <TokenDebugger />
      </Box>
    </>
  );
};

export default DebugPage;