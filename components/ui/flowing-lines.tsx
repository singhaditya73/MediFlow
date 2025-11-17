"use client";

import { motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";

export function FlowingLines() {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, []);

  const paths = [
    {
      // Top rope - converges to center
      d: `M 0 ${dimensions.height * 0.15} L ${dimensions.width * 0.5} ${dimensions.height * 0.5} L ${dimensions.width} ${dimensions.height * 0.15}`,
      color: "rgba(20, 184, 166, 1)", // teal
      delay: 0,
    },
    {
      // Upper-middle rope
      d: `M 0 ${dimensions.height * 0.35} L ${dimensions.width * 0.5} ${dimensions.height * 0.5} L ${dimensions.width} ${dimensions.height * 0.35}`,
      color: "rgba(59, 130, 246, 1)", // blue
      delay: 0.3,
    },
    {
      // Center rope - straight through
      d: `M 0 ${dimensions.height * 0.5} L ${dimensions.width} ${dimensions.height * 0.5}`,
      color: "rgba(168, 85, 247, 1)", // purple
      delay: 0.6,
    },
    {
      // Lower-middle rope
      d: `M 0 ${dimensions.height * 0.65} L ${dimensions.width * 0.5} ${dimensions.height * 0.5} L ${dimensions.width} ${dimensions.height * 0.65}`,
      color: "rgba(34, 197, 94, 1)", // green
      delay: 0.9,
    },
    {
      // Bottom rope
      d: `M 0 ${dimensions.height * 0.85} L ${dimensions.width * 0.5} ${dimensions.height * 0.5} L ${dimensions.width} ${dimensions.height * 0.85}`,
      color: "rgba(244, 114, 182, 1)", // pink
      delay: 1.2,
    },
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-64 bg-transparent overflow-hidden"
    >
      {/* SVG Flowing Lines */}
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
      >
        <defs>
          {paths.map((path, index) => (
            <linearGradient
              key={`gradient-${index}`}
              id={`gradient-${id}-${index}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor={path.color} stopOpacity="0">
                <animate
                  attributeName="offset"
                  values="-2;1"
                  dur="2s"
                  repeatCount="indefinite"
                  begin={`${path.delay}s`}
                />
              </stop>
              <stop offset="10%" stopColor={path.color} stopOpacity="1">
                <animate
                  attributeName="offset"
                  values="-1.9;1.1"
                  dur="2s"
                  repeatCount="indefinite"
                  begin={`${path.delay}s`}
                />
              </stop>
              <stop offset="100%" stopColor={path.color} stopOpacity="0">
                <animate
                  attributeName="offset"
                  values="-1;2"
                  dur="2s"
                  repeatCount="indefinite"
                  begin={`${path.delay}s`}
                />
              </stop>
            </linearGradient>
          ))}
        </defs>

        {paths.map((path, index) => (
          <g key={`path-${index}`}>
            {/* Static base rope */}
            <path
              d={path.d}
              fill="none"
              stroke={path.color}
              strokeWidth="2"
              opacity="0.15"
            />

            {/* Animated flowing color */}
            <path
              d={path.d}
              fill="none"
              stroke={`url(#gradient-${id}-${index})`}
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Glow effect on the rope */}
            <path
              d={path.d}
              fill="none"
              stroke={`url(#gradient-${id}-${index})`}
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.3"
              filter="blur(4px)"
            />
          </g>
        ))}

        {/* Center convergence point glow */}
        <circle
          cx={dimensions.width * 0.5}
          cy={dimensions.height * 0.5}
          r="8"
          fill="rgba(59, 130, 246, 0.8)"
          opacity="0.8"
        >
          <animate
            attributeName="opacity"
            values="0.5;1;0.5"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          cx={dimensions.width * 0.5}
          cy={dimensions.height * 0.5}
          r="12"
          fill="rgba(59, 130, 246, 0.5)"
          opacity="0.3"
          filter="blur(8px)"
        >
          <animate
            attributeName="r"
            values="12;20;12"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      {/* Overlay Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="text-center space-y-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-3xl md:text-4xl font-bold text-foreground"
          >
            Powered by Blockchain
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-sm md:text-base text-muted-foreground"
          >
            Secure Data Transfer • Decentralized • Transparent
          </motion.div>
        </div>
      </div>
    </div>
  );
}
