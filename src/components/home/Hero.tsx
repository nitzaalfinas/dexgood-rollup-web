import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-screen min-h-[600px] md:min-h-[700px] lg:min-h-[800px] bg-[url('/img/landing/hero-background-05.jpg')] bg-cover bg-center bg-no-repeat flex items-center justify-center overflow-hidden">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent"></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-main/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-purple-500/15 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight animate-fadeInUp delay-300">
              <span className="block text-white">Your Gateway To The</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-main via-orange-400 to-yellow-400">
                FUTURE WORLD
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="max-w-2xl text-lg md:text-xl mx-auto leading-relaxed tracking-wider animate-fadeInUp delay-500 text-gray-200">
            Trading digital assets and physical tokens using modern technology
            with <span className="text-main font-semibold">web3</span> and{" "}
            <span className="text-main font-semibold">blockchain</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8 animate-fadeInUp delay-700">
            <button
              onClick={() => navigate('/bridge')}
              className="group relative px-6 py-3 bg-gradient-to-r from-main to-orange-500 text-white font-medium rounded-full overflow-hidden transition-all duration-300 hover:cursor-pointer hover:shadow-2xl hover:shadow-main/25 hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2 text-lg tracking-wider">
                Use Bridge
                <ArrowForwardIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-main opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 animate-fadeInUp delay-1000">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                10K+
              </div>
              <div className="text-gray-300 text-sm">Active Traders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                $2.5B+
              </div>
              <div className="text-gray-300 text-sm">Trading Volume</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                24/7
              </div>
              <div className="text-gray-300 text-sm">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-white/70"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
