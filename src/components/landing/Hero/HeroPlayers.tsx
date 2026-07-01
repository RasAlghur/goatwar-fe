import { motion } from "framer-motion";

import messi from "../../../images/Messi.png";
import ronaldo from "../../../images/CR701.png";
import { Swords } from "lucide-react";

export default function HeroPlayers() {
  return (
    <div className="relative mt-8 flex h-[560px] w-full items-end justify-center md:h-[650px] lg:h-[720px]">
      {/* Messi Glow */}

      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-[270px] -translate-y-1/2 rounded-full bg-blue-500/25 blur-[110px]" />

      {/* Ronaldo Glow */}

      <div className="absolute left-1/2 top-1/2 h-72 w-72 translate-x-[270px] -translate-y-1/2 rounded-full bg-red-500/25 blur-[110px]" />

      {/* Messi */}

      <motion.img
        src={messi}
        alt="Lionel Messi"
        initial={{
          opacity: 0,
          x: -80,
          scale: 0.9,
        }}
        animate={{
          opacity: 1,
          x: 0,
          scale: 1,
          y: [0, -8, 0],
        }}
        transition={{
          duration: 0.9,
          y: {
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut",
          },
        }}
        className="
absolute
bottom-0
left-1/2
z-20
w-[300px]
right-1/2 -mr-5
select-none
drop-shadow-[0_35px_70px_rgba(37,99,235,.35)]
md:w-[390px]
lg:w-[470px]
"
      />

      {/* VS */}

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.5,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          rotate: [-2, 2, -2],
        }}
        transition={{
          duration: 0.8,
          rotate: {
            repeat: Infinity,
            duration: 5,
          },
        }}
        className="
absolute
bottom-36
left-1/2
z-30
-flex
h-28
w-28
-translate-x-1/2
items-center
justify-center
rounded-full
border
border-yellow-500/30
bg-black/40
backdrop-blur-xl
"
      >
        <span className="text-4xl font-black text-yellow-400">
          <Swords size={42} strokeWidth={2.2} />
        </span>
      </motion.div>

      {/* Ronaldo */}

      <motion.img
        src={ronaldo}
        alt="Cristiano Ronaldo"
        initial={{
          opacity: 0,
          x: 80,
          scale: 0.9,
        }}
        animate={{
          opacity: 1,
          x: 0,
          scale: 1,
          y: [0, 8, 0],
        }}
        transition={{
          duration: 0.9,
          y: {
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut",
          },
        }}
        className="
absolute
bottom-0
left-1/2
z-20
w-[300px]
left-1/2 ml-5
select-none
drop-shadow-[0_35px_70px_rgba(239,68,68,.35)]
md:w-[390px]
lg:w-[470px]
"
      />
    </div>
  );
}
