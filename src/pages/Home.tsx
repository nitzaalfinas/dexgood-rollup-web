import HeroSection from "@/components/home/Hero";
import BridgeSection from "@/components/home/BridgeSection";
import WhyUsSection from "@/components/home/WhyUs";
import NavBar from "@/components/layouts/NavBar";
import Footer from "@/components/layouts/Footer";
import { Box } from "@mui/material";

const HomePage = () => {

  return (
    <>
      <NavBar />
      <Box sx={{ minHeight: "100vh", width: "100vw" }}>
        <HeroSection />
        <BridgeSection />
        <WhyUsSection />

        {/* Community Section */}
        {/* <Box
        id="community"
        sx={{ maxWidth: 900, mx: "auto", mt: 6, px: 2, textAlign: "center" }}
      >
        <Typography variant="h5" fontWeight="bold" color="#FFFFFF" gutterBottom>
          Join Our Community
        </Typography>
        <Typography sx={{ mb: 2 }} color="#FFFFFF">
          Stay connected and join us on Telegram!
        </Typography>
        <Button
          variant="contained"
          sx={{
            background: "#0088cc",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: 2,
            px: 4,
            "&:hover": { background: "#0077b6" },
          }}
          href="https://t.me/dexgood"
          target="_blank"
        >
          Join Telegram
        </Button>
      </Box> */}
      </Box>
      <Footer />
    </>
  );
};

export default HomePage;
