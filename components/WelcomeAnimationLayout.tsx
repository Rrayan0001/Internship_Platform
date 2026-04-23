"use client";

import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type IntroPhase = "logo" | "done";

export default function WelcomeAnimationLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const shouldShowIntroOnEntry = pathname === "/";

  const [hasPlayedIntro, setHasPlayedIntro] = useState(
    Boolean(prefersReducedMotion) || !shouldShowIntroOnEntry
  );
  const [phase, setPhase] = useState<IntroPhase>(
    Boolean(prefersReducedMotion) || !shouldShowIntroOnEntry ? "done" : "logo"
  );

  useEffect(() => {
    if (prefersReducedMotion || !shouldShowIntroOnEntry || hasPlayedIntro) {
      setPhase("done");
      setHasPlayedIntro(true);
      return;
    }

    const timeout = window.setTimeout(() => {
      setPhase("done");
      setHasPlayedIntro(true);
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [hasPlayedIntro, prefersReducedMotion, shouldShowIntroOnEntry]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (phase !== "done") {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [phase]);

  return (
    <>
      <motion.div
        initial={false}
        animate={
          phase === "done"
            ? {
                opacity: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
              }
            : {
                opacity: 0,
                y: 10,
                scale: 0.985,
                filter: "blur(14px)",
              }
        }
        transition={{ duration: 0.75, ease: "easeOut" }}
        className="relative min-h-screen flex flex-col"
      >
        {children}
      </motion.div>

      <AnimatePresence>
        {phase !== "done" && (
          <motion.div
            key="welcome-intro"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4, ease: "easeInOut" } }}
            className="fixed inset-0 z-[100] bg-[var(--brand)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(218,119,86,0.24),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_42%)]" />
            <div className="relative z-10 flex h-full items-center justify-center px-6">
              <motion.div
                key="logo"
                initial={{ opacity: 0, scale: 0.28, filter: "blur(18px)" }}
                animate={{
                  opacity: [0, 0.35, 0.85, 1],
                  scale: [0.28, 0.58, 1.12, 1],
                  filter: ["blur(18px)", "blur(10px)", "blur(2px)", "blur(0px)"],
                }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{
                  duration: 1.1,
                  delay: 0.08,
                  ease: "easeOut",
                  times: [0, 0.42, 0.82, 1],
                }}
                style={{ transformPerspective: 1200 }}
                className="relative h-40 w-40 md:h-48 md:w-48"
              >
                <Image
                  src="/logo.png"
                  alt="Margros"
                  fill
                  priority
                  className="object-contain contrast-125 saturate-110 drop-shadow-[0_28px_80px_rgba(0,0,0,0.35)]"
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
