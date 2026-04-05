import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Stethoscope,
  Smartphone,
  Shield,
  Clock,
  FileText,
  Bell,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: Clock,
    label: "Smart Queue",
    desc: "Priority-based queue management with real-time tracking",
  },
  {
    icon: FileText,
    label: "Digital Prescriptions",
    desc: "Generate and share prescriptions digitally",
  },
  {
    icon: TrendingUp,
    label: "Outbreak Detection",
    desc: "Track symptom trends and detect outbreaks early",
  },
  {
    icon: Bell,
    label: "Medicine Reminders",
    desc: "Patients get timely reminders for their medicines",
  },
];

const Landing = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [introClosing, setIntroClosing] = useState(false);

  useEffect(() => {
    const closeTimer = setTimeout(() => {
      setIntroClosing(true);
    }, 1550);

    const removeTimer = setTimeout(() => {
      setShowIntro(false);
    }, 2450);

    return () => {
      clearTimeout(closeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#08111f] text-white">
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes floatPulse {
          0%, 100% {
            transform: scale(1) translateY(0px);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.05) translateY(-10px);
            opacity: 1;
          }
        }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.08); }
          66% { transform: translate(-20px, 20px) scale(0.92); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        @keyframes fadeUp {
          0% {
            opacity: 0;
            transform: translateY(24px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shineSweep {
          0% {
            transform: translateX(-130%) skewX(-18deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          100% {
            transform: translateX(180%) skewX(-18deg);
            opacity: 0;
          }
        }

        @keyframes introWaveDraw {
          from {
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes introZoomFade {
          0% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0px);
          }
          100% {
            opacity: 0;
            transform: scale(1.14);
            filter: blur(10px);
          }
        }

        .animated-bg {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(135deg, #07101b 0%, #0c1625 42%, #12192b 100%);
        }

        .mesh-layer {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 14% 24%, rgba(34, 211, 238, 0.18), transparent 24%),
            radial-gradient(circle at 86% 22%, rgba(34, 197, 94, 0.12), transparent 28%),
            radial-gradient(circle at 50% 84%, rgba(59, 130, 246, 0.14), transparent 24%),
            radial-gradient(circle at 72% 58%, rgba(16, 185, 129, 0.10), transparent 22%);
          background-size: 180% 180%;
          animation: gradientShift 9s ease-in-out infinite;
        }

        .glass-overlay {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at top, rgba(255,255,255,0.06), transparent 34%),
            linear-gradient(to bottom, rgba(255,255,255,0.02), rgba(0,0,0,0.12));
        }

        .ambient-glow {
          animation: floatPulse 5.5s ease-in-out infinite;
        }

        .blob-orb {
          animation: blob 15s infinite ease-in-out;
        }

        .blob-delay-1 {
          animation-delay: 1.8s;
        }

        .blob-delay-2 {
          animation-delay: 3.6s;
        }

        .fade-up {
          animation: fadeUp 0.85s ease forwards;
        }

        .hero-logo-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .hero-logo-core {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 5rem;
          height: 5rem;
          border-radius: 1.75rem;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.10);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow:
            0 14px 34px rgba(0, 0, 0, 0.24),
            inset 0 1px 0 rgba(255, 255, 255, 0.16);
          overflow: hidden;
        }

        .hero-logo-core::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom right,
            rgba(255,255,255,0.18),
            rgba(255,255,255,0.04) 36%,
            rgba(255,255,255,0.01)
          );
        }

        .hero-logo-core::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top left, rgba(255,255,255,0.22), transparent 42%);
          opacity: 0.95;
        }

        .hero-logo-ring {
          position: absolute;
          inset: -12px;
          border-radius: 2rem;
          background: radial-gradient(circle, rgba(34,211,238,0.18), rgba(59,130,246,0.08), transparent 72%);
          filter: blur(18px);
          z-index: 0;
        }

        .glass-button {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.24);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          transition: all 0.32s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow:
            0 18px 44px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255,255,255,0.18);
        }

        .glass-button::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom right,
            rgba(255,255,255,0.34),
            rgba(255,255,255,0.12) 35%,
            rgba(255,255,255,0.04)
          );
          pointer-events: none;
        }

        .glass-button::after {
          content: "";
          position: absolute;
          top: -20%;
          left: -30%;
          width: 55%;
          height: 160%;
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.22) 50%,
            rgba(255,255,255,0) 100%
          );
          transform: translateX(-130%) skewX(-18deg);
          pointer-events: none;
        }

        .glass-button:hover::after {
          animation: shineSweep 0.95s ease;
        }

        .glass-button-blue {
          background:
            linear-gradient(135deg, rgba(37,99,235,0.68), rgba(14,165,233,0.48));
          box-shadow:
            0 22px 52px rgba(37, 99, 235, 0.34),
            0 10px 24px rgba(14, 165, 233, 0.16),
            inset 0 1px 0 rgba(255,255,255,0.22);
        }

        .glass-button-blue:hover {
          transform: translateY(-3px) scale(1.035);
          border-color: rgba(255,255,255,0.30);
          background:
            linear-gradient(135deg, rgba(37,99,235,0.82), rgba(6,182,212,0.60));
          box-shadow:
            0 28px 65px rgba(37, 99, 235, 0.44),
            0 12px 28px rgba(6, 182, 212, 0.22),
            inset 0 1px 0 rgba(255,255,255,0.28);
        }

        .glass-button-green {
          background:
            linear-gradient(135deg, rgba(5,150,105,0.70), rgba(16,185,129,0.50));
          box-shadow:
            0 22px 52px rgba(5, 150, 105, 0.34),
            0 10px 24px rgba(16, 185, 129, 0.16),
            inset 0 1px 0 rgba(255,255,255,0.22);
        }

        .glass-button-green:hover {
          transform: translateY(-3px) scale(1.035);
          border-color: rgba(255,255,255,0.30);
          background:
            linear-gradient(135deg, rgba(5,150,105,0.84), rgba(34,197,94,0.60));
          box-shadow:
            0 28px 65px rgba(5, 150, 105, 0.42),
            0 12px 28px rgba(34, 197, 94, 0.22),
            inset 0 1px 0 rgba(255,255,255,0.28);
        }

        .intro-screen {
          position: fixed;
          inset: 0;
          z-index: 60;
          background:
            linear-gradient(135deg, #040916 0%, #09111f 45%, #0c1625 100%);
          overflow: hidden;
        }

        .intro-screen.closing {
          animation: introZoomFade 0.9s ease forwards;
        }

        .intro-wave-layer {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }

        .intro-wave-svg {
          width: 100vw;
          height: 320px;
          overflow: visible;
          filter:
            drop-shadow(0 0 18px rgba(59, 130, 246, 0.24))
            drop-shadow(0 0 28px rgba(34, 197, 94, 0.16));
        }

        .intro-wave-line {
          fill: none;
          stroke: url(#waveGradient);
          stroke-width: 9;
          stroke-linecap: round;
          stroke-linejoin: round;
          pathLength: 1000;
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: introWaveDraw 1.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .landing-reveal {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          width: 100%;
          opacity: ${showIntro ? 0 : 1};
          transform: ${showIntro ? "scale(0.985)" : "scale(1)"};
          filter: ${showIntro ? "blur(6px)" : "blur(0px)"};
          transition:
            opacity 0.75s ease,
            transform 0.75s ease,
            filter 0.75s ease;
        }

        .landing-shell {
          position: relative;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.25rem;
        }

        .landing-content {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          text-align: center;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1.5rem;
          margin-top: 3.5rem;
        }

        @media (max-width: 1279px) {
          .features-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .hero-logo-core {
            width: 4.25rem;
            height: 4.25rem;
            border-radius: 1.4rem;
          }

          .landing-shell {
            padding: 1.5rem 1rem 2.5rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .intro-wave-svg {
            height: 220px;
          }

          .intro-wave-line {
            stroke-width: 7;
          }
        }
      `}</style>

      {showIntro && (
        <div className={`intro-screen ${introClosing ? "closing" : ""}`}>
          <div className="intro-wave-layer">
            <svg
              className="intro-wave-svg"
              viewBox="0 0 1600 320"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="52%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>

              <path
                className="intro-wave-line"
                pathLength="1000"
                d="M-40 160
                   L500 160
                   L610 160
                   L700 72
                   L790 245
                   L885 48
                   L980 160
                   L1640 160"
              />
            </svg>
          </div>
        </div>
      )}

      <div className="landing-reveal">
        <div className="animated-bg" />
        <div className="mesh-layer" />

        <div className="ambient-glow pointer-events-none absolute -left-24 top-[-5rem] h-[22rem] w-[22rem] rounded-full bg-cyan-400/10 blur-3xl" />
        <div
          className="ambient-glow pointer-events-none absolute right-[-6rem] top-[18%] h-[24rem] w-[24rem] rounded-full bg-emerald-400/10 blur-3xl"
          style={{ animationDelay: "1.2s" }}
        />
        <div
          className="ambient-glow pointer-events-none absolute bottom-[-7rem] left-[28%] h-[22rem] w-[22rem] rounded-full bg-blue-500/10 blur-3xl"
          style={{ animationDelay: "2s" }}
        />

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="blob-orb absolute -left-28 top-[-6rem] h-[24rem] w-[24rem] rounded-full bg-cyan-400/12 blur-3xl" />
          <div className="blob-orb blob-delay-1 absolute right-[-8rem] top-[20%] h-[26rem] w-[26rem] rounded-full bg-blue-500/12 blur-3xl" />
          <div className="blob-orb blob-delay-2 absolute bottom-[-8rem] left-[36%] h-[22rem] w-[22rem] rounded-full bg-emerald-400/10 blur-3xl" />
        </div>

        <div className="glass-overlay" />

        <div className="landing-shell">
          <div className="landing-content fade-up">
            <div className="flex flex-col items-center justify-center">
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <div className="hero-logo-wrap shrink-0">
                  <div className="hero-logo-ring" />
                  <div className="hero-logo-core">
                    <span className="absolute inset-x-4 top-0 h-px bg-white/45" />
                    <Activity className="relative z-10 h-9 w-9 text-white" />
                  </div>
                </div>

                <h1 className="text-6xl font-extrabold tracking-tight text-white sm:text-7xl lg:text-8xl">
                  MediQ
                </h1>
              </div>

              <p className="mt-3 text-center text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200/85 sm:text-base">
                SMART CLINIC PLATFORM
              </p>
            </div>

            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/72 sm:text-lg">
              Smarter clinic operations for doctors and a smoother care journey for
              patients — from appointments and digital prescriptions to reminders,
              queue visibility, and real-time updates.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/login/doctor"
                className="glass-button glass-button-blue inline-flex min-w-[230px] items-center justify-center gap-3 rounded-2xl px-9 py-4 text-base font-bold text-white"
              >
                <span className="absolute inset-x-4 top-0 h-px bg-white/55" />
                <span className="absolute inset-y-2 left-0 w-px bg-white/24" />
                <Stethoscope className="relative z-10 h-5 w-5 text-white drop-shadow-[0_1px_4px_rgba(255,255,255,0.18)]" />
                <span className="relative z-10 text-white [text-shadow:0_1px_8px_rgba(255,255,255,0.16)]">
                  Doctor Login
                </span>
              </Link>

              <Link
                to="/login/patient"
                className="glass-button glass-button-green inline-flex min-w-[230px] items-center justify-center gap-3 rounded-2xl px-9 py-4 text-base font-bold text-white"
              >
                <span className="absolute inset-x-4 top-0 h-px bg-white/55" />
                <span className="absolute inset-y-2 left-0 w-px bg-white/24" />
                <Smartphone className="relative z-10 h-5 w-5 text-white drop-shadow-[0_1px_4px_rgba(255,255,255,0.18)]" />
                <span className="relative z-10 text-white [text-shadow:0_1px_8px_rgba(255,255,255,0.16)]">
                  Patient Login
                </span>
              </Link>
            </div>

            <div className="features-grid">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.label}
                    className="relative overflow-hidden rounded-[28px] border border-zinc-300/10 bg-zinc-300/[0.08] p-6 text-left shadow-[0_16px_40px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:bg-zinc-300/[0.11] hover:shadow-[0_20px_48px_rgba(0,0,0,0.24)]"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.08),rgba(255,255,255,0.015))] pointer-events-none" />
                    <div className="absolute inset-x-5 top-0 h-px bg-white/25" />
                    <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md">
                      <Icon className="h-5 w-5 text-white/90" />
                    </div>
                    <h3 className="relative text-sm font-bold text-white">
                      {feature.label}
                    </h3>
                    <p className="relative mt-2 text-sm leading-6 text-white/62">
                      {feature.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 inline-flex items-center gap-2 rounded-full border border-zinc-300/10 bg-zinc-300/[0.06] px-4 py-2 text-xs font-medium text-white/50 backdrop-blur-md">
              <Shield className="h-4 w-4" />
              <span>Secure · Role-based access · Built for modern clinics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;