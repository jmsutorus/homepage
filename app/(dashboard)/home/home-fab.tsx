"use client";

import * as React from "react";
import Link from "next/link";
import { useHaptic } from "@/hooks/use-haptic";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface HomeFABProps {
  todayStr: string;
}

export function HomeFAB({ todayStr }: HomeFABProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const haptic = useHaptic();
  const menuRef = React.useRef<HTMLDivElement>(null);

  const toggleOpen = () => {
    haptic.trigger("light");
    setIsOpen(!isOpen);
  };

  // Close on escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const actions = [
    { 
      href: "/media/new", 
      label: "Add Media", 
      icon: "add_to_queue", 
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" 
    },
    { 
      href: "/journals/new", 
      label: "New Journal", 
      icon: "edit_note", 
      color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" 
    },
    { 
      href: "/vacations/new", 
      label: "Plan Vacation", 
      icon: "flight_takeoff", 
      color: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" 
    },
    { 
      href: `/daily/${todayStr}`, 
      label: "Log Mood", 
      icon: "mood", 
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
    },
    { 
      href: "/tasks", 
      label: "Manage Tasks", 
      icon: "check_circle", 
      color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" 
    },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-[2px] z-40 cursor-pointer"
          />
        )}
      </AnimatePresence>

      <div 
        ref={menuRef} 
        className="fixed bottom-8 right-8 md:bottom-12 md:right-12 flex flex-col items-end z-50 pointer-events-none"
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20, transition: { duration: 0.15 } }}
              className="flex flex-col items-end gap-3 mb-4 pointer-events-auto"
            >
              {actions.map((action, index) => (
                <motion.div
                  key={action.href}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    transition: { delay: index * 0.04, type: "spring", stiffness: 260, damping: 20 }
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.8,
                    transition: { duration: 0.1 } 
                  }}
                >
                  <Link
                    href={action.href}
                    onClick={() => {
                      haptic.trigger("medium");
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 group"
                  >
                    <span className="bg-white/90 dark:bg-[#061b0e]/90 backdrop-blur-md text-[#061b0e] dark:text-[#faf9f6] px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md border border-outline-variant/10">
                      {action.label}
                    </span>
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-lg transition-all duration-300 border hover:scale-110 hover:shadow-xl active:scale-95", 
                      action.color
                    )}>
                      <span className="material-symbols-outlined text-2xl font-semibold">{action.icon}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={toggleOpen}
          className={cn(
            "w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group pointer-events-auto",
            isOpen 
              ? "bg-white dark:bg-[#061b0e] text-[#061b0e] dark:text-[#faf9f6] rotate-180" 
              : "bg-[#9f402d] text-white"
          )}
        >
          <span className={cn(
            "material-symbols-outlined text-3xl font-bold transition-transform duration-300",
            isOpen ? "rotate-90" : ""
          )}>
            {isOpen ? "close" : "edit_note"}
          </span>
        </button>
      </div>
    </>
  );
}
