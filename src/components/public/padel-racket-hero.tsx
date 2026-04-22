"use client";

import { useEffect, useEffectEvent, useState } from "react";

export function PadelRacketHero() {
  const [rotation, setRotation] = useState(0);

  const syncWithScroll = useEffectEvent(() => {
    const maxScroll = Math.max(window.innerHeight * 1.2, 720);
    const progress = Math.min(window.scrollY / maxScroll, 1);
    setRotation(progress * 180);
  });

  useEffect(() => {
    let frame = 0;

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        syncWithScroll();
      });
    };

    frame = window.requestAnimationFrame(() => {
      syncWithScroll();
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="relative mx-auto aspect-[0.95] w-full max-w-[420px] [perspective:1600px]">
      <div className="absolute left-8 top-10 h-32 w-32 rounded-full bg-cyan-400/18 blur-3xl" />
      <div className="absolute bottom-12 right-8 h-32 w-32 rounded-full bg-lime-300/14 blur-3xl" />
      <div
        className="relative h-full w-full [transform-style:preserve-3d]"
        style={{
          transform: `rotateY(${rotation}deg) rotateX(10deg) rotateZ(-16deg)`,
          transition: "transform 140ms linear",
        }}
      >
        <RacketFace />
        <RacketFace back />
      </div>
    </div>
  );
}

function RacketFace({ back = false }: { back?: boolean }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden]"
      style={{
        transform: back ? "rotateY(180deg)" : "rotateY(0deg)",
      }}
    >
      <div className="relative h-[88%] w-[74%] [transform-style:preserve-3d]">
        {back ? (
          <div className="absolute left-1/2 top-[14%] h-24 w-24 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#fef9c3_0%,#d9f99d_42%,#84cc16_70%,#65a30d_100%)] shadow-[0_0_40px_rgba(217,249,157,0.28)] [transform:translateZ(-30px)]" />
        ) : null}

        <div className="absolute left-1/2 top-[2%] h-[58%] w-[58%] -translate-x-1/2 rounded-[48%] bg-[linear-gradient(180deg,#7dd3fc_0%,#38bdf8_45%,#0f172a_100%)] p-[14px] shadow-[0_30px_80px_-22px_rgba(56,189,248,0.45)] [transform:translateZ(32px)]">
          <div className="relative h-full w-full rounded-[46%] bg-[radial-gradient(circle_at_top,#1e293b_0%,#0f172a_72%)]">
            <div className="absolute inset-[12%] rounded-[42%] border border-white/6 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1),rgba(15,23,42,0.2)_60%)]">
              <div className="absolute inset-0 rounded-[42%] bg-[repeating-linear-gradient(90deg,transparent_0,transparent_17px,rgba(148,163,184,0.25)_18px,transparent_19px),repeating-linear-gradient(0deg,transparent_0,transparent_17px,rgba(148,163,184,0.22)_18px,transparent_19px)] opacity-80" />
              <div className="absolute left-1/2 top-[16%] h-[66%] w-[1px] -translate-x-1/2 bg-white/8" />
            </div>

            <div className="absolute left-1/2 top-[12%] h-4 w-4 -translate-x-1/2 rounded-full bg-white/75 shadow-[0_0_20px_rgba(255,255,255,0.35)]" />
          </div>
        </div>

        <div className="absolute left-1/2 top-[52%] h-[26%] w-[10%] -translate-x-1/2 rounded-b-[2.2rem] rounded-t-[1rem] bg-[linear-gradient(180deg,#e2e8f0_0%,#94a3b8_24%,#334155_100%)] shadow-[0_24px_60px_-26px_rgba(15,23,42,0.6)] [transform:translateZ(18px)]" />
        <div className="absolute left-1/2 top-[75%] h-[15%] w-[18%] -translate-x-1/2 rounded-[2rem] border border-white/6 bg-[linear-gradient(180deg,#111827_0%,#020617_100%)] shadow-[0_20px_40px_-26px_rgba(0,0,0,0.8)] [transform:translateZ(20px)]" />
      </div>
    </div>
  );
}
