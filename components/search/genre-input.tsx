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
import { getGenresWithFrequency, GenreFrequency } from "@/lib/actions/tags";
import { Label } from "@/components/ui/label";

interface GenreInputProps {
  selectedGenres: string[];
  onGenresChange: (genres: string[]) => void;
  label?: string;
  placeholder?: string;
}

export function GenreInput({
  selectedGenres,
  onGenresChange,
  label = "Genres",
  placeholder = "Enter genre or search existing genres..."
}: GenreInputProps) {
  const [open, setOpen] = React.useState(false);
  const [genres, setGenres] = React.useState<GenreFrequency[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isClickingRef = React.useRef(false);

  React.useEffect(() => {
    const fetchGenres = async () => {
      setLoading(true);
      try {
        const data = await getGenresWithFrequency();
        setGenres(data);
      } catch (error) {
        console.error("Failed to fetch genres", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGenres();
  }, []);

  const addGenre = (genre: string) => {
    const trimmedGenre = genre.trim();
    if (trimmedGenre && !selectedGenres.includes(trimmedGenre)) {
      onGenresChange([...selectedGenres, trimmedGenre]);
      setInputValue("");
      setHighlightedIndex(0);
      setOpen(false);
      // Refetch genres to update frequencies
      getGenresWithFrequency().then(setGenres).catch(console.error);
      // Return focus to input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const removeGenre = (genreToRemove: string) => {
    onGenresChange(selectedGenres.filter((g) => g !== genreToRemove));
  };

  // Filter genres based on input value
  const filteredGenres = React.useMemo(() => {
    if (!inputValue.trim()) return genres;
    const searchTerm = inputValue.toLowerCase();
    return genres.filter((genre) =>
      genre.genre.toLowerCase().includes(searchTerm)
    );
  }, [genres, inputValue]);

  // Check if input is an exact match or a new genre
  const exactMatch = genres.find((genre) => genre.genre.toLowerCase() === inputValue.toLowerCase());
  const isNewGenre = inputValue.trim() && !exactMatch;

  // Build list of available options (new genre + filtered existing genres)
  const availableOptions = React.useMemo(() => {
    const options: Array<{ type: 'new' | 'existing'; genre: string; count?: number }> = [];

    if (isNewGenre) {
      options.push({ type: 'new', genre: inputValue });
    }

    filteredGenres.forEach((genre) => {
      if (!selectedGenres.includes(genre.genre)) {
        options.push({ type: 'existing', genre: genre.genre, count: genre.count });
      }
    });

    return options;
  }, [isNewGenre, inputValue, filteredGenres, selectedGenres]);

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
            addGenre(availableOptions[highlightedIndex].genre);
          } else if (inputValue.trim()) {
            // Add the current input value as a new genre
            addGenre(inputValue);
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
        addGenre(inputValue);
      }
    }
  };

  const handleItemClick = (genre: string) => {
    addGenre(genre);
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
                addGenre(inputValue);
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
                  Loading genres...
                </div>
              ) : availableOptions.length > 0 ? (
                <>
                  {isNewGenre && (
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
                          New genre
                        </span>
                      </CommandItem>
                    </CommandGroup>
                  )}

                  {filteredGenres.filter(genre => !selectedGenres.includes(genre.genre)).length > 0 && (
                    <CommandGroup heading="Existing Genres">
                      {filteredGenres.map((genre, index) => {
                        if (selectedGenres.includes(genre.genre)) return null;
                        const optionIndex = isNewGenre ? index + 1 : index;
                        return (
                          <CommandItem
                            key={genre.genre}
                            value={genre.genre}
                            onSelect={() => handleItemClick(genre.genre)}
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
                            <span className="flex-1">{genre.genre}</span>
                            <span className="text-xs text-muted-foreground">
                              {genre.count}
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
                    ? "No matching genres found. Press Enter to create a new genre."
                    : "Start typing to search or create genres..."}
                </CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedGenres.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedGenres.map((genre) => (
            <Badge key={genre} variant="secondary" className="gap-1">
              {genre}
              <button
                type="button"
                onClick={() => removeGenre(genre)}
                className="cursor-pointer ml-1 hover:text-red-500 focus:outline-none focus:text-red-500"
                aria-label={`Remove ${genre} genre`}
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
