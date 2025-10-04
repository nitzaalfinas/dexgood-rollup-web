import { Outlet, useLocation } from "react-router-dom";
import Footer from "@/components/layouts/Footer";
import Navbar from "@/components/layouts/NavBar";

const DefaultLayout = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const homePage = location.pathname === "/";

  return (
    <>
      <Navbar />

      {/* Diberi padding top karena navbar yang sticky dan memiliki tinggi 55px */}
      <main className={`${!homePage ? "pt-[55px]" : ""}`}>
        <Outlet />
      </main>

      {!isAdmin && <Footer />}
    </>
  );
};

export default DefaultLayout;
