"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GripVertical, X, Star } from "lucide-react";
import { MealInput, IngredientInput, IngredientCategory, INGREDIENT_CATEGORIES } from "@/lib/types/meals";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MealFormProps {
  initialData?: {
    name: string;
    description?: string;
    steps?: string[];
    servings?: number;
    prep_time?: number;
    cook_time?: number;
    image_url?: string;
    tags?: string[];
    rating?: number;
    ingredients?: IngredientInput[];
  };
  onSubmit: (meal: MealInput, ingredients: IngredientInput[]) => Promise<void>;
  trigger?: React.ReactNode;
  title?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MealForm({
  initialData,
  onSubmit,
  trigger,
  title = "Create Recipe",
  open: controlledOpen,
  onOpenChange,
}: MealFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Use controlled or internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Form state
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [steps, setSteps] = useState<string[]>(initialData?.steps?.length ? initialData.steps : [""]);
  const [servings, setServings] = useState(initialData?.servings || 1);
  const [prepTime, setPrepTime] = useState(initialData?.prep_time || 0);
  const [cookTime, setCookTime] = useState(initialData?.cook_time || 0);
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [rating, setRating] = useState<number>(initialData?.rating || 0);
  const [newTagInput, setNewTagInput] = useState("");
  const [ingredients, setIngredients] = useState<IngredientInput[]>(
    initialData?.ingredients?.length ? initialData.ingredients : [{ name: "", category: "other" }]
  );

  // Reinitialize form when initialData changes (for editing different meals)
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setSteps(initialData.steps?.length ? initialData.steps : [""]);
      setServings(initialData.servings || 1);
      setPrepTime(initialData.prep_time || 0);
      setCookTime(initialData.cook_time || 0);
      setImageUrl(initialData.image_url || "");
      setTags(initialData.tags || []);
      setRating(initialData.rating || 0);
      setIngredients(initialData.ingredients?.length ? initialData.ingredients : [{ name: "", category: "other" }]);
    }
  }, [initialData]);

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const addStep = () => {
    setSteps([...steps, ""]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

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
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
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

      await onSubmit(mealData, ingredientData);
      setOpen(false);
      // Reset form
      if (!initialData) {
        setName("");
        setDescription("");
        setSteps([""]);
        setServings(1);
        setPrepTime(0);
        setCookTime(0);
        setImageUrl("");
        setTags([]);
        setRating(0);
        setNewTagInput("");
        setIngredients([{ name: "", category: "other" }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Recipe Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Chicken Stir Fry"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A quick and healthy weeknight dinner..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  min="1"
                  value={servings}
                  onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prepTime">Prep Time (min)</Label>
                <Input
                  id="prepTime"
                  type="number"
                  min="0"
                  value={prepTime}
                  onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cookTime">Cook Time (min)</Label>
                <Input
                  id="cookTime"
                  type="number"
                  min="0"
                  value={cookTime}
                  onChange={(e) => setCookTime(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Rating</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(rating === star ? 0 : star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    {rating}/5
                  </span>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  className="flex-1"
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
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Ingredients</Label>
              <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                <Plus className="h-4 w-4 mr-1" />
                Add Ingredient
              </Button>
            </div>
            <div className="space-y-2">
              {ingredients.map((ing, index) => (
                <div key={index} className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input
                    value={ing.name}
                    onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
                    placeholder="Name"
                    className="flex-1"
                  />
                  <Input
                    value={ing.quantity || ""}
                    onChange={(e) =>
                      handleIngredientChange(index, "quantity", parseFloat(e.target.value) || 0)
                    }
                    placeholder="Qty"
                    className="w-16"
                    type="number"
                    step="0.25"
                  />
                  <Input
                    value={ing.unit || ""}
                    onChange={(e) => handleIngredientChange(index, "unit", e.target.value)}
                    placeholder="Unit"
                    className="w-20"
                  />
                  <Select
                    value={ing.category || "other"}
                    onValueChange={(value) =>
                      handleIngredientChange(index, "category", value as IngredientCategory)
                    }
                  >
                    <SelectTrigger className="w-28">
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeIngredient(index)}
                    disabled={ingredients.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Steps</Label>
              <Button type="button" variant="outline" size="sm" onClick={addStep}>
                <Plus className="h-4 w-4 mr-1" />
                Add Step
              </Button>
            </div>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="mt-2 text-sm text-muted-foreground w-6 shrink-0">
                    {index + 1}.
                  </span>
                  <Textarea
                    value={step}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    placeholder={`Step ${index + 1}...`}
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStep(index)}
                    disabled={steps.length === 1}
                    className="mt-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Saving..." : initialData ? "Update Recipe" : "Create Recipe"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
