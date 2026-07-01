import { motion } from "framer-motion";
import { ArrowRight, Swords } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function HeroContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative z-20 flex max-w-4xl flex-col items-center text-center"
    >
      {/* Badge */}

      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-300 backdrop-blur">
        <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
        LIVE ON SOLANA
      </div>

      {/* Heading */}

      <h1 className="font-bebas text-6xl leading-none tracking-wide text-white md:text-8xl xl:text-9xl">
        MESSI
        <span className="mx-4 inline-flex translate-y-[-6px] text-yellow-400">
          <Swords size={42} strokeWidth={2.2} />
        </span>
        RONALDO
      </h1>

      {/* Subtitle */}

      <h2 className="mt-4 text-2xl font-bold text-white md:text-4xl">
        Two Tribes.
        <span className="text-yellow-400"> One Battlefield.</span>
      </h2>

      {/* Description */}

      <p className="mt-6 max-w-2xl text-base leading-8 text-gray-300 md:text-lg">
        Choose your GOAT. Buy your team's token, strengthen your tribe,
        eliminate the opposition, and compete for the final reward.
      </p>

      {/* CTA */}

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Button
          size="lg"
          className="
          h-14
          rounded-full
          bg-gradient-to-r
          from-blue-500
          to-blue-600
          px-8
          text-base
          font-semibold
          shadow-[0_15px_45px_rgba(59,130,246,.35)]
          transition-all
          hover:scale-105
          hover:from-blue-400
          hover:to-blue-500
        "
        >
          Join Team Messi
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="
          h-14
          rounded-full
          border-red-500/40
          bg-red-500/10
          px-8
          text-base
          text-white
          backdrop-blur-md
          transition-all
          hover:scale-105
          hover:bg-red-500/20
          hover:border-red-400
        "
        >
          Join Team Ronaldo
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
