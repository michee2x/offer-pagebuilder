"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

export interface AnimatedTestimonialsProps {
  testimonials: Testimonial[];
  autoplay?: boolean;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function AnimatedTestimonials({
  testimonials,
  autoplay = false,
  elementStyles = {},
}: AnimatedTestimonialsProps) {
  const [active, setActive] = useState(0);

  const handleNext = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const handlePrev = useCallback(() => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  const isActive = (index: number) => index === active;

  useEffect(() => {
    if (autoplay && testimonials.length > 1) {
      const interval = window.setInterval(handleNext, 5000);
      return () => window.clearInterval(interval);
    }
  }, [autoplay, testimonials.length, handleNext]);

  // Intentionally impure — used to generate animation variety, not stored in state
  // eslint-disable-next-line react-hooks/purity
  const randomRotateY = () => Math.floor(Math.random() * 21) - 10;

  return (
    <div className="mx-auto max-w-sm px-4 py-20 font-sans antialiased md:max-w-4xl md:px-8 lg:px-12">
      <div className="relative grid grid-cols-1 gap-20 md:grid-cols-2">
        <div>
          <div className="relative h-80 w-full">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.src}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    z: -100,
                    rotate: randomRotateY(),
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : randomRotateY(),
                    zIndex: isActive(index)
                      ? 40
                      : testimonials.length + 2 - index,
                    y: isActive(index) ? [0, -80, 0] : 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    z: 100,
                    rotate: randomRotateY(),
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 origin-bottom"
                >
                  <img
                    src={testimonial.src}
                    alt={testimonial.name}
                    width={500}
                    height={500}
                    draggable={false}
                    className="h-full w-full rounded-3xl object-cover object-center"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col justify-between py-4">
          <motion.div
            key={active}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <h3
              className="text-2xl font-bold text-foreground"
              data-field="testimonialName"
              style={elementStyles?.["testimonialName"]}
            >
              {testimonials[active].name}
            </h3>
            <p
              className="text-sm text-muted-foreground"
              data-field="testimonialDesignation"
              style={elementStyles?.["testimonialDesignation"]}
            >
              {testimonials[active].designation}
            </p>
            <motion.p
              className="mt-8 text-lg text-muted-foreground/90"
              data-field="testimonialQuote"
              style={elementStyles?.["testimonialQuote"]}
            >
              {testimonials[active].quote.split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ filter: "blur(10px)", opacity: 0, y: 5 }}
                  animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut",
                    delay: 0.02 * index,
                  }}
                  className="inline-block"
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.p>
          </motion.div>

          <div className="flex gap-4 pt-12 md:pt-0">
            <button
              onClick={handlePrev}
              className="group/button flex h-7 w-7 items-center justify-center rounded-full bg-muted/20 text-foreground transition-colors duration-200 hover:bg-muted/40"
              data-field="prevButton"
              style={elementStyles?.["prevButton"]}
            >
              <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover/button:rotate-12 text-foreground" />
            </button>
            <button
              onClick={handleNext}
              className="group/button flex h-7 w-7 items-center justify-center rounded-full bg-muted/20 text-foreground transition-colors duration-200 hover:bg-muted/40"
              data-field="nextButton"
              style={elementStyles?.["nextButton"]}
            >
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover/button:-rotate-12 text-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
