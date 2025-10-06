import { useLayoutEffect, PropsWithChildren } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import AppTheme from "./theme/AppTheme";

import HomePage from "@/pages/Home";
import DebugPage from "@/pages/Debug";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import Toast from "@/components/ui/Toast";

const Wrapper = ({ children }: PropsWithChildren) => {
  const location = useLocation();
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" }); // "instant" -> "auto"
  }, [location.pathname]);
  return <>{children}</>;
};

const App = (props: { disableCustomTheme?: boolean }) => (
  <Wrapper>
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Toast />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/debug" element={<DebugPage />} />
        {/* 404 */}
        <Route path="*" element={<div>Halaman tidak ditemukan</div>} />
      </Routes>
    </AppTheme>
  </Wrapper>
);

export default App;