import type { ButtonHTMLAttributes, ReactNode } from "react";

import { motion } from "framer-motion";

import { ChevronRight } from "lucide-react";

import { cn } from "../../lib/cn";

type GlowButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "gold" | "blue" | "red";

  children: ReactNode;
};

export default function GlowButton({
  children,

  variant = "gold",

  className,

  ...props
}: GlowButtonProps) {
  const colors = {
    gold: "from-yellow-300 to-yellow-500 shadow-yellow-500/30",

    blue: "from-blue-500 to-blue-700 shadow-blue-600/30",

    red: "from-red-500 to-red-700 shadow-red-600/30",
  };

  return (
    <motion.div
      whileHover={{
        y: -4,
        scale: 1.03,
      }}
      whileTap={{
        scale: 0.98,
      }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 22,
      }}
      className="inline-block"
    >
      <button
        {...props}
        className={cn(
          `
group
relative
overflow-hidden
rounded-full
bg-gradient-to-r
px-8
py-4
font-semibold
text-white
shadow-2xl
transition-all
`,

          colors[variant],

          className,
        )}
      >
        <span
          className="

pointer-events-none

absolute

left-[-120%]

top-0

h-full

w-1/2

-skew-x-12

bg-white/20

transition-all

duration-700

group-hover:left-[130%]

"
        />

        <span className="relative flex items-center gap-2">
          {children}

          <ChevronRight
            size={18}
            className="transition-transform group-hover:translate-x-1"
          />
        </span>
      </button>
    </motion.div>
  );
}
