"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface DecorativeBackgroundProps {
  variant?: "hero" | "section" | "subtle";
}

export function DecorativeBackground({ variant = "subtle" }: DecorativeBackgroundProps) {
  const shapes = useMemo(() => {
    const seed = variant === "hero" ? 6 : variant === "section" ? 4 : 3;
    return Array.from({ length: seed }, (_, i) => ({
      id: i,
      size: variant === "hero" ? 150 + i * 80 : 80 + i * 50,
      x: [10, 30, 70, 85, 50, 90][i] ?? 50,
      y: [10, 70, 15, 85, 50, 25][i] ?? 50,
      delay: i * 0.3,
      duration: 5 + i * 1.5,
    }));
  }, [variant]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Gradient Orbs */}
      {shapes.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full"
          style={{
            width: s.size,
            height: s.size,
            left: `${s.x}%`,
            top: `${s.y}%`,
            background: variant === "hero"
              ? `radial-gradient(circle, rgba(37,99,235,${0.08 - s.id * 0.01}) 0%, transparent 70%)`
              : `radial-gradient(circle, rgba(37,99,235,${0.05 - s.id * 0.01}) 0%, transparent 70%)`,
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            x: [0, 30, -20, 15, 0],
            y: [0, -25, 15, -10, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: s.delay,
          }}
        />
      ))}

      {/* Grid Pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`grid-${variant}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 0 0 L 0 40 M 0 0 L 40 0" stroke="#2563EB" strokeWidth="1" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${variant})`} />
      </svg>

      {/* Dots */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`dots-${variant}`} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#2563EB" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#dots-${variant})`} />
      </svg>
    </div>
  );
}
