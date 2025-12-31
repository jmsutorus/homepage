'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, UtensilsCrossed, MapPin, Star, Heart, DollarSign } from 'lucide-react';
import type { Restaurant } from '@/lib/db/restaurants';
import { RestaurantFormDialog } from './restaurant-form-dialog';

interface RestaurantsPageClientProps {
  restaurants: (Restaurant & { visitCount: number })[];
}

export function RestaurantsPageClient({ restaurants: initialRestaurants }: RestaurantsPageClientProps) {
  const router = useRouter();
  const restaurants = initialRestaurants;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);



  // Filter restaurants
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      searchTerm === '' ||
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (restaurant.cuisine?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (restaurant.city?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesStatus = statusFilter === 'all' || restaurant.status === statusFilter;
    const matchesFavorites = !showFavoritesOnly || restaurant.favorite;

    return matchesSearch && matchesStatus && matchesFavorites;
  });

  const getPriceRange = (range: number | null) => {
    if (!range) return null;
    return '$'.repeat(range);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'visited':
        return <Badge variant="default">Visited</Badge>;
      case 'want_to_try':
        return <Badge variant="secondary">Want to Try</Badge>;
      case 'closed':
        return <Badge variant="destructive">Closed</Badge>;
      default:
        return null;
    }
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
            <UtensilsCrossed className="w-7 h-7" />
            Restaurants
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Track your favorite dining spots
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Restaurant
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search restaurants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="all">All Status</option>
          <option value="visited">Visited</option>
          <option value="want_to_try">Want to Try</option>
          <option value="closed">Closed</option>
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
      {(searchTerm || statusFilter !== 'all' || showFavoritesOnly) && (
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredRestaurants.length} of {restaurants.length} restaurants
        </p>
      )}

      {/* Restaurant Grid */}
      {filteredRestaurants.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No restaurants found</p>
            <p className="text-sm mt-1">Add your first restaurant to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRestaurants.map((restaurant) => (
            <Link key={restaurant.id} href={`/restaurants/${restaurant.slug}`}>
              <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer relative overflow-hidden group">
                {/* Cover Image */}
                {restaurant.poster && (
                  <div className="relative h-32 w-full overflow-hidden">
{/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={restaurant.poster}
                      alt={restaurant.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                  </div>
                )}
                
                {/* Favorite Heart */}
                {restaurant.favorite && (
                  <div className={`absolute ${restaurant.poster ? 'top-2 right-2' : 'top-3 right-3'}`}>
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </div>
                )}

                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-1">
                      {restaurant.name}
                    </CardTitle>
                    {getStatusBadge(restaurant.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Cuisine & Price */}
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {restaurant.cuisine && (
                      <span>{restaurant.cuisine}</span>
                    )}
                    {restaurant.price_range && (
                      <span className="flex items-center gap-0.5">
                        <DollarSign className="w-3 h-3" />
                        {getPriceRange(restaurant.price_range)}
                      </span>
                    )}
                  </div>

                  {/* Location */}
                  {(restaurant.city || restaurant.state) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">
                        {[restaurant.city, restaurant.state].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Rating & Visits */}
                  <div className="flex items-center gap-4 text-sm">
                    {restaurant.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{restaurant.rating}</span>
                        <span className="text-muted-foreground text-xs">/10</span>
                      </div>
                    )}
                    {restaurant.visitCount > 0 && (
                      <span className="text-muted-foreground">
                        {restaurant.visitCount} {restaurant.visitCount === 1 ? 'visit' : 'visits'}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Add Restaurant Dialog */}
      <RestaurantFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={handleCreated}
      />
    </div>
  );
}
