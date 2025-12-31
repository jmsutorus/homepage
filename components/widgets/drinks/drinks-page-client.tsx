'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Wine, MapPin, Star, Heart } from 'lucide-react';
import type { Drink, DrinkType } from '@/lib/db/drinks';
import { DrinkFormDialog } from './drink-form-dialog';

interface DrinksPageClientProps {
  drinks: (Drink & { logCount: number })[];
}

export function DrinksPageClient({ drinks: initialDrinks }: DrinksPageClientProps) {
  const router = useRouter();
  const drinks = initialDrinks;
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Filter drinks
  const filteredDrinks = drinks.filter((drink) => {
    const matchesSearch =
      searchTerm === '' ||
      drink.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (drink.producer?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (drink.type?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesType = typeFilter === 'all' || drink.type === typeFilter;
    const matchesFavorites = !showFavoritesOnly || drink.favorite;

    return matchesSearch && matchesType && matchesFavorites;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'tasted':
        return <Badge variant="default">Tasted</Badge>;
      case 'want_to_try':
        return <Badge variant="secondary">Want to Try</Badge>;
      case 'stocked':
        return <Badge variant="outline" className="text-green-600 border-green-600">Stocked</Badge>;
      default:
        return null;
    }
  };

  const getDrinkIcon = (type: string | null) => {
    // You might want to map different icons or colors based on drink type
    // primarily just differentiating beer vs wine visually if possible, or just text
    return <Wine className="w-5 h-5 opacity-70" />;
  };

  const handleCreated = () => {
    setShowForm(false);
    router.refresh();
  };

  return (
    <div className="container mx-auto py-6 sm:py-8 px-4 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Wine className="w-7 h-7" />
            Drinks
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Track your beer and wine tastings
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Drink
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search drinks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="all">All Types</option>
          <option value="beer">Beer</option>
          <option value="wine">Wine</option>
          <option value="cocktail">Cocktail</option>
          <option value="spirit">Spirit</option>
          <option value="coffee">Coffee</option>
          <option value="tea">Tea</option>
          <option value="other">Other</option>
        </select>
        <Button
          variant={showFavoritesOnly ? 'default' : 'outline'}
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className="shrink-0"
        >
          <Heart className={`w-4 h-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
          Favorites
        </Button>
      </div>

      {/* Results Count */}
      {(searchTerm || typeFilter !== 'all' || showFavoritesOnly) && (
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredDrinks.length} of {drinks.length} drinks
        </p>
      )}

      {/* Drink Grid */}
      {filteredDrinks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Wine className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No drinks found</p>
            <p className="text-sm mt-1">Add your first drink to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDrinks.map((drink) => (
            <Link key={drink.id} href={`/drinks/${drink.slug}`}>
              <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer relative overflow-hidden group">
                {/* Cover Image */}
                {drink.image_url && (
                  <div className="relative h-32 w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={drink.image_url}
                      alt={drink.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                  </div>
                )}
                
                {/* Favorite Heart */}
                {drink.favorite && (
                  <div className={`absolute ${drink.image_url ? 'top-2 right-2' : 'top-3 right-3'}`}>
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </div>
                )}

                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-1">
                      {drink.name}
                    </CardTitle>
                    {getStatusBadge(drink.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Type & Producer */}
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="capitalize">{drink.type}</span>
                    {drink.producer && (
                      <span className="flex items-center gap-1 line-clamp-1">
                        • {drink.producer}
                      </span>
                    )}
                  </div>

                  {/* Year & ABV */}
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {drink.year && (
                      <span>{drink.year}</span>
                    )}
                    {drink.abv && (
                      <span>{drink.abv}%</span>
                    )}
                  </div>

                  {/* Rating & Logs */}
                  <div className="flex items-center gap-4 text-sm mt-2">
                    {drink.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{drink.rating}</span>
                        <span className="text-muted-foreground text-xs">/10</span>
                      </div>
                    )}
                    {drink.logCount > 0 && (
                      <span className="text-muted-foreground ml-auto">
                        {drink.logCount} {drink.logCount === 1 ? 'log' : 'logs'}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Add Drink Dialog */}
      <DrinkFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={handleCreated}
      />
    </div>
  );
}
