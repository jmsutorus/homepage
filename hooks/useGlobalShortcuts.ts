"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function useGlobalShortcuts() {
  const router = useRouter();
  const lastKeyRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts when typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Handle "G then X" shortcuts
      if (e.key.toLowerCase() === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        lastKeyRef.current = "g";

        // Clear previous timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Reset after 1 second
        timeoutRef.current = setTimeout(() => {
          lastKeyRef.current = null;
        }, 1000);

        return;
      }

      // If last key was "G", handle the second key
      if (lastKeyRef.current === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        const key = e.key.toLowerCase();

        switch (key) {
          case "c":
            router.push("/calendar");
            break;
          case "t":
            router.push("/tasks");
            break;
          case "h":
            router.push("/habits");
            break;
          case "m":
            router.push("/media");
            break;
          case "j":
            router.push("/journals");
            break;
          case "p":
            router.push("/parks");
            break;
          case "e":
            router.push("/exercise");
            break;
          case "s":
            router.push("/settings");
            break;
          default:
            break;
        }

        // Reset
        lastKeyRef.current = null;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [router]);
}
