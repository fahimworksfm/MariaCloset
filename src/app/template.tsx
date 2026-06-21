"use client";

import { motion } from "framer-motion";

/** Soft cross-fade between pages. Opacity-only on purpose — a transform here
 *  would turn the fixed-position Petals into a scrolling element. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
