"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface CreatorInputProps {
  selectedCreators: string[];
  onCreatorsChange: (creators: string[]) => void;
  label?: string;
  placeholder?: string;
}

/**
 * CreatorInput - A tag-like input for adding creators (directors, authors, artists, etc.)
 * Allows names with spaces - each creator is added by pressing Enter or clicking Add
 */
export function CreatorInput({
  selectedCreators,
  onCreatorsChange,
  label = "Creator(s)",
  placeholder = "Enter name and press Enter..."
}: CreatorInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addCreator = (creator: string) => {
    const trimmedCreator = creator.trim();
    if (trimmedCreator && !selectedCreators.includes(trimmedCreator)) {
      onCreatorsChange([...selectedCreators, trimmedCreator]);
      setInputValue("");
      // Return focus to input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const removeCreator = (creatorToRemove: string) => {
    onCreatorsChange(selectedCreators.filter((c) => c !== creatorToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        addCreator(inputValue);
      }
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
          />
        </div>
        <Button
          type="button"
          onClick={() => {
            if (inputValue.trim()) {
              addCreator(inputValue);
            }
          }}
          disabled={!inputValue.trim()}
          variant="outline"
        >
          Add
        </Button>
      </div>

      {selectedCreators.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedCreators.map((creator) => (
            <Badge key={creator} variant="outline" className="gap-1">
              {creator}
              <button
                type="button"
                onClick={() => removeCreator(creator)}
                className="cursor-pointer ml-1 hover:text-red-500 focus:outline-none focus:text-red-500"
                aria-label={`Remove ${creator}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
