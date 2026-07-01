import HeroBackground from "./HeroBackground";
import HeroContent from "./HeroContent";
import HeroPlayers from "./HeroPlayers";
import HeroStats from "./HeroStats";

export default function Hero() {
  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-[#050608]">
      <HeroBackground />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center px-6 pt-32 pb-20 lg:px-8">
        <HeroContent />

        <HeroPlayers />

        <HeroStats />
      </div>
    </section>
  );
}
