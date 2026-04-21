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
    const closeTimer = setTimeout(() => { setIntroClosing(true); }, 1550);
    const removeTimer = setTimeout(() => { setShowIntro(false); }, 2350);
    return () => { clearTimeout(closeTimer); clearTimeout(removeTimer); };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#080e1a] text-white">
      <style>{`
        /* ── Intro animation ─────────────────────── */
        @keyframes ecgDraw {
          from { stroke-dashoffset: 1000; }
          to   { stroke-dashoffset: 0;    }
        }
        @keyframes introFadeOut {
          0%   { opacity: 1; transform: scale(1);    filter: blur(0px);   }
          100% { opacity: 0; transform: scale(1.06); filter: blur(8px);   }
        }

        .intro-screen {
          position: fixed;
          inset: 0;
          z-index: 60;
          background: #080e1a;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .intro-screen.closing {
          animation: introFadeOut 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .ecg-svg {
          width: 100vw;
          max-width: 700px;
          height: 160px;
          overflow: visible;
          filter: drop-shadow(0 0 12px rgba(59,130,246,0.3));
        }
        .ecg-line {
          fill: none;
          stroke: url(#ecgGrad);
          stroke-width: 2.5;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: ecgDraw 1.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        /* ── Landing reveal ──────────────────────── */
        @keyframes landingReveal {
          from { opacity: 0; transform: translateY(6px) scale(0.99); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0) scale(1);       filter: blur(0px); }
        }
        .landing-reveal {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          width: 100%;
          animation: landingReveal 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-play-state: ${showIntro ? "paused" : "running"};
        }

        /* ── Ambient background ──────────────────── */
        @keyframes bgDrift {
          0%, 100% { transform: scale(1)   translateY(0);   }
          50%       { transform: scale(1.04) translateY(-6px); }
        }
        .orb-a {
          animation: bgDrift 12s ease-in-out infinite;
        }
        .orb-b {
          animation: bgDrift 15s ease-in-out infinite reverse;
          animation-delay: 2s;
        }
        .orb-c {
          animation: bgDrift 18s ease-in-out infinite;
          animation-delay: 5s;
        }

        /* ── Buttons ─────────────────────────────── */
        .cta-btn {
          position: relative;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.625rem;
          font-weight: 600;
          font-size: 0.875rem;
          border-radius: 0.875rem;
          padding: 0.875rem 2rem;
          min-width: 200px;
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: all 0.2s ease;
          color: white;
        }
        .cta-btn:hover {
          transform: translateY(-2px);
          border-color: rgba(255,255,255,0.18);
        }
        .cta-btn:active {
          transform: translateY(0);
        }
        .cta-btn-blue {
          background: rgba(59,130,246,0.22);
          box-shadow: 0 4px 20px rgba(59,130,246,0.18), inset 0 1px 0 rgba(255,255,255,0.10);
        }
        .cta-btn-blue:hover {
          background: rgba(59,130,246,0.30);
          box-shadow: 0 8px 28px rgba(59,130,246,0.28), inset 0 1px 0 rgba(255,255,255,0.14);
        }
        .cta-btn-green {
          background: rgba(34,197,94,0.16);
          box-shadow: 0 4px 20px rgba(34,197,94,0.14), inset 0 1px 0 rgba(255,255,255,0.10);
        }
        .cta-btn-green:hover {
          background: rgba(34,197,94,0.24);
          box-shadow: 0 8px 28px rgba(34,197,94,0.22), inset 0 1px 0 rgba(255,255,255,0.14);
        }

        /* ── Feature cards ───────────────────────── */
        .feature-card {
          position: relative;
          overflow: hidden;
          border-radius: 1.25rem;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.04);
          padding: 1.5rem;
          text-align: left;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.25);
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .feature-card::before {
          content: "";
          position: absolute;
          inset-inline: 1rem;
          top: 0;
          height: 1px;
          background: rgba(255,255,255,0.09);
          border-radius: 99px;
        }
        .feature-card:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.055);
          box-shadow: 0 2px 6px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.32);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1rem;
          margin-top: 3.5rem;
        }
        @media (max-width: 1079px) { .features-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 600px)  { .features-grid { grid-template-columns: 1fr; gap: 0.75rem; } }
      `}</style>

      {/* ── Intro Screen ─────────────────────────────── */}
      {showIntro && (
        <div className={`intro-screen ${introClosing ? "closing" : ""}`}>
          <svg
            className="ecg-svg"
            viewBox="0 0 700 160"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#3b82f6" stopOpacity="0.6" />
                <stop offset="50%"  stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.7" />
              </linearGradient>
            </defs>
            <path
              className="ecg-line"
              pathLength="1000"
              d="M-20 80 L220 80 L270 80 L305 80 L320 30 L340 128 L355 18 L370 80 L420 80 L720 80"
            />
          </svg>
        </div>
      )}

      {/* ── Main Landing ──────────────────────────────── */}
      <div className="landing-reveal">
        {/* Ambient orbs — very low opacity */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="orb-a absolute -left-32 -top-24 h-[30rem] w-[30rem] rounded-full bg-blue-500/[0.06] blur-3xl" />
          <div className="orb-b absolute right-[-8rem] top-[15%] h-[28rem] w-[28rem] rounded-full bg-indigo-500/[0.05] blur-3xl" />
          <div className="orb-c absolute bottom-[-8rem] left-[30%] h-[26rem] w-[26rem] rounded-full bg-emerald-500/[0.05] blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative mx-auto flex min-h-screen max-w-[1200px] flex-col items-center justify-center px-6 py-12 sm:px-8 text-center">

          {/* Brand lockup */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
            {/* Logo mark */}
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.12] bg-white/[0.07] shadow-[0_8px_24px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:h-20 sm:w-20 sm:rounded-[1.4rem]">
              <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-white/[0.20]" />
              <Activity className="relative z-10 h-8 w-8 text-white sm:h-10 sm:w-10" strokeWidth={1.75} />
            </div>
            <h1 className="text-[3.75rem] font-bold tracking-tighter text-white sm:text-[5rem] lg:text-[6rem]">
              MediQ
            </h1>
          </div>

          {/* Eyebrow label */}
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/35 sm:text-xs">
            Smart Clinic Platform
          </p>

          {/* Subtitle */}
          <p className="mx-auto mt-7 max-w-2xl text-sm leading-8 text-white/45 sm:text-base sm:leading-9">
            Smarter clinic operations for doctors and a smoother care journey for patients — from appointments and digital prescriptions to reminders, queue visibility, and real-time updates.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Link to="/login/doctor" className="cta-btn cta-btn-blue">
              <Stethoscope className="h-4 w-4 opacity-80" />
              <span>Doctor Login</span>
            </Link>
            <Link to="/login/patient" className="cta-btn cta-btn-green">
              <Smartphone className="h-4 w-4 opacity-80" />
              <span>Patient Login</span>
            </Link>
          </div>

          {/* Feature cards */}
          <div className="features-grid w-full">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.label} className="feature-card">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.06]">
                    <Icon className="h-4 w-4 text-white/60" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-sm font-semibold text-white/85">{feature.label}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/40">{feature.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Trust badge */}
          <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-2 text-[11px] font-medium text-white/30 backdrop-blur-md">
            <Shield className="h-3.5 w-3.5 text-white/25" />
            <span>Secure · Role-based access · Built for modern clinics</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Landing;