"use client";
import React, { useId, useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { Container } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { cn } from "@/lib/utils";
import { motion, useAnimation } from "motion/react";

type SparkleAuraProps = {
  id?: string;
  className?: string;
  particleColor?: string;
  particleDensity?: number;
  minSize?: number;
  maxSize?: number;
  speed?: number;
};

/**
 * SparkleAura – particles radiate outward from center and fade away.
 * Designed to wrap the AI floating ball so sparkles appear to emanate from it.
 */
export const SparkleAura = (props: SparkleAuraProps) => {
  const {
    id,
    className,
    particleColor = "#67e8f9",
    particleDensity = 60,
    minSize = 0.6,
    maxSize = 1.8,
    speed = 3,
  } = props;

  const [init, setInit] = useState(false);
  const controls = useAnimation();
  const generatedId = useId();

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container) => {
    if (container) {
      controls.start({
        opacity: 1,
        transition: { duration: 1.2 },
      });
    }
  };

  return (
    <motion.div
      animate={controls}
      className={cn("opacity-0 pointer-events-none", className)}
    >
      {init && (
        <Particles
          id={id || generatedId}
          className="h-full w-full"
          particlesLoaded={particlesLoaded}
          options={{
            background: {
              color: { value: "transparent" },
            },
            fullScreen: {
              enable: false,
              zIndex: 1,
            },
            fpsLimit: 120,
            interactivity: {
              events: {
                onClick: { enable: false, mode: "push" },
                onHover: { enable: false, mode: "repulse" },
                resize: true as any,
              },
            },
            particles: {
              color: {
                value: particleColor,
              },
              move: {
                enable: true,
                direction: "none",
                outModes: { default: "out" },
                speed: { min: 0.2, max: 1.5 },
                random: true,
                straight: false,
              },
              number: {
                density: {
                  enable: true,
                  width: 400,
                  height: 400,
                },
                value: particleDensity,
              },
              opacity: {
                value: { min: 0.1, max: 1 },
                animation: {
                  enable: true,
                  speed: speed,
                  sync: false,
                  mode: "auto" as any,
                  startValue: "random" as any,
                  destroy: "none" as any,
                },
              },
              shape: {
                type: "circle",
              },
              size: {
                value: { min: minSize, max: maxSize },
                animation: {
                  enable: true,
                  speed: 2,
                  sync: false,
                  mode: "auto" as any,
                  startValue: "random" as any,
                  destroy: "none" as any,
                },
              },
              twinkle: {
                particles: {
                  enable: true,
                  frequency: 0.05,
                  opacity: 1,
                },
              },
              reduceDuplicates: false,
              collisions: { enable: false },
              links: { enable: false },
              stroke: { width: 0 },
            },
            detectRetina: true,
          }}
        />
      )}
    </motion.div>
  );
};
