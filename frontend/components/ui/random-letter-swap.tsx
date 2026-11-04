"use client";

import React, { useMemo, useState } from "react";
import { motion, type Transition } from "motion/react";
import { cn } from "@/lib/utils";

export interface RandomLetterSwapProps {
  label: string;
  className?: string;
  staggerDuration?: number;
  transition?: Transition;
  reverse?: boolean;
  onClick?: () => void;
}

export function RandomLetterSwap({
  label,
  className,
  staggerDuration = 0.025,
  transition = { duration: 0.6, type: "spring", stiffness: 320, damping: 24 },
  reverse = false,
  onClick,
}: RandomLetterSwapProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Generate randomized stagger order so letters swap in a dynamic, tactile sequence
  const shuffledOrder = useMemo(() => {
    const indices = Array.from({ length: label.length }, (_, i) => i);
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, [label]);

  const characters = label.split("");
  const moveY = reverse ? "100%" : "-100%";
  const initialCloneY = reverse ? "-100%" : "100%";

  return (
    <motion.span
      className={cn("relative inline-flex items-center overflow-hidden leading-tight select-none", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={label}
    >
      <span className="inline-flex" aria-hidden="true">
        {characters.map((char, index) => {
          if (char === " ") {
            return <span key={index}>&nbsp;</span>;
          }

          const delay = (shuffledOrder[index] ?? index) * staggerDuration;

          return (
            <span key={index} className="relative inline-block overflow-hidden h-[1.25em]">
              {/* Primary letter */}
              <motion.span
                className="inline-block"
                initial={false}
                animate={{ y: isHovered ? moveY : "0%" }}
                transition={{
                  ...transition,
                  delay: isHovered ? delay : (characters.length - 1 - (shuffledOrder[index] ?? index)) * staggerDuration,
                }}
              >
                {char}
              </motion.span>

              {/* Swapped duplicate letter */}
              <motion.span
                className="absolute left-0 top-0 inline-block"
                initial={{ y: initialCloneY }}
                animate={{ y: isHovered ? "0%" : initialCloneY }}
                transition={{
                  ...transition,
                  delay: isHovered ? delay : (characters.length - 1 - (shuffledOrder[index] ?? index)) * staggerDuration,
                }}
              >
                {char}
              </motion.span>
            </span>
          );
        })}
      </span>
    </motion.span>
  );
}

export default RandomLetterSwap;

