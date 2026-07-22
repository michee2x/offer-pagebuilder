"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CardSpotlight = ({
  children,
  className,
  radius = 350,
  color = "#262626",
}: {
  children: React.ReactNode;
  className?: string;
  radius?: number;
  color?: string;
}) => {
  const [mouseX, setMouseX] = useState(-1000);
  const [mouseY, setMouseY] = useState(-1000);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    setMouseX(clientX - left);
    setMouseY(clientY - top);
  }

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/10 bg-[#14141F] overflow-hidden group",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {}}
      onMouseLeave={() => {
        setMouseX(-1000);
        setMouseY(-1000);
      }}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100 z-0"
        style={{
          background: `radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, ${color}, transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
};
