"use client";

import { TreeSuccess } from "./tree-success";
import { motion, AnimatePresence } from "framer-motion";

interface SuccessOverlayProps {
  show: boolean;
  onComplete: () => void;
}

export function SuccessOverlay({ show, onComplete }: SuccessOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-media-surface/90 backdrop-blur-md"
        >
          <TreeSuccess onComplete={onComplete} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
