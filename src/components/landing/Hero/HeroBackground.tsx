import { motion } from "framer-motion";

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base Background */}
      <div className="absolute inset-0 bg-[#050608]" />

      {/* Subtle Grid */}
      <div
        className="
          absolute inset-0
          opacity-[0.035]
          [background-image:linear-gradient(rgba(255,255,255,.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.25)_1px,transparent_1px)]
          [background-size:72px_72px]
        "
      />

      {/* Messi Glow */}
      <motion.div
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.45, 0.65, 0.45],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          left-[-12rem]
          top-1/2
          h-[40rem]
          w-[40rem]
          -translate-y-1/2
          rounded-full
          bg-blue-500/25
          blur-[140px]
        "
      />

      {/* Ronaldo Glow */}
      <motion.div
        animate={{
          scale: [1.08, 1, 1.08],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          right-[-12rem]
          top-1/2
          h-[40rem]
          w-[40rem]
          -translate-y-1/2
          rounded-full
          bg-red-500/25
          blur-[140px]
        "
      />

      {/* Gold Accent */}
      <motion.div
        animate={{
          opacity: [0.12, 0.2, 0.12],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
        className="
          absolute
          left-1/2
          top-20
          h-72
          w-72
          -translate-x-1/2
          rounded-full
          bg-yellow-400/20
          blur-[120px]
        "
      />

      {/* Vignette */}
      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,.45)_100%)]
        "
      />

      {/* Bottom Fade */}
      <div
        className="
          absolute
          bottom-0
          left-0
          h-64
          w-full
          bg-gradient-to-t
          from-[#050608]
          to-transparent
        "
      />
    </div>
  );
}
