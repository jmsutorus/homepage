"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Timer,
  Users,
  SignalHigh,
  Star,
  ShoppingBag,
  Pencil,
  Trash2,
  Sparkles,
  Utensils,
  BookOpen,
  Bookmark,
  User,
  Share2,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import {
  MealWithIngredients,
  parseSteps,
  parseTags,
  formatTime,
  getTotalTime,
  getDifficulty,
  MealInput,
  IngredientInput,
} from "@/lib/types/meals";
import { MealForm } from "@/components/widgets/meals/meal-form";
import { motion } from "framer-motion";

interface MealDetailContentProps {
  meal: MealWithIngredients;
}

export function MealDetailContent({ meal }: MealDetailContentProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [isEditing, setIsEditing] = useState(false);

  const steps = parseSteps(meal.steps);
  const tags = parseTags(meal.tags);
  const totalTime = getTotalTime(meal);
  const difficulty = getDifficulty(meal);

  const handleUpdateMeal = async (mealData: MealInput, ingredients: IngredientInput[]) => {
    try {
      const response = await fetch(`/api/meals/${meal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mealData),
      });

      if (!response.ok) throw new Error("Failed to update meal");

      await fetch(`/api/meals/${meal.id}/ingredients`, {
        method: "DELETE",
      });

      for (let i = 0; i < ingredients.length; i++) {
        const ingredient = ingredients[i];
        if (ingredient.name.trim()) {
          await fetch(`/api/meals/${meal.id}/ingredients`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...ingredient, order_index: i }),
          });
        }
      }

      toast.success("Recipe updated successfully");
      setIsEditing(false);
      router.refresh();
    } catch {
      toast.error("Failed to update recipe");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/meals/${meal.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      toast.success("Recipe deleted");
      router.push("/recipes");
    } catch {
      toast.error("Failed to delete recipe");
    }
  };

  const handleAddToGrocery = async () => {
    try {
      const response = await fetch("/api/grocery-list/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealId: meal.id }),
      });
      if (!response.ok) throw new Error("Failed to import");
      const result = await response.json();
      toast.success(`Added ${result.count} items to grocery list`);
    } catch {
      toast.error("Failed to add ingredients to grocery list");
    }
  };

  const toggleIngredient = (id: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedIngredients(newChecked);
  };

  return (
    <main className="min-h-screen bg-media-background text-media-on-background selection:bg-media-secondary-fixed selection:text-media-on-secondary-fixed font-lexend pb-24 lg:pb-0">
      
      {/* Immersive Hero */}
      <section className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden flex items-end px-6 md:px-16 pb-16">
        <div className="absolute inset-0 z-0">
          <img 
            alt={meal.name} 
            className="w-full h-full object-cover scale-105" 
            src={meal.image_url || "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071&auto=format&fit=crop"} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-media-primary/90 via-media-primary/40 to-transparent"></div>
        </div>

        {/* Back Button Overlay */}
        <Link href="/recipes" className="absolute top-8 left-8 z-20 bg-media-background/20 backdrop-blur-md p-3 rounded-full hover:bg-media-background/40 transition-all text-media-on-primary">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        
        <div className="relative z-10 max-w-4xl space-y-8">
          <div className="flex flex-wrap gap-3">
            <span className="bg-media-secondary px-4 py-1.5 text-[10px] tracking-[0.2em] text-media-on-secondary uppercase font-black rounded-full">Editorial Feature</span>
            <span className="bg-media-primary-container px-4 py-1.5 text-[10px] tracking-[0.2em] text-media-on-primary-container uppercase font-black rounded-full">Chef's Choice</span>
          </div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9]"
          >
            {meal.name}
          </motion.h1>

          <div className="flex flex-wrap items-center gap-8 text-white/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center bg-white/10">
                <User className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold tracking-tight">By You</span>
            </div>
            
            <div className="hidden md:block h-6 w-px bg-white/20"></div>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  className={`h-4 w-4 ${s <= (meal.rating || 5) ? 'text-media-secondary fill-media-secondary' : 'text-white/20'}`} 
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Metadata Bar */}
      <section className="bg-media-surface-container-lowest py-8 px-6 md:px-16 flex flex-wrap gap-8 md:gap-16 border-b border-media-outline-variant/10 shadow-sm relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-media-surface-container-low flex items-center justify-center text-media-primary">
            <Timer className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-media-on-surface-variant font-black mb-1">Total Time</p>
            <p className="text-base font-bold text-media-primary">{formatTime(totalTime)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-media-surface-container-low flex items-center justify-center text-media-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-media-on-surface-variant font-black mb-1">Servings</p>
            <p className="text-base font-bold text-media-primary">Serves {meal.servings}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-media-surface-container-low flex items-center justify-center text-media-primary">
            <SignalHigh className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-media-on-surface-variant font-black mb-1">Difficulty</p>
            <p className="text-base font-bold text-media-primary">{difficulty}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:ml-auto">
          {tags.map(tag => (
            <span key={tag} className="bg-media-tertiary-fixed text-media-on-tertiary-fixed px-4 py-1.5 rounded-full text-xs font-bold tracking-tight">#{tag}</span>
          ))}
          <div className="flex gap-2 ml-4">
            <Button variant="outline" size="icon" onClick={() => setIsEditing(true)} className="rounded-full border-media-outline-variant text-media-primary hover:bg-media-surface-container-low">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setDeleteDialogOpen(true)} className="rounded-full border-media-outline-variant text-media-error hover:bg-media-error/10">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="px-6 md:px-16 py-20 grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24">
        
        {/* Left Column: Ingredients Sidebar */}
        <aside className="lg:col-span-4 order-2 lg:order-1">
          <div className="bg-media-surface-container-low p-10 rounded-2xl sticky top-24 editorial-shadow border border-media-outline-variant/10">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-3xl font-bold tracking-tighter text-media-primary">The Harvest</h3>
              <Utensils className="h-6 w-6 text-media-secondary" />
            </div>
            
            <ul className="space-y-8">
              {meal.ingredients.map((ing) => (
                <li key={ing.id} className="flex items-start gap-5 group cursor-pointer" onClick={() => toggleIngredient(ing.id)}>
                  <div className={`mt-1.5 w-6 h-6 rounded border-2 flex-shrink-0 transition-all flex items-center justify-center ${
                    checkedIngredients.has(ing.id) 
                      ? "bg-media-primary border-media-primary" 
                      : "border-media-outline-variant group-hover:border-media-primary"
                  }`}>
                    {checkedIngredients.has(ing.id) && <Sparkles className="h-3 w-3 text-white" />}
                  </div>
                  <div>
                    <p className={`text-base font-bold tracking-tight transition-all ${
                      checkedIngredients.has(ing.id) ? "text-media-on-surface-variant/40 line-through" : "text-media-primary"
                    }`}>
                      {ing.name}
                    </p>
                    <p className={`text-sm tracking-tight font-medium ${
                      checkedIngredients.has(ing.id) ? "text-media-on-surface-variant/20" : "text-media-on-surface-variant/70"
                    }`}>
                      {ing.quantity} {ing.unit} {ing.notes && `· ${ing.notes}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <Button 
              onClick={handleAddToGrocery}
              className="mt-12 w-full py-7 bg-media-primary text-media-on-primary rounded-xl font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-3 hover:bg-media-primary/90 transition-all shadow-xl"
            >
              <ShoppingBag className="h-5 w-5" />
              Add to Grocery List
            </Button>
          </div>
        </aside>

        {/* Right Column: Instructions */}
        <div className="lg:col-span-8 order-1 lg:order-2 space-y-20">
          <div className="space-y-12">
            <div className="flex items-end gap-6 border-b border-media-outline-variant/10 pb-8">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-media-primary">Preparation Method</h2>
              <span className="text-xs font-black text-media-secondary uppercase tracking-[0.3em] mb-2">{steps.length} Chapters</span>
            </div>

            <div className="space-y-20">
              {steps.map((step, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-8 group">
                  <div className="flex-shrink-0 w-14 h-14 bg-media-secondary text-media-on-secondary rounded-full flex items-center justify-center text-2xl font-black shadow-lg transition-transform group-hover:scale-110">
                    {idx + 1}
                  </div>
                  <div className="space-y-6 pt-2">
                    <h4 className="text-2xl font-bold text-media-primary tracking-tight">Step {idx + 1}</h4>
                    <p className="text-media-on-surface-variant leading-relaxed text-lg font-light">
                      {step}
                    </p>
                    {idx === 0 && (
                      <div className="rounded-2xl overflow-hidden h-64 bg-media-surface-container relative">
                        <img 
                          alt="Preparation Step" 
                          className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" 
                          src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-media-primary/40 to-transparent"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chef's Private Reserve */}
          <div className="bg-media-primary p-12 md:p-16 rounded-[2rem] text-media-on-primary relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-media-secondary/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="relative z-10 space-y-10">
              <div className="flex items-center gap-4">
                <Sparkles className="h-10 w-10 text-media-secondary" />
                <h3 className="text-3xl font-bold text-white tracking-tight">Chef’s Private Reserve</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <h5 className="text-[10px] uppercase tracking-[0.4em] font-black text-media-secondary">Wine Pairing</h5>
                  <p className="text-lg leading-relaxed text-white/70 italic">
                    Seek a classic **Nebbiolo** or an earthy **Pinot Noir**. The forest floor notes mirror the umami profile of the wild ingredients.
                  </p>
                </div>
                <div className="space-y-4">
                  <h5 className="text-[10px] uppercase tracking-[0.4em] font-black text-media-secondary">Elena's Secret</h5>
                  <p className="text-lg leading-relaxed text-white/70 italic">
                    Infuse your stock with a single dried kombu sheet while heating. It subtly boosts the glutamate levels for a deeper, richer flavor profile.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-media-surface-container-highest/80 backdrop-blur-xl flex justify-around items-center py-5 px-6 z-50 border-t border-media-outline-variant/10">
        <button onClick={() => router.push('/recipes')} className="flex flex-col items-center gap-1 text-media-on-surface-variant/60 hover:text-media-secondary transition-colors">
          <BookOpen className="h-6 w-6" />
          <span className="text-[10px] font-black uppercase tracking-tighter">Journal</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-media-secondary">
          <Utensils className="h-6 w-6 fill-current" />
          <span className="text-[10px] font-black uppercase tracking-tighter">Cook</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-media-on-surface-variant/60">
          <Bookmark className="h-6 w-6" />
          <span className="text-[10px] font-black uppercase tracking-tighter">Saved</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-media-on-surface-variant/60">
          <User className="h-6 w-6" />
          <span className="text-[10px] font-black uppercase tracking-tighter">Studio</span>
        </button>
      </nav>

      {/* Forms & Dialogs */}
      <MealForm
        open={isEditing}
        onOpenChange={setIsEditing}
        title="Edit Recipe"
        initialData={{
          name: meal.name,
          description: meal.description || undefined,
          servings: meal.servings,
          prep_time: meal.prep_time || undefined,
          cook_time: meal.cook_time || undefined,
          image_url: meal.image_url || undefined,
          tags: tags,
          steps: steps,
          rating: meal.rating || undefined,
          ingredients: meal.ingredients.map((ing) => ({
            name: ing.name,
            quantity: ing.quantity || undefined,
            unit: ing.unit || undefined,
            category: ing.category,
            notes: ing.notes || undefined,
            order_index: ing.order_index,
          })),
        }}
        onSubmit={handleUpdateMeal}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-media-surface border-media-outline-variant">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-media-primary">Delete Recipe</AlertDialogTitle>
            <AlertDialogDescription className="text-media-on-surface-variant">
              Are you sure you want to delete &quot;{meal.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-media-outline-variant text-media-primary hover:bg-media-surface-container">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-media-error text-media-on-error hover:bg-media-error/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
