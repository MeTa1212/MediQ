import { Link } from "react-router-dom";
import { Stethoscope, Smartphone, Activity, ArrowLeft } from "lucide-react";

export default function SignUp() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0f1c] px-6 py-10 text-white">
      <style>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes floatGlow {
          0%, 100% {
            transform: translateY(0px) scale(1);
            opacity: 0.85;
          }
          50% {
            transform: translateY(-12px) scale(1.04);
            opacity: 1;
          }
        }

        .page-bg {
          background:
            linear-gradient(135deg, #070b14 0%, #0f1726 45%, #161b2d 100%);
        }

        .mesh-layer {
          background:
            radial-gradient(circle at 18% 20%, rgba(34, 211, 238, 0.16), transparent 24%),
            radial-gradient(circle at 82% 18%, rgba(244, 114, 182, 0.15), transparent 28%),
            radial-gradient(circle at 52% 82%, rgba(16, 185, 129, 0.12), transparent 24%),
            radial-gradient(circle at 68% 58%, rgba(96, 165, 250, 0.12), transparent 24%);
          background-size: 180% 180%;
          animation: gradientShift 10s ease-in-out infinite;
        }

        .ambient-glow {
          animation: floatGlow 5.8s ease-in-out infinite;
        }

        .grid-mask {
          background-image:
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: radial-gradient(circle at center, black 35%, transparent 85%);
          -webkit-mask-image: radial-gradient(circle at center, black 35%, transparent 85%);
        }
      `}</style>

      <div className="page-bg absolute inset-0" />
      <div className="mesh-layer absolute inset-0" />
      <div className="grid-mask pointer-events-none absolute inset-0 opacity-50" />

      <div className="ambient-glow pointer-events-none absolute left-[-5rem] top-[-4rem] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      <div
        className="ambient-glow pointer-events-none absolute right-[-4rem] top-[15%] h-80 w-80 rounded-full bg-fuchsia-400/10 blur-3xl"
        style={{ animationDelay: "1.2s" }}
      />
      <div
        className="ambient-glow pointer-events-none absolute bottom-[-5rem] left-[28%] h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative z-10 w-full max-w-xl">
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 backdrop-blur-sm transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.06] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="p-7 sm:p-9">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10 backdrop-blur-sm">
                <Activity className="h-7 w-7 text-white" />
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Join MediQ
              </h1>
              <p className="mt-3 text-sm text-white/65 sm:text-base">
                Choose your account type to get started
              </p>
            </div>

            <div className="space-y-4">
              <Link
                to="/signup/doctor"
                className="group flex items-center rounded-[24px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all hover:border-sky-400/30 hover:bg-white/[0.08] hover:shadow-sky-500/10"
              >
                <div className="mr-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300 ring-1 ring-sky-300/15 transition-transform duration-300 group-hover:scale-110">
                   <Stethoscope className="h-6 w-6" />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    Healthcare Provider
                  </h3>
                  <p className="mt-1 text-sm text-white/60">
                    Manage queues, patients, and clinic workflow
                  </p>
                </div>
              </Link>

              <Link
                to="/signup/patient"
                className="group flex items-center rounded-[24px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all hover:border-emerald-400/30 hover:bg-white/[0.08] hover:shadow-emerald-500/10"
              >
                <div className="mr-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-300/15 transition-transform duration-300 group-hover:scale-110">
                   <Smartphone className="h-6 w-6" />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    Patient Access
                  </h3>
                  <p className="mt-1 text-sm text-white/60">
                    Book appointments and track your care journey
                  </p>
                </div>
              </Link>
            </div>

            <div className="flex flex-col items-center gap-3 mt-8">
              <p className="text-sm text-white/55">
                Already have an account?{" "}
                <Link
                  to="/login/patient"
                  className="font-semibold text-white transition hover:text-white/80"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}