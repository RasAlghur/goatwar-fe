import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../../lib/cn";

type GlassCardProps = ComponentPropsWithoutRef<"div">;

export default function GlassCard({
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      {...props}
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,.35)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent" />
      {children}
    </div>
  );
}
