"use client";

import { GroceryListByCategory, CATEGORY_DISPLAY_NAMES } from "@/lib/types/meals";
import { ShoppingBasket, Package } from "lucide-react";

interface PantryWidgetProps {
  groceryList: GroceryListByCategory[];
  onViewAll?: () => void;
}

export function PantryWidget({ groceryList, onViewAll }: PantryWidgetProps) {
  // Get all unchecked items
  const allUncheckedItems = groceryList.flatMap(cat => cat.items.filter(item => !item.checked));
  
  // Show first 4 items for the widget
  const displayedItems = allUncheckedItems.slice(0, 4);
  const remainingCount = Math.max(0, allUncheckedItems.length - 4);

  return (
    <div className="bg-media-surface-container-low p-8 rounded-xl space-y-6 h-full flex flex-col justify-between editorial-shadow">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-media-primary">Pantry Essentials</h3>
          <Package className="h-6 w-6 text-media-secondary" />
        </div>
        
        {displayedItems.length > 0 ? (
          <ul className="space-y-4">
            {displayedItems.map((item) => (
              <li key={item.id} className="flex items-center justify-between group cursor-default">
                <span className="text-media-on-surface-variant group-hover:text-media-primary transition-colors truncate mr-2">
                  {item.name}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-tighter shrink-0 ${
                  item.category === 'meat' ? 'bg-media-secondary-fixed text-media-on-secondary-fixed' :
                  item.category === 'produce' ? 'bg-media-primary-fixed text-media-on-primary-fixed' :
                  'bg-media-tertiary-fixed text-media-on-tertiary-fixed'
                }`}>
                  {CATEGORY_DISPLAY_NAMES[item.category] || item.category}
                </span>
              </li>
            ))}
            {remainingCount > 0 && (
              <li className="text-[10px] text-media-on-surface-variant/50 uppercase font-black tracking-widest pt-2">
                + {remainingCount} more items in list
              </li>
            )}
          </ul>
        ) : (
          <div className="py-8 text-center text-media-on-surface-variant/40 italic text-sm">
            Your pantry is fully stocked.
          </div>
        )}
      </div>

      <button 
        onClick={onViewAll}
        className="w-full mt-8 text-sm font-bold text-media-secondary flex items-center justify-center gap-2 py-3 hover:bg-media-surface-container transition-all rounded-lg border border-transparent hover:border-media-outline-variant/30"
      >
        Go to Grocery List <ShoppingBasket className="h-4 w-4" />
      </button>
    </div>
  );
}
