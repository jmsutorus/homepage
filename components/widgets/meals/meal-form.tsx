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
      <DialogContent 
        showCloseButton={false} 
        className="p-0 border-none sm:max-w-4xl bg-media-surface-container-lowest overflow-hidden shadow-[0_32px_64px_-12px_rgba(6,27,14,0.12)] rounded-3xl max-h-[90vh] flex flex-col"
      >
        {/* Premium Header */}
        <div className="bg-media-primary-container px-10 py-12 flex flex-col gap-2 relative shrink-0">
          <div className="flex justify-between items-start z-10 relative">
            <h2 className="text-3xl font-bold tracking-tight text-media-on-primary-container font-lexend">
              {initialData ? 'Refine Blueprint' : 'Define New Recipe'}
            </h2>
            <button 
              type="button"
              onClick={() => setOpen(false)}
              className="cursor-pointer text-media-on-primary-container/60 hover:text-media-on-primary-container transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-media-on-primary-container/80 text-sm max-w-md z-10 relative font-medium leading-relaxed">
            Configure the essence, ingredients, and procedural steps for your next culinary creation.
          </p>
          {/* Decorative element */}
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-media-secondary opacity-10 blur-[80px] rounded-full translate-x-16 translate-y-16"></div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-12">
          {/* Section 1: The Essence */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-media-secondary px-3 py-1 bg-media-secondary/10 rounded-full">Section 01</span>
              <h3 className="text-xl font-bold text-media-primary tracking-tight font-lexend">The Essence</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              <div className="md:col-span-12 space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Recipe Identity</label>
                <div className="relative">
                  <input 
                    autoFocus
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-bold text-2xl font-lexend placeholder:text-media-on-surface-variant/20"
                    placeholder="e.g. Oak-Smoked Forest Risotto"
                  />
                </div>
              </div>

              <div className="md:col-span-12 space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Narrative Context (Description)</label>
                <div className="relative">
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-medium text-lg resize-none placeholder:text-media-on-surface-variant/20 font-lexend"
                    placeholder="Describe the soul of this dish..."
                  />
                </div>
              </div>

              <div className="md:col-span-4 space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Intended Servings</label>
                <div className="relative">
                  <input 
                    type="number"
                    min="1"
                    value={servings}
                    onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                    className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-bold text-xl font-lexend"
                  />
                </div>
              </div>

              <div className="md:col-span-4 space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Prep Phase (Min)</label>
                <div className="relative">
                  <input 
                    type="number"
                    min="0"
                    value={prepTime}
                    onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
                    className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-bold text-xl font-lexend"
                  />
                </div>
              </div>

              <div className="md:col-span-4 space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Active Fire (Min)</label>
                <div className="relative">
                  <input 
                    type="number"
                    min="0"
                    value={cookTime}
                    onChange={(e) => setCookTime(parseInt(e.target.value) || 0)}
                    className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-bold text-xl font-lexend"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Visual Asset (Image URL)</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-medium text-base font-lexend placeholder:text-media-on-surface-variant/20"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Culinary Rating</label>
                <div className="h-[68px] flex items-center justify-between px-8 bg-media-surface-container-low rounded-2xl border-2 border-transparent">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(rating === star ? 0 : star)}
                        className="cursor-pointer transition-all hover:scale-125"
                      >
                        <Star
                          className={`h-6 w-6 transition-colors ${
                            star <= rating
                              ? "text-media-secondary fill-media-secondary"
                              : "text-media-on-surface-variant/20"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <span className="text-sm font-black text-media-secondary uppercase tracking-widest">
                      {rating} / 5
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Classification (Tags)</label>
              <div className="flex flex-wrap gap-3 p-6 bg-media-surface-container-low rounded-2xl border-2 border-transparent">
                {tags.map((tag) => (
                  <div key={tag} className="flex items-center gap-2 px-4 py-2 bg-media-secondary/10 text-media-secondary rounded-full text-xs font-bold uppercase tracking-wider group border border-media-secondary/20">
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                      className="cursor-pointer hover:text-media-error transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <input
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="+ Add Classification"
                  className="bg-transparent border-none focus:ring-0 text-sm font-bold text-media-primary placeholder:text-media-on-surface-variant/40 w-40"
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
              </div>
            </div>
          </div>

          {/* Section 2: Ingredients */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-[0.3em] font-black text-media-secondary px-3 py-1 bg-media-secondary/10 rounded-full">Section 02</span>
                <h3 className="text-xl font-bold text-media-primary tracking-tight font-lexend">Ingredients</h3>
              </div>
              <button 
                type="button" 
                onClick={addIngredient}
                className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-media-secondary hover:text-media-primary flex items-center gap-2 transition-colors px-4 py-2 bg-media-secondary/5 rounded-lg border border-media-secondary/10"
              >
                <Plus className="h-4 w-4" /> Add Ingredient
              </button>
            </div>
            
            <div className="space-y-4">
              {ingredients.map((ing, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-media-surface-container-low/50 p-4 rounded-2xl border border-media-outline-variant/5">
                  <div className="md:col-span-1 flex justify-center">
                    <GripVertical className="h-5 w-5 text-media-on-surface-variant/20 shrink-0" />
                  </div>
                  <div className="md:col-span-5 relative">
                    <input
                      value={ing.name}
                      onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
                      placeholder="Element Name"
                      className="w-full bg-media-surface-container-low px-4 py-3 rounded-xl border border-transparent focus:border-media-secondary text-media-primary font-bold text-sm"
                    />
                  </div>
                  <div className="md:col-span-2 flex gap-2">
                    <input
                      value={ing.quantity || ""}
                      onChange={(e) =>
                        handleIngredientChange(index, "quantity", parseFloat(e.target.value) || 0)
                      }
                      placeholder="Qty"
                      className="w-full bg-media-surface-container-low px-4 py-3 rounded-xl border border-transparent focus:border-media-secondary text-media-primary font-bold text-sm text-center"
                      type="number"
                      step="0.25"
                    />
                    <input
                      value={ing.unit || ""}
                      onChange={(e) => handleIngredientChange(index, "unit", e.target.value)}
                      placeholder="Unit"
                      className="w-full bg-media-surface-container-low px-4 py-3 rounded-xl border border-transparent focus:border-media-secondary text-media-primary font-medium text-xs text-center"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Select
                      value={ing.category || "other"}
                      onValueChange={(value) =>
                        handleIngredientChange(index, "category", value as IngredientCategory)
                      }
                    >
                      <SelectTrigger className="bg-media-surface-container-low border-transparent focus:ring-0 rounded-xl text-xs font-bold uppercase tracking-widest text-media-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-media-surface-container border-media-outline-variant">
                        {INGREDIENT_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat} className="text-xs font-bold uppercase tracking-widest">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      disabled={ingredients.length === 1}
                      className="cursor-pointer p-2 text-media-on-surface-variant/40 hover:text-media-error disabled:opacity-0 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Steps */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-[0.3em] font-black text-media-secondary px-3 py-1 bg-media-secondary/10 rounded-full">Section 03</span>
                <h3 className="text-xl font-bold text-media-primary tracking-tight font-lexend">Steps</h3>
              </div>
              <button 
                type="button" 
                onClick={addStep}
                className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-media-secondary hover:text-media-primary flex items-center gap-2 transition-colors px-4 py-2 bg-media-secondary/5 rounded-lg border border-media-secondary/10"
              >
                <Plus className="h-4 w-4" /> Add Step
              </button>
            </div>
            
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-8 group">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-media-primary text-media-on-primary flex items-center justify-center text-sm font-black font-lexend shadow-lg shadow-media-primary/20 shrink-0">
                      {(index + 1).toString().padStart(2, '0')}
                    </div>
                    {index < steps.length - 1 && <div className="w-px h-full bg-media-outline-variant/30"></div>}
                  </div>
                  <div className="flex-1 space-y-2 pb-6">
                    <div className="relative">
                      <textarea
                        value={step}
                        onChange={(e) => handleStepChange(index, e.target.value)}
                        placeholder={`Execute step ${(index + 1)}...`}
                        rows={2}
                        className="w-full bg-media-surface-container-low px-6 py-5 rounded-2xl border-2 border-transparent focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-medium text-base resize-none placeholder:text-media-on-surface-variant/20 font-lexend"
                      />
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        disabled={steps.length === 1}
                        className="cursor-pointer absolute -right-2 top-0 p-2 text-media-on-surface-variant/0 group-hover:text-media-on-surface-variant/40 hover:!text-media-error disabled:!hidden transition-all translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-10 pt-10 border-t border-media-outline-variant/10 shrink-0">
            <button 
              type="button"
              onClick={() => setOpen(false)}
              className="cursor-pointer text-[10px] font-black uppercase tracking-[0.2em] text-media-on-surface-variant hover:text-media-primary transition-colors font-lexend"
            >
              Terminate
            </button>
            <button 
              type="submit"
              disabled={loading || !name.trim()}
              className="cursor-pointer w-full md:w-auto px-10 h-16 bg-media-secondary text-media-on-secondary rounded-2xl font-black text-lg tracking-widest uppercase shadow-2xl shadow-media-secondary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 font-lexend"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 rounded-full border-2 border-media-on-secondary/30 border-t-media-on-secondary animate-spin" />
                  Processing...
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined">{initialData ? 'save' : 'auto_awesome'}</span>
                  {initialData ? 'Refine Protocol' : 'Establish Protocol'}
                </div>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
