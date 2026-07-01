import { motion } from "framer-motion";
import { X } from "lucide-react";

import { Button } from "../../../components/ui/button";

interface Props {
  links: {
    label: string;
    href: string;
  }[];

  onClose: () => void;
}

export default function MobileMenu({ links, onClose }: Props) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ y: "-100%" }}
        animate={{ y: 0 }}
        exit={{ y: "-100%" }}
        transition={{ type: "spring", stiffness: 180, damping: 20 }}
        className="fixed inset-x-4 top-4 z-50 rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-2xl"
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Menu</h2>

          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="space-y-6">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={onClose}
              className="block text-lg text-white/80 transition hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Button className="mt-10 w-full rounded-full" size="lg">
          Enter Arena
        </Button>
      </motion.div>
    </>
  );
}
