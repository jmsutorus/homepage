"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Star, UtensilsCrossed, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { showCreationSuccess, showCreationError } from "@/lib/success-toasts";
import type { MealInput, IngredientInput, IngredientCategory } from "@/lib/types/meals";
import { INGREDIENT_CATEGORIES } from "@/lib/types/meals";

interface MobileRecipeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecipeAdded: (meal: MealInput, ingredients: IngredientInput[]) => Promise<void>;
}

export function MobileRecipeSheet({ open, onOpenChange, onRecipeAdded }: MobileRecipeSheetProps) {
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [servings, setServings] = useState(1);
  const [prepTime, setPrepTime] = useState(0);
  const [cookTime, setCookTime] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [ingredients, setIngredients] = useState<IngredientInput[]>([{ name: "", category: "other" }]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Collapsible sections state
  const [ingredientsOpen, setIngredientsOpen] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Reset form when sheet closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setName("");
        setDescription("");
        setServings(1);
        setPrepTime(0);
        setCookTime(0);
        setImageUrl("");
        setRating(0);
        setTags([]);
        setNewTagInput("");
        setIngredients([{ name: "", category: "other" }]);
        setSteps([""]);
        setIngredientsOpen(false);
        setStepsOpen(false);
        setDetailsOpen(false);
      }, 300);
    }
  }, [open]);

  const handleIngredientChange = (
    index: number,
    field: keyof IngredientInput,
    value: string | number
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", category: "other" }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const addStep = () => {
    setSteps([...steps, ""]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      const mealData: MealInput = {
        name: name.trim(),
        description: description.trim() || undefined,
        steps: steps.filter((s) => s.trim()),
        servings,
        prep_time: prepTime || undefined,
        cook_time: cookTime || undefined,
        image_url: imageUrl.trim() || undefined,
        tags: tags.filter(Boolean),
        rating: rating || undefined,
      };

      const ingredientData = ingredients
        .filter((ing) => ing.name.trim())
        .map((ing, index) => ({ ...ing, order_index: index }));

      await onRecipeAdded(mealData, ingredientData);

      // Reset form
      setName("");
      setDescription("");
      setServings(1);
      setPrepTime(0);
      setCookTime(0);
      setImageUrl("");
      setRating(0);
      setTags([]);
      setNewTagInput("");
      setIngredients([{ name: "", category: "other" }]);
      setSteps([""]);

      showCreationSuccess("recipe");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create recipe:", error);
      showCreationError("recipe", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-auto max-h-[90dvh] rounded-t-3xl p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle>New Recipe</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {/* Recipe Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-muted-foreground">
                  Recipe Name *
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Chicken Stir Fry"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 text-base border-2 focus-visible:ring-brand"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-muted-foreground">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="A quick and healthy weeknight dinner..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="resize-none text-base border-2 focus-visible:ring-brand"
                />
              </div>

              {/* Servings, Prep Time, Cook Time */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="servings" className="text-muted-foreground">
                    Servings
                  </Label>
                  <Input
                    id="servings"
                    type="number"
                    min="1"
                    value={servings}
                    onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                    className="h-11 border-2 focus-visible:ring-brand"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prepTime" className="text-muted-foreground">
                    Prep (min)
                  </Label>
                  <Input
                    id="prepTime"
                    type="number"
                    min="0"
                    value={prepTime}
                    onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
                    className="h-11 border-2 focus-visible:ring-brand"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cookTime" className="text-muted-foreground">
                    Cook (min)
                  </Label>
                  <Input
                    id="cookTime"
                    type="number"
                    min="0"
                    value={cookTime}
                    onChange={(e) => setCookTime(parseInt(e.target.value) || 0)}
                    className="h-11 border-2 focus-visible:ring-brand"
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Rating</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(rating === value ? 0 : value)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          value <= rating
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setRating(0)}
                      className="cursor-pointer ml-1 h-8 px-2 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="Add a tag..."
                    className="flex-1 h-11 border-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const tag = newTagInput.trim();
                        if (tag && !tags.includes(tag)) {
                          setTags([...tags, tag]);
                          setNewTagInput("");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-11 w-11"
                    onClick={() => {
                      const tag = newTagInput.trim();
                      if (tag && !tags.includes(tag)) {
                        setTags([...tags, tag]);
                        setNewTagInput("");
                      }
                    }}
                    disabled={!newTagInput.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => setTags(tags.filter((t) => t !== tag))}
                          className="cursor-pointer ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Collapsible Ingredients Section */}
              <Collapsible open={ingredientsOpen} onOpenChange={setIngredientsOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between h-11 border-2"
                  >
                    <span className="flex items-center gap-2">
                      Ingredients
                      {ingredients.filter(i => i.name.trim()).length > 0 && (
                        <Badge variant="secondary" className="h-5 text-xs">
                          {ingredients.filter(i => i.name.trim()).length}
                        </Badge>
                      )}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${ingredientsOpen ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pt-3">
                  {ingredients.map((ing, index) => (
                    <div key={index} className="space-y-2 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Input
                          value={ing.name}
                          onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
                          placeholder="Ingredient name"
                          className="flex-1 h-10 border-2"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeIngredient(index)}
                          disabled={ingredients.length === 1}
                          className="h-10 w-10 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          value={ing.quantity || ""}
                          onChange={(e) =>
                            handleIngredientChange(index, "quantity", parseFloat(e.target.value) || 0)
                          }
                          placeholder="Qty"
                          type="number"
                          step="0.25"
                          className="h-10 border-2"
                        />
                        <Input
                          value={ing.unit || ""}
                          onChange={(e) => handleIngredientChange(index, "unit", e.target.value)}
                          placeholder="Unit"
                          className="h-10 border-2"
                        />
                        <Select
                          value={ing.category || "other"}
                          onValueChange={(value) =>
                            handleIngredientChange(index, "category", value as IngredientCategory)
                          }
                        >
                          <SelectTrigger className="h-10 border-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {INGREDIENT_CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addIngredient}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Ingredient
                  </Button>
                </CollapsibleContent>
              </Collapsible>

              {/* Collapsible Steps Section */}
              <Collapsible open={stepsOpen} onOpenChange={setStepsOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between h-11 border-2"
                  >
                    <span className="flex items-center gap-2">
                      Steps
                      {steps.filter(s => s.trim()).length > 0 && (
                        <Badge variant="secondary" className="h-5 text-xs">
                          {steps.filter(s => s.trim()).length}
                        </Badge>
                      )}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${stepsOpen ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pt-3">
                  {steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="mt-2.5 text-sm text-muted-foreground w-6 shrink-0">
                        {index + 1}.
                      </span>
                      <Textarea
                        value={step}
                        onChange={(e) => handleStepChange(index, e.target.value)}
                        placeholder={`Step ${index + 1}...`}
                        rows={2}
                        className="flex-1 resize-none border-2"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeStep(index)}
                        disabled={steps.length === 1}
                        className="mt-1 h-10 w-10 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addStep}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Step
                  </Button>
                </CollapsibleContent>
              </Collapsible>

              {/* Collapsible Additional Details Section */}
              <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between h-11 border-2"
                  >
                    <span>Additional Details</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${detailsOpen ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pt-3">
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl" className="text-muted-foreground">
                      Image URL
                    </Label>
                    <Input
                      id="imageUrl"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="h-11 border-2 focus-visible:ring-brand"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Submit Button - Fixed at bottom with safe area padding */}
            <SheetFooter className="border-t px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <Button
                type="submit"
                disabled={isSaving || !name.trim()}
                className="w-full h-12 text-base bg-brand hover:bg-brand/90 text-brand-foreground"
              >
                {isSaving ? (
                  "Creating..."
                ) : (
                  <>
                    <UtensilsCrossed className="h-5 w-5 mr-2" />
                    Create Recipe
                  </>
                )}
              </Button>
            </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
