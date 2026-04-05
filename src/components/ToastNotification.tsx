interface ToastNotificationProps {
  toast: { msg: string; type: string } | null;
}

export function ToastNotification({ toast }: ToastNotificationProps) {
  if (!toast) return null;

  const bgClass = toast.type === "err"
    ? "bg-destructive text-destructive-foreground"
    : toast.type === "warn"
      ? "bg-warning text-warning-foreground"
      : "bg-foreground text-background";

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-modal text-sm font-medium animate-fade-up ${bgClass}`}>
      {toast.msg}
    </div>
  );
}
