import { ReactNode, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, HeartPulse, ShieldCheck, Stethoscope } from "lucide-react";
import { MedicalLoader } from "@/components/MedicalLoader";

interface AuthLayoutProps {
  children: ReactNode;
  theme?: "doctor" | "patient" | "admin";
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
  const isAdmin = theme === "admin";
  const isClinicalTheme = isDoctor || isAdmin;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const portalName = isAdmin
    ? "Admin Portal"
    : isDoctor
      ? "Doctor Portal"
      : "Patient Portal";

  const heroHeadline = isAdmin
    ? "Oversee approvals and keep your clinic access secure."
    : isDoctor
      ? "A cleaner, faster way to manage your clinic workflow."
      : "Healthcare access that feels simple, calm, and personal.";

  const heroCopy = isAdmin
    ? "Sign in to review doctor applications, manage account access, and keep your operations controlled from one secure workspace."
    : isDoctor
      ? "Sign in to manage appointments, patient flow, prescriptions, and clinic insights in one polished workspace."
      : "Book smarter, track your queue, receive prescriptions, and stay updated with one smooth experience.";

  const accessChipLabel = isAdmin
    ? "Admin access"
    : isDoctor
      ? "Doctor access"
      : "Patient access";

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

    const mouse = { x: 0, y: 0, active: false, radius: 340 };
    let orbs: Orb[] = [];

    // Significantly reduced alpha — softer, less saturated
    const palette = isClinicalTheme
      ? ["#3b82f6", "#38bdf8", "#818cf8", "#60a5fa", "#6366f1"]
      : ["#2dd4bf", "#34d399", "#22c55e", "#67e8f9", "#4ade80"];

    const hexToRgb = (hex: string) => {
      const cleaned = hex.replace("#", "");
      const bigint = parseInt(cleaned, 16);
      return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
    };

    const createOrb = (): Orb => {
      const baseX = Math.random() * width;
      const baseY = Math.random() * height;
      return {
        baseX, baseY, x: baseX, y: baseY,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.15,
        r: 180 + Math.random() * 220,
        color: palette[Math.floor(Math.random() * palette.length)],
        alpha: 0.07 + Math.random() * 0.06,   // was 0.22 + 0.10 — now much softer
        phase: Math.random() * Math.PI * 2,
        sway: 40 + Math.random() * 60,
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
      const count = width < 640 ? 5 : width < 1024 ? 6 : 7;
      orbs = Array.from({ length: count }, createOrb);
    };

    const drawOrb = (orb: Orb) => {
      const { r, g, b } = hexToRgb(orb.color);
      const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
      grad.addColorStop(0,    `rgba(${r}, ${g}, ${b}, ${orb.alpha})`);
      grad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${orb.alpha * 0.7})`);
      grad.addColorStop(0.7,  `rgba(${r}, ${g}, ${b}, ${orb.alpha * 0.25})`);
      grad.addColorStop(1,    `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.beginPath();
      ctx.fillStyle = grad;
      ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = () => {
      time += 0.007;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "screen";

      for (const orb of orbs) {
        const driftX = Math.sin(time + orb.phase) * orb.sway;
        const driftY = Math.cos(time * 1.1 + orb.phase) * (orb.sway * 0.8);

        orb.baseX += orb.vx;
        orb.baseY += orb.vy;
        if (orb.baseX < -orb.r * 0.3) orb.baseX = width + orb.r * 0.1;
        if (orb.baseX > width + orb.r * 0.3) orb.baseX = -orb.r * 0.1;
        if (orb.baseY < -orb.r * 0.3) orb.baseY = height + orb.r * 0.1;
        if (orb.baseY > height + orb.r * 0.3) orb.baseY = -orb.r * 0.1;

        let targetX = orb.baseX + driftX;
        let targetY = orb.baseY + driftY;

        if (mouse.active) {
          const dx = targetX - mouse.x;
          const dy = targetY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const safeDist = Math.max(dist, 0.001);
            const force = (mouse.radius - safeDist) / mouse.radius;
            targetX += (dx / safeDist) * force * 120;
            targetY += (dy / safeDist) * force * 120;
          }
        }

        orb.x += (targetX - orb.x) * 0.09;
        orb.y += (targetY - orb.y) * 0.09;
        drawOrb(orb);
      }

      ctx.globalCompositeOperation = "source-over";
      animationId = requestAnimationFrame(animate);
    };

    const onMove  = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; };
    const onTouch = (e: TouchEvent) => { const t = e.touches[0]; if (!t) return; mouse.x = t.clientX; mouse.y = t.clientY; mouse.active = true; };
    const onLeave = () => { mouse.active = false; };

    init();
    animate();

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("touchend", onLeave);
    window.addEventListener("resize", init);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("touchend", onLeave);
      window.removeEventListener("resize", init);
    };
  }, [isClinicalTheme]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080e1a] px-4 py-8 text-white sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 bg-[#080e1a]" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isClinicalTheme
            ? "radial-gradient(ellipse at 20% 20%, rgba(59,130,246,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 75%, rgba(99,102,241,0.06) 0%, transparent 50%)"
            : "radial-gradient(ellipse at 20% 20%, rgba(34,197,94,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 75%, rgba(45,212,191,0.06) 0%, transparent 50%)",
        }}
      />

      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full blur-[32px] opacity-90"
      />

      {/* Subtle vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.4)_100%)]" />

      {/* Content */}
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full items-stretch gap-8 lg:grid-cols-[1.05fr_0.95fr]">

          {/* ── Left Panel (desktop only) ─────────────── */}
          <div className="hidden lg:flex flex-col justify-between rounded-2xl border border-white/[0.07] bg-white/[0.03] p-9 backdrop-blur-sm xl:p-11">
            <div>
              {/* Back link */}
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white/50 transition-all hover:text-white/80 hover:bg-white/[0.07]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to home
              </Link>

              {/* Brand + portal */}
              <div className="mt-10 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05]">
                  {isDoctor ? (
                    <Stethoscope className="h-6 w-6 text-white/60" />
                  ) : isAdmin ? (
                    <ShieldCheck className="h-6 w-6 text-white/60" />
                  ) : (
                    <HeartPulse className="h-6 w-6 text-white/60" />
                  )}
                </div>
                <div>
                  <p className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${isClinicalTheme ? "text-blue-400/70" : "text-emerald-400/70"}`}>
                    MediQ
                  </p>
                  <h2 className="text-xl font-semibold text-white/90 tracking-tight">{portalName}</h2>
                </div>
              </div>

              {/* Headline */}
              <div className="mt-12 max-w-sm">
                <h1 className="text-3xl font-bold leading-tight text-white/90 xl:text-[2.2rem]">
                  {heroHeadline}
                </h1>
                <p className="mt-4 text-sm leading-7 text-white/45">
                  {heroCopy}
                </p>
              </div>
            </div>

            {/* Feature chips */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                <p className={`text-xs font-semibold mb-2 ${isClinicalTheme ? "text-blue-300/80" : "text-emerald-300/80"}`}>
                  Secure experience
                </p>
                <p className="text-xs leading-relaxed text-white/40">
                  Protected access with dedicated doctor and patient journeys.
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className={`h-3.5 w-3.5 ${isClinicalTheme ? "text-blue-400/60" : "text-teal-400/60"}`} />
                  <p className={`text-xs font-semibold ${isClinicalTheme ? "text-blue-300/80" : "text-teal-300/80"}`}>
                    Trusted workflow
                  </p>
                </div>
                <p className="text-xs leading-relaxed text-white/40">
                  Built for smoother clinic operations and a better care experience.
                </p>
              </div>
            </div>
          </div>

          {/* ── Right Panel (form) ────────────────────── */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-xl">
              {/* Mobile back link */}
              <div className="mb-4 lg:hidden">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white/50 transition-all hover:text-white/80"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to home
                </Link>
              </div>

              {/* Form card */}
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] shadow-[var(--shadow-modal)] backdrop-blur-md">
                {/* Top accent line */}
                <div className={`absolute inset-x-0 top-0 h-[1.5px] ${isClinicalTheme ? "bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" : "bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"}`} />

                <div className="p-7 sm:p-9">
                  {/* Access chip + title */}
                  <div className="mb-7">
                    <div
                      className={`mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                        isAdmin
                          ? "border-violet-500/20 bg-violet-500/8 text-violet-300/80"
                          : isDoctor
                            ? "border-blue-500/20 bg-blue-500/8 text-blue-300/80"
                            : "border-emerald-500/20 bg-emerald-500/8 text-emerald-300/80"
                      }`}
                    >
                      {accessChipLabel}
                    </div>

                    {title && (
                      <h1 className="text-2xl font-bold tracking-tight text-white/90 sm:text-[1.7rem]">
                        {title}
                      </h1>
                    )}

                    {subtitle && (
                      <p className="mt-2.5 text-sm leading-relaxed text-white/40">
                        {subtitle}
                      </p>
                    )}
                  </div>

                  {/* Form content wrapper */}
                  <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 sm:p-6">
                    {children}

                    {isLoading && (
                      <div className="absolute inset-0 z-50 flex items-center justify-center rounded-xl bg-[#080e1a]/85 backdrop-blur-sm">
                        <div className="-mt-6 scale-75 sm:scale-90">
                          <MedicalLoader message={loadingMessage} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="mt-4 text-center text-[11px] leading-6 text-white/20">
                By continuing, you agree to a secure and role-based access flow for MediQ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}