"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getTagsWithFrequency, TagFrequency } from "@/lib/actions/tags";
import { Label } from "@/components/ui/label";

interface TagInputProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
}

export function TagInput({
  selectedTags,
  onTagsChange,
  label = "Tags",
  placeholder = "Enter tag or search existing tags..."
}: TagInputProps) {
  const [open, setOpen] = React.useState(false);
  const [tags, setTags] = React.useState<TagFrequency[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isClickingRef = React.useRef(false);

  React.useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        const data = await getTagsWithFrequency();
        setTags(data);
      } catch (error) {
        console.error("Failed to fetch tags", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      onTagsChange([...selectedTags, trimmedTag]);
      setInputValue("");
      setHighlightedIndex(0);
      setOpen(false);
      // Refetch tags to update frequencies
      getTagsWithFrequency().then(setTags).catch(console.error);
      // Return focus to input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter((t) => t !== tagToRemove));
  };

  // Filter tags based on input value
  const filteredTags = React.useMemo(() => {
    if (!inputValue.trim()) return tags;
    const searchTerm = inputValue.toLowerCase();
    return tags.filter((tag) =>
      tag.tag.toLowerCase().includes(searchTerm)
    );
  }, [tags, inputValue]);

  // Check if input is an exact match or a new tag
  const exactMatch = tags.find((tag) => tag.tag.toLowerCase() === inputValue.toLowerCase());
  const isNewTag = inputValue.trim() && !exactMatch;

  // Build list of available options (new tag + filtered existing tags)
  const availableOptions = React.useMemo(() => {
    const options: Array<{ type: 'new' | 'existing'; tag: string; count?: number }> = [];

    if (isNewTag) {
      options.push({ type: 'new', tag: inputValue });
    }

    filteredTags.forEach((tag) => {
      if (!selectedTags.includes(tag.tag)) {
        options.push({ type: 'existing', tag: tag.tag, count: tag.count });
      }
    });

    return options;
  }, [isNewTag, inputValue, filteredTags, selectedTags]);

  // Reset highlighted index when options change
  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [availableOptions.length]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }

    if (open) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < availableOptions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case "Enter":
          e.preventDefault();
          if (availableOptions.length > 0 && highlightedIndex >= 0) {
            // Add the highlighted option
            addTag(availableOptions[highlightedIndex].tag);
          } else if (inputValue.trim()) {
            // Add the current input value as a new tag
            addTag(inputValue);
          }
          break;
        case "Escape":
          e.preventDefault();
          setOpen(false);
          break;
        case "Tab":
          if (open) {
            setOpen(false);
          }
          break;
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    }
  };

  const handleItemClick = (tag: string) => {
    addTag(tag);
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      <Popover open={open} onOpenChange={setOpen}>
        <div className="flex gap-2">
          <PopoverTrigger asChild>
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (!open) setOpen(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                onBlur={() => {
                  // Don't close if we're clicking an item
                  if (!isClickingRef.current) {
                    setTimeout(() => setOpen(false), 150);
                  }
                }}
              />
            </div>
          </PopoverTrigger>
          <Button
            type="button"
            onClick={() => {
              if (inputValue.trim()) {
                addTag(inputValue);
              }
            }}
            disabled={!inputValue.trim()}
            variant="outline"
          >
            Add
          </Button>
        </div>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandList>
              {loading ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  Loading tags...
                </div>
              ) : availableOptions.length > 0 ? (
                <>
                  {isNewTag && (
                    <CommandGroup heading="Create New">
                      <CommandItem
                        value={inputValue}
                        onSelect={() => handleItemClick(inputValue)}
                        onMouseDown={() => {
                          isClickingRef.current = true;
                        }}
                        onMouseUp={() => {
                          isClickingRef.current = false;
                        }}
                        className={`cursor-pointer hover:bg-accent ${
                          highlightedIndex === 0 ? "bg-accent" : ""
                        }`}
                        onMouseEnter={() => setHighlightedIndex(0)}
                      >
                        <span className="flex-1">
                          Create &quot;{inputValue}&quot;
                        </span>
                        <span className="text-xs text-muted-foreground">
                          New tag
                        </span>
                      </CommandItem>
                    </CommandGroup>
                  )}

                  {filteredTags.filter(tag => !selectedTags.includes(tag.tag)).length > 0 && (
                    <CommandGroup heading="Existing Tags">
                      {filteredTags.map((tag, index) => {
                        if (selectedTags.includes(tag.tag)) return null;
                        const optionIndex = isNewTag ? index + 1 : index;
                        return (
                          <CommandItem
                            key={tag.tag}
                            value={tag.tag}
                            onSelect={() => handleItemClick(tag.tag)}
                            onMouseDown={() => {
                              isClickingRef.current = true;
                            }}
                            onMouseUp={() => {
                              isClickingRef.current = false;
                            }}
                            className={` ${
                              highlightedIndex === optionIndex ? "bg-accent" : ""
                            }`}
                            onMouseEnter={() => setHighlightedIndex(optionIndex)}
                          >
                            <span className="flex-1">{tag.tag}</span>
                            <span className="text-xs text-muted-foreground">
                              {tag.count}
                            </span>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  )}
                </>
              ) : (
                <CommandEmpty>
                  {inputValue.trim()
                    ? "No matching tags found. Press Enter to create a new tag."
                    : "Start typing to search or create tags..."}
                </CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="outline" className="gap-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="cursor-pointer ml-1 hover:text-red-500 focus:outline-none focus:text-red-500"
                aria-label={`Remove ${tag} tag`}
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
