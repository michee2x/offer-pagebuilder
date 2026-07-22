"use client";
import {
  useScroll,
  useTransform,
  motion,
} from "motion/react";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full bg-transparent font-sans md:px-10"
      ref={containerRef}
    >
      <div className="max-w-7xl mx-auto py-20 px-4 md:px-8 lg:px-10">
        <div className="flex items-center gap-2 font-mono text-[12.5px] tracking-[0.14em] uppercase text-[#A78BFA] mb-[18px]">
          <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: 'linear-gradient(135deg,#8B5CF6 0%,#3B82F6 100%)', boxShadow: '0 0 14px rgba(139,92,246,0.5)' }} />
          Why This Matters Right Now
        </div>
        <h2 className="text-lg md:text-4xl mb-4 text-[#F5F5F7] max-w-4xl font-semibold tracking-[-0.02em]" style={{ fontSize: 'clamp(28px,3.5vw,52px)', lineHeight: 1.08 }}>
          <span className="text-neutral-500">Three traps</span> quietly kill every offer before it sells.
        </h2>
        <p className="text-[#A6A6B3] text-sm md:text-base max-w-xl font-light text-[17px] md:text-[19px] leading-relaxed mb-8">
          Most offers don't fail because the idea was bad. They fail in one of three predictable, well-documented places — before a single ad ever runs.
        </p>
        <button className="px-6 py-2.5 border-2 border-[#8B5CF6] uppercase bg-[#13131A] text-[#F5F5F7] transition duration-200 text-xs md:text-sm font-bold tracking-widest shadow-[1px_1px_#8B5CF6,2px_2px_#8B5CF6,3px_3px_#8B5CF6,4px_4px_#8B5CF6,5px_5px_0px_0px_#8B5CF6]">
          Replace Guesswork With A Blueprint
        </button>
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:pt-40 md:gap-10"
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-[#13131A] border border-white/[0.06] flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-neutral-800 border border-neutral-700 p-2" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-neutral-500">
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-neutral-500">
                {item.title}
              </h3>
              {item.content}{" "}
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-700 to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] "
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0  w-[2px] bg-gradient-to-t from-purple-500 via-blue-500 to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
