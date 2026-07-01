import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../../components/ui/button";
import MobileMenu from "./MobileMenu";

import logo from "../../../images/RonaldoMessi Transaprent.png";

const links = [
  { label: "Tokens", href: "#tokens" },
  { label: "Mechanism", href: "#mechanism" },
  { label: "Rewards", href: "#rewards" },
  { label: "Risk", href: "#risk" },
];

export default function Navbar() {
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);

    onScroll();

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-x-0 top-5 z-50 px-5"
      >
        <div
          className={`
            mx-auto
            flex
            max-w-7xl
            items-center
            justify-between
            rounded-full
            border
            px-6
            transition-all
            duration-300

            ${
              scrolled
                ? "border-white/10 bg-white/8 backdrop-blur-xl py-3 shadow-2xl"
                : "border-transparent bg-transparent py-4"
            }
          `}
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-4"
          >
            <img src={logo} alt="MVSR" className="h-12 w-auto" />

            <span className="font-bebas text-3xl tracking-[0.3em] text-yellow-400">
              MVSR
            </span>
          </button>

          <nav className="hidden items-center gap-10 lg:flex">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="
                  relative
                  text-sm
                  font-medium
                  text-white/70
                  transition-colors
                  duration-300
                  hover:text-white
                  after:absolute
                  after:left-0
                  after:-bottom-2
                  after:h-px
                  after:w-0
                  after:bg-yellow-400
                  after:transition-all
                  after:duration-300
                  hover:after:w-full
                "
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:block">
            <Button
              size="lg"
              className="
                rounded-full
                px-7
              "
            >
              Enter Arena
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <MobileMenu links={links} onClose={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
