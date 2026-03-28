import Link from "next/link";
import AccentText from "@/components/AccentText";
import Reveal from "@/components/Reveal";
import DominoSceneWrapper from "@/components/DominoSceneWrapper";
import { buttonVariants } from "@/components/ui/button-variants";
import { SectionTitle, SectionHeading, SectionSubtitle } from "@/components/ui/section-title";
import { Panel, PanelHeader, PanelTitle, PanelTag, PanelDescription } from "@/components/ui/panel";
import { cn } from "@/lib/utils";
import DominoLogo from "@/components/DominoLogo";

const features = [
  {
    number: "01",
    title: "Real-Time Multiplayer",
    description:
      "Play with friends or strangers in real-time. Matchmaking, lobbies, and seamless turn-based gameplay - all synced instantly.",
  },
  {
    number: "02",
    title: "Team Play",
    description:
      "Partner up in classic 2v2 matches. Coordinate with your teammate, read your opponents, and dominate the table together.",
  },
  {
    number: "03",
    title: "Classic Rules",
    description:
      "Authentic domino gameplay with proper scoring, blocking, and strategy. The rules you know, built for the web.",
  },
  {
    number: "04",
    title: "No Downloads",
    description:
      "Jump straight into a game from your browser. No app stores, no installs - just open and play.",
  },
];

const stack = [
  {
    label: "Frontend",
    tag: "React",
    detail:
      "Interactive game board with smooth animations, drag-and-drop tile placement, and responsive design that works on any screen.",
  },
  {
    label: "Real-Time",
    tag: "WebSocket",
    detail:
      "Persistent connections keep every player in sync. Moves, scores, and game state update instantly across all clients.",
  },
  {
    label: "Auth",
    tag: "Sessions",
    detail:
      "Secure authentication with persistent sessions. Your stats, your games, your history - all tied to your account.",
  },
  {
    label: "State",
    tag: "Server",
    detail:
      "Authoritative server-side game logic prevents cheating and ensures fair play. The server is the source of truth.",
  },
];

export default function LandingPage() {
  return (
    <div className="noise flex flex-col min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black overflow-y-auto">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 sm:px-12 py-6 mix-blend-difference">
        <Link
          href="/"
          className="animate-fade-in flex items-center gap-2 group"
          style={{ animationDelay: "0.1s" }}
        >
          <span className="font-mono text-xs tracking-widest uppercase text-neutral-500 group-hover:text-white transition-colors">
            Domino
          </span>
        </Link>
        <div
          className="animate-fade-in font-mono text-xs tracking-widest uppercase"
          style={{ animationDelay: "0.3s" }}
        >
          <Link
            href="/auth/login"
            className="text-neutral-500 hover:text-white transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col justify-end min-h-screen px-6 sm:px-12 pt-32 pb-16">
        <DominoSceneWrapper />

        <div className="relative z-10 max-w-5xl pointer-events-none">
          <Reveal direction="up" delay={0.3}>
            <p className="font-mono text-xs sm:text-sm tracking-[0.3em] uppercase text-neutral-500 mb-4">
              Multiplayer Board Game
            </p>
          </Reveal>

          <Reveal direction="up" delay={0.5}>
            <h1 className="text-[clamp(2.5rem,7vw,6rem)] font-extrabold leading-[0.9] tracking-tight">
              Domino
              <br />
              <AccentText>Online</AccentText>
            </h1>
          </Reveal>

          <Reveal direction="up" delay={0.7}>
            <p className="mt-6 max-w-lg text-base sm:text-lg text-neutral-400 leading-relaxed">
              The classic tile game, reimagined for the{" "}
              <AccentText>web</AccentText>. Real-time multiplayer, team play,
              and the strategy you love - right in your browser.
            </p>
          </Reveal>

          <Reveal direction="up" delay={0.9}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/home"
                className={cn(buttonVariants({ variant: "landing", size: "xl" }), "pointer-events-auto group")}
              >
                Play Now
                <span className="transition-transform group-hover:translate-x-1">
                  &rarr;
                </span>
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Scroll indicator */}
        <div
          className="animate-fade-in absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ animationDelay: "1.4s" }}
        >
          <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-600">
            Scroll
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* Marquee */}
      <div className="border-t border-b border-white/[0.08] py-4 pb-8 overflow-hidden">
        <div className="animate-scroll-line whitespace-nowrap font-mono text-xs tracking-[0.4em] text-neutral-600 uppercase">
          {"TILES - DOUBLES - SPINNER - BLOCK - DRAW - SCORE - TEAMS - SHUFFLE - BONES - MATCH - ".repeat(
            6
          )}
        </div>
      </div>

      {/* Features */}
      <section className="px-6 sm:px-12 py-24 sm:py-32">
        <div className="max-w-6xl mx-auto">
          <Reveal direction="up">
            <SectionTitle>
              <SectionHeading>
                How it
                <br />
                <AccentText>plays</AccentText>
              </SectionHeading>
              <SectionSubtitle>Built for competition</SectionSubtitle>
            </SectionTitle>
          </Reveal>

          <div className="space-y-0">
            {features.map((feature, i) => (
              <Reveal key={feature.number} direction="left" delay={i * 0.1}>
                <div className="product-card relative group border-t border-white/[0.08] py-8 sm:py-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-12 cursor-default transition-colors hover:bg-white/[0.02]">
                  <span className="font-mono text-xs text-neutral-600 sm:w-12">
                    {feature.number}
                  </span>
                  <h3 className="text-xl sm:text-3xl font-bold tracking-tight sm:w-72 transition-transform group-hover:translate-x-2 duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-500 max-w-md transition-colors group-hover:text-neutral-300 duration-300">
                    {feature.description}
                  </p>
                  <span className="hidden sm:block ml-auto font-mono text-xs text-neutral-700 group-hover:text-white transition-colors duration-300">
                    &rarr;
                  </span>
                </div>
              </Reveal>
            ))}
            <div className="border-t border-white/[0.08]" />
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="px-6 sm:px-12 py-24 sm:py-32 border-t border-white/[0.08]">
        <div className="max-w-6xl mx-auto">
          <Reveal direction="up">
            <SectionTitle>
              <SectionHeading>
                Under the
                <br />
                <AccentText>table</AccentText>
              </SectionHeading>
              <SectionSubtitle>How it works</SectionSubtitle>
            </SectionTitle>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {stack.map((block, i) => (
              <Reveal key={block.label} direction="up" delay={i * 0.12}>
                <Panel>
                  <PanelHeader>
                    <PanelTitle>{block.label}</PanelTitle>
                    <PanelTag>{block.tag}</PanelTag>
                  </PanelHeader>
                  <PanelDescription>{block.detail}</PanelDescription>
                </Panel>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 sm:px-12 py-24 sm:py-40 border-t border-white/[0.08] dot-grid">
        <Reveal
          direction="fade"
          className="max-w-3xl mx-auto flex flex-col items-center text-center"
        >
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-neutral-500 mb-6">
            Ready to play
          </p>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-snug tracking-tight mb-8">
            Shuffle the bones.
            <br />
            <span className="text-neutral-500">
              Make your <AccentText>move</AccentText>.
            </span>
          </h2>
          <Link
            href="/home"
            className={cn(buttonVariants({ variant: "landing", size: "xl" }), "group")}
          >
            Play Now
            <span className="transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </Link>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] px-6 sm:px-12 py-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between gap-8">
          <Reveal direction="up">
            <div>
              <Link href="/">
                <DominoLogo className="mb-3" />
              </Link>
              <p className="text-xs text-neutral-600 font-mono tracking-wider">
                Classic draw dominoes
              </p>
            </div>
          </Reveal>
          <Reveal direction="up" delay={0.1}>
            <div className="flex flex-col gap-2 sm:items-end">
              <Link
                href="/home"
                className="font-mono text-xs tracking-widest uppercase text-neutral-500 hover:text-white transition-colors"
              >
                Play Now &rarr;
              </Link>
            </div>
          </Reveal>
        </div>
      </footer>
    </div>
  );
}
