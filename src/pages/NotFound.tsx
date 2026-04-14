import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Activity, Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0f1c] text-white flex items-center justify-center p-6">
      <style>{`
        .animated-bg {
          background: linear-gradient(135deg, #070b14 0%, #0f1726 40%, #161b2d 100%);
        }
        .ambient-glow {
          animation: floatPulse 5.5s ease-in-out infinite;
        }
        @keyframes floatPulse {
          0%, 100% { transform: scale(1) translateY(0px); opacity: 0.9; }
          50% { transform: scale(1.05) translateY(-10px); opacity: 1; }
        }
      `}</style>
      
      <div className="animated-bg absolute inset-0" />
      <div className="ambient-glow pointer-events-none absolute -left-20 top-[-5rem] h-[20rem] w-[20rem] rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="ambient-glow pointer-events-none absolute right-[-5rem] bottom-[-5rem] h-[22rem] w-[22rem] rounded-full bg-blue-500/10 blur-3xl" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 w-full max-w-xl text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl mb-8 relative">
           <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none rounded-[24px]" />
           <Search className="h-10 w-10 text-white/50" />
        </div>
        
        <h1 className="text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40 mb-2">404</h1>
        <h2 className="text-2xl font-bold mb-4">Page not found</h2>
        
        <p className="text-white/60 mb-10 max-w-md mx-auto leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track to your healthcare portal.
        </p>

        <Link 
          to="/" 
          className="inline-flex items-center gap-2 rounded-2xl bg-white/10 border border-white/20 px-6 py-4 font-semibold hover:bg-white/15 transition-all duration-300 shadow-[0_10px_24px_rgba(0,0,0,0.2)]"
        >
          <Home className="w-5 h-5 text-blue-400" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
