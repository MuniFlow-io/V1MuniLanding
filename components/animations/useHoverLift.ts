"use client";

import { useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export const useHoverLift = () => {
  const [isHovered, setIsHovered] = useState(false);
  const y = useMotionValue(0);
  
  const ySpring = useSpring(y, {
    stiffness: 300,
    damping: 20,
  });

  useEffect(() => {
    y.set(isHovered ? -4 : 0);
  }, [isHovered, y]);

  return {
    y: ySpring,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };
};

