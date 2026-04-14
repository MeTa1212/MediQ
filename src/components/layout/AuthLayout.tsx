import { ReactNode, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, HeartPulse, ShieldCheck, Stethoscope } from "lucide-react";
import { MedicalLoader } from "@/components/MedicalLoader";

interface AuthLayoutProps {
  children: ReactNode;
  theme?: "doctor" | "patient";
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  loadingMessage?: string;
}

type Orb = {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  alpha: number;
  phase: number;
  sway: number;
};

export default function AuthLayout({
  children,
  theme = "patient",
  title,
  subtitle,
  isLoading = false,
  loadingMessage = "Authenticating...",
}: AuthLayoutProps) {
  const isDoctor = theme === "doctor";
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId = 0;
    let width = 0;
    let height = 0;
    let time = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const mouse = {
      x: 0,
      y: 0,
      active: false,
      radius: 340,
    };

    let orbs: Orb[] = [];

    const palette = isDoctor
      ? ["#38bdf8", "#22d3ee", "#f472b6", "#a78bfa", "#60a5fa"]
      : ["#2dd4bf", "#34d399", "#f472b6", "#22c55e", "#67e8f9"];

    const hexToRgb = (hex: string) => {
      const cleaned = hex.replace("#", "");
      const bigint = parseInt(cleaned, 16);
      return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
      };
    };

    const createOrb = (): Orb => {
      const baseX = Math.random() * width;
      const baseY = Math.random() * height;

      return {
        baseX,
        baseY,
        x: baseX,
        y: baseY,
        vx: (Math.random() - 0.5) * 0.24,
        vy: (Math.random() - 0.5) * 0.2,
        r: 170 + Math.random() * 230,
        color: palette[Math.floor(Math.random() * palette.length)],
        alpha: 0.22 + Math.random() * 0.1,
        phase: Math.random() * Math.PI * 2,
        sway: 46 + Math.random() * 72,
      };
    };

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = width < 640 ? 6 : width < 1024 ? 7 : 8;
      orbs = Array.from({ length: count }, createOrb);
    };

    const drawOrb = (orb: Orb) => {
      const { r, g, b } = hexToRgb(orb.color);
      const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);

      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${orb.alpha})`);
      grad.addColorStop(0.28, `rgba(${r}, ${g}, ${b}, ${orb.alpha * 0.86})`);
      grad.addColorStop(0.58, `rgba(${r}, ${g}, ${b}, ${orb.alpha * 0.42})`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      ctx.beginPath();
      ctx.fillStyle = grad;
      ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = () => {
      time += 0.0082;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "screen";

      for (const orb of orbs) {
        const driftX = Math.sin(time + orb.phase) * orb.sway;
        const driftY = Math.cos(time * 1.18 + orb.phase) * (orb.sway * 0.84);

        orb.baseX += orb.vx;
        orb.baseY += orb.vy;

        if (orb.baseX < -orb.r * 0.35) orb.baseX = width + orb.r * 0.15;
        if (orb.baseX > width + orb.r * 0.35) orb.baseX = -orb.r * 0.15;
        if (orb.baseY < -orb.r * 0.35) orb.baseY = height + orb.r * 0.15;
        if (orb.baseY > height + orb.r * 0.35) orb.baseY = -orb.r * 0.15;

        let targetX = orb.baseX + driftX;
        let targetY = orb.baseY + driftY;

        if (mouse.active) {
          const dx = targetX - mouse.x;
          const dy = targetY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const safeDist = Math.max(dist, 0.001);
            const force = (mouse.radius - safeDist) / mouse.radius;
            const nx = dx / safeDist;
            const ny = dy / safeDist;

            targetX += nx * force * 145;
            targetY += ny * force * 145;
          }
        }

        orb.x += (targetX - orb.x) * 0.11;
        orb.y += (targetY - orb.y) * 0.11;

        drawOrb(orb);
      }

      ctx.globalCompositeOperation = "source-over";
      animationId = requestAnimationFrame(animate);
    };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      mouse.x = touch.clientX;
      mouse.y = touch.clientY;
      mouse.active = true;
    };

    const onLeave = () => {
      mouse.active = false;
    };

    const onResize = () => {
      init();
    };

    init();
    animate();

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("touchend", onLeave);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("touchend", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [isDoctor]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0f1c] px-4 py-8 text-white sm:px-6 lg:px-8">
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

        .animated-bg {
          background:
            linear-gradient(135deg, #070b14 0%, #0f1726 40%, #161b2d 100%);
        }

        .mesh-layer {
          background:
            radial-gradient(circle at 18% 22%, rgba(34, 211, 238, 0.16), transparent 24%),
            radial-gradient(circle at 82% 20%, rgba(244, 114, 182, 0.16), transparent 28%),
            radial-gradient(circle at 48% 82%, rgba(167, 139, 250, 0.14), transparent 24%),
            radial-gradient(circle at 70% 60%, rgba(59, 130, 246, 0.12), transparent 22%);
          background-size: 180% 180%;
          animation: gradientShift 9s ease-in-out infinite;
        }

        .glass-overlay {
          background:
            radial-gradient(circle at top, rgba(255,255,255,0.06), transparent 34%),
            linear-gradient(to bottom, rgba(255,255,255,0.02), rgba(0,0,0,0.10));
        }

        .ambient-glow {
          animation: floatPulse 5.5s ease-in-out infinite;
        }
      `}</style>

      <div className="animated-bg absolute inset-0" />
      <div className="mesh-layer absolute inset-0" />

      <div className="ambient-glow pointer-events-none absolute -left-24 top-[-5rem] h-[22rem] w-[22rem] rounded-full bg-cyan-400/10 blur-3xl" />
      <div
        className="ambient-glow pointer-events-none absolute right-[-6rem] top-[18%] h-[24rem] w-[24rem] rounded-full bg-fuchsia-400/10 blur-3xl"
        style={{ animationDelay: "1.2s" }}
      />
      <div
        className="ambient-glow pointer-events-none absolute bottom-[-7rem] left-[28%] h-[22rem] w-[22rem] rounded-full bg-violet-400/10 blur-3xl"
        style={{ animationDelay: "2s" }}
      />

      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full blur-[28px]"
      />

      <div className="pointer-events-none absolute inset-0 glass-overlay" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full items-stretch gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden lg:flex flex-col justify-between rounded-[32px] border border-zinc-400/10 bg-zinc-400/[0.08] p-10 text-white shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-md xl:p-12">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-300/10 bg-zinc-300/[0.07] px-4 py-2 text-sm font-medium text-white/90 transition-all hover:bg-zinc-300/[0.11] backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>

              <div className="mt-10 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-300/[0.10] ring-1 ring-zinc-200/10 backdrop-blur-sm">
                  {isDoctor ? (
                    <Stethoscope className="h-7 w-7" />
                  ) : (
                    <HeartPulse className="h-7 w-7" />
                  )}
                </div>

                <div>
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.22em] ${
                      isDoctor ? "text-blue-200/90" : "text-emerald-200/90"
                    }`}
                  >
                    MediQ
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {isDoctor ? "Doctor Portal" : "Patient Portal"}
                  </h2>
                </div>
              </div>

              <div className="mt-12 max-w-md">
                <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
                  {isDoctor
                    ? "A cleaner, faster way to manage your clinic workflow."
                    : "Healthcare access that feels simple, calm, and personal."}
                </h1>
                <p className="mt-5 text-base leading-7 text-white/75">
                  {isDoctor
                    ? "Sign in to manage appointments, patient flow, prescriptions, and clinic insights in one polished workspace."
                    : "Book smarter, track your queue, receive prescriptions, and stay updated with one smooth experience."}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-300/10 bg-zinc-300/[0.07] p-5 backdrop-blur-sm">
                <p
                  className={`text-sm font-semibold ${
                    isDoctor ? "text-sky-200" : "text-emerald-200"
                  }`}
                >
                  Secure experience
                </p>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Protected access with dedicated doctor and patient journeys.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-300/10 bg-zinc-300/[0.07] p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    className={`h-4 w-4 ${
                      isDoctor ? "text-blue-200" : "text-teal-200"
                    }`}
                  />
                  <p
                    className={`text-sm font-semibold ${
                      isDoctor ? "text-blue-200" : "text-teal-200"
                    }`}
                  >
                    Trusted workflow
                  </p>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Built for smoother clinic operations and a better care experience.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-xl">
              <div className="mb-4 lg:hidden">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-300/10 bg-zinc-300/[0.08] px-4 py-2 text-sm font-medium text-white/90 shadow-sm backdrop-blur-sm transition hover:bg-zinc-300/[0.12]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to home
                </Link>
              </div>

              <div className="relative overflow-hidden rounded-[32px] border border-zinc-300/10 bg-zinc-300/[0.08] shadow-[0_18px_45px_-18px_rgba(0,0,0,0.28)] backdrop-blur-md">
                <div className="p-6 sm:p-8 md:p-10">
                  <div className="mb-8">
                    <div
                      className={`mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] backdrop-blur-sm shadow-sm ${
                        isDoctor
                          ? "border border-blue-400/25 bg-blue-500/18 text-blue-50"
                          : "border border-emerald-400/25 bg-emerald-500/18 text-emerald-50"
                      }`}
                    >
                      {isDoctor ? "Doctor access" : "Patient access"}
                    </div>

                    {title && (
                      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-[2rem]">
                        {title}
                      </h1>
                    )}

                    {subtitle && (
                      <p className="mt-3 max-w-lg text-[15px] leading-7 text-white/65 sm:text-base">
                        {subtitle}
                      </p>
                    )}
                  </div>

                  <div className="relative overflow-hidden rounded-[24px] border border-zinc-300/10 bg-zinc-300/[0.04] p-5 backdrop-blur-sm sm:p-6">
                    {children}
                    {isLoading && (
                      <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0a0f1c]/80 backdrop-blur-sm rounded-[24px]">
                        <div className="-mt-8 scale-75 sm:scale-100">
                          <MedicalLoader message={loadingMessage} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="mt-4 text-center text-xs leading-6 text-white/40">
                By continuing, you agree to a secure and role-based access flow for
                MediQ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}