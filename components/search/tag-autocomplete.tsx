"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getTagsWithFrequency, TagFrequency } from "@/lib/actions/tags";
import { Badge } from "@/components/ui/badge";

interface TagAutocompleteProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagAutocomplete({ selectedTags, onTagsChange }: TagAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [tags, setTags] = React.useState<TagFrequency[]>([]);
  const [loading, setLoading] = React.useState(false);

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

  const handleSelect = (currentValue: string) => {
    const isSelected = selectedTags.includes(currentValue);
    if (isSelected) {
      onTagsChange(selectedTags.filter((t) => t !== currentValue));
    } else {
      onTagsChange([...selectedTags, currentValue]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2 truncate">
                <Tag className="mr-2 h-4 w-4 opacity-50" />
                {selectedTags.length > 0 ? (
                    <span>{selectedTags.length} tags selected</span>
                ) : (
                    "Filter by tags..."
                )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandList>
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup heading="Available Tags">
                {tags.map((tag) => (
                  <CommandItem
                    key={tag.tag}
                    value={tag.tag}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedTags.includes(tag.tag) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="flex-1">{tag.tag}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {tag.count}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
            {selectedTags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs cursor-pointer hover:bg-destructive/20" onClick={() => handleSelect(tag)}>
                    {tag}
                    <span className="ml-1">×</span>
                </Badge>
            ))}
        </div>
      )}
    </div>
  );
}
