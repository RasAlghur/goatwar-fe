import { motion } from "framer-motion";
import { Trophy, Users, Coins } from "lucide-react";

const stats = [
  {
    icon: Trophy,
    value: "$3.2M",
    label: "Prize Pool",
  },
  {
    icon: Users,
    value: "42K+",
    label: "Holders",
  },
  {
    icon: Coins,
    value: "$12.4M",
    label: "Trading Volume",
  },
];

export default function HeroStats() {
  return (
    <div className="pointer-events-none absolute bottom-8 left-1/2 z-40 w-full max-w-5xl -translate-x-1/2 px-6">
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.label}
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.3 + index * 0.15,
                duration: 0.6,
              }}
              whileHover={{
                y: -8,
                scale: 1.03,
              }}
              className="
group
pointer-events-auto
rounded-3xl
border
border-white/10
bg-white/5
p-6
backdrop-blur-xl
transition-all
duration-300
hover:border-yellow-400/40
hover:bg-white/10
"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400/15 text-yellow-400">
                <Icon size={22} />
              </div>

              <p className="text-3xl font-black text-white">{stat.value}</p>

              <p className="mt-1 text-sm text-gray-400">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
