import { MotionConfig } from "motion/react";
import { Hero } from "./components/hero/Hero";
import { Navbar } from "./components/nav/Navbar";
import { Capabilities } from "./components/sections/Capabilities";
import { Developers } from "./components/sections/Developers";
import { FinalCTA } from "./components/sections/FinalCTA";
import { Footer } from "./components/sections/Footer";
import { ProductPreview } from "./components/sections/ProductPreview";
import { Proof } from "./components/sections/Proof";
import { Security } from "./components/sections/Security";
import { SystemMap } from "./components/sections/SystemMap";
import { Telemetry } from "./components/sections/Telemetry";

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#conteudo"
        className="sr-only-focusable fixed top-3 left-3 z-[var(--z-skip)] rounded-sm bg-signal px-4 py-3 font-medium text-signal-ink"
      >
        Pular para o conteúdo
      </a>
      <Navbar />
      <main id="conteudo" tabIndex={-1} className="w-full overflow-x-clip focus:outline-none">
        <Hero />
        <Telemetry />
        <SystemMap />
        <Capabilities />
        <ProductPreview />
        <Security />
        <Proof />
        <Developers />
        <FinalCTA />
      </main>
      <Footer />
    </MotionConfig>
  );
}
