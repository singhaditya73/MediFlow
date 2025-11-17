"use client";

import { motion } from "framer-motion";

export function DNAAnimation() {
  // Create DNA helix points
  const helixPoints = Array.from({ length: 30 }, (_, i) => i);

  return (
    <div className="relative w-full h-64 overflow-hidden bg-gradient-to-r from-teal-500/5 via-blue-500/5 to-purple-500/5 dark:from-teal-500/10 dark:via-blue-500/10 dark:to-purple-500/10 flex items-center justify-center">
      {/* DNA Helix Strands */}
      <div className="relative w-full h-full flex items-center justify-center">
        <motion.div
          className="relative"
          style={{ width: "600px", height: "200px" }}
          animate={{ rotateY: 360 }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {helixPoints.map((point, index) => {
            const angle = (point * 30) % 360; // 30 degrees per point for tighter helix
            const angleRad = (angle * Math.PI) / 180;
            const radius = 60;
            
            // Calculate 3D positions
            const x = Math.cos(angleRad) * radius;
            const z = Math.sin(angleRad) * radius;
            const y = (point * 6) - 90; // Vertical spacing
            
            // Calculate opposite strand position
            const x2 = -x;
            const z2 = -z;
            
            // Calculate scale and opacity based on z-position (depth)
            const scale1 = 0.5 + (z + radius) / (radius * 4);
            const scale2 = 0.5 + (z2 + radius) / (radius * 4);
            const opacity1 = 0.3 + (z + radius) / (radius * 2);
            const opacity2 = 0.3 + (z2 + radius) / (radius * 2);
            
            return (
              <div key={index}>
                {/* First Strand Node */}
                <motion.div
                  className="absolute w-4 h-4 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg shadow-teal-500/50"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: `translateZ(${z}px) scale(${scale1})`,
                    opacity: opacity1,
                    filter: "blur(0.3px)",
                  }}
                />

                {/* Second Strand Node */}
                <motion.div
                  className="absolute w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/50"
                  style={{
                    left: `calc(50% + ${x2}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: `translateZ(${z2}px) scale(${scale2})`,
                    opacity: opacity2,
                    filter: "blur(0.3px)",
                  }}
                />

                {/* Connecting Base Pair Line */}
                {index % 2 === 0 && (
                  <motion.div
                    className="absolute h-0.5 bg-gradient-to-r from-teal-300 via-purple-300 to-blue-300"
                    style={{
                      left: `calc(50% + ${Math.min(x, x2)}px)`,
                      top: `calc(50% + ${y}px)`,
                      width: `${Math.abs(x - x2)}px`,
                      opacity: Math.min(opacity1, opacity2) * 0.5,
                      transform: `translateZ(${(z + z2) / 2}px)`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </motion.div>

        {/* Rotating Glow Effect */}
        <motion.div
          className="absolute w-40 h-40 rounded-full bg-teal-400/20 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div
          className="absolute w-40 h-40 rounded-full bg-blue-400/20 blur-3xl"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Overlay Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="text-center space-y-2 bg-background/60 backdrop-blur-sm px-8 py-4 rounded-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600 dark:from-teal-400 dark:to-blue-400"
          >
            Powered by Blockchain
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-sm md:text-base text-muted-foreground"
          >
            Decentralized Healthcare Data Management
          </motion.div>
        </div>
      </div>
    </div>
  );
}
