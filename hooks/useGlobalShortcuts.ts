"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function useGlobalShortcuts() {
  const router = useRouter();
  const lastKeyRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getDailyDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return '/daily/' + `${year}-${month}-${day}`;
  };

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

      // Handle Alt+Left (Back) and Alt+Right (Forward)
      if (e.altKey) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          router.back();
          return;
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          // Next.js router doesn't have forward(), use window.history
          if (typeof window !== "undefined") {
            window.history.forward();
          }
          return;
        }
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
          case "k":
            router.push("/goals");
            break;
          case "a":
            router.push("/achievements");
            break;
          case "d":
            router.push(getDailyDate());
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

      // Handle "N then X" shortcuts
      if (e.key.toLowerCase() === "n" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        lastKeyRef.current = "n";

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

      // If last key was "N", handle the second key
      if (lastKeyRef.current === "n" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        const key = e.key.toLowerCase();

        switch (key) {
          case "m":
            router.push("/media/new");
            break;
          case "j":
            router.push("/journals/new");
            break;
          case "p":
            router.push("/parks/new");
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
