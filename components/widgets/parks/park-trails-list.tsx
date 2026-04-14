'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  MapPin, 
  Mountain, 
  TrendingUp, 
  Calendar, 
  ExternalLink,
  Edit2,
  Trash2,
  Loader2,
  Map,
  Star
} from 'lucide-react';
import { ParkTrail } from '@/lib/db/parks';

interface ParkTrailsListProps {
  parkSlug: string;
}

export function ParkTrailsList({ parkSlug }: ParkTrailsListProps) {
  const [trails, setTrails] = useState<ParkTrail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingTrail, setIsAddingTrail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTrail, setEditingTrail] = useState<ParkTrail | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [distance, setDistance] = useState('');
  const [elevationGain, setElevationGain] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [rating, setRating] = useState('');
  const [dateHiked, setDateHiked] = useState('');
  const [notes, setNotes] = useState('');
  const [alltrailsUrl, setAlltrailsUrl] = useState('');

  const fetchTrails = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/parks/${parkSlug}/trails`);
      if (response.ok) {
        const data = await response.json();
        setTrails(data);
      }
    } catch (error) {
      console.error('Error fetching park trails:', error);
    } finally {
      setIsLoading(false);
    }
  }, [parkSlug]);

  useEffect(() => {
    fetchTrails();
  }, [fetchTrails]);

  const resetForm = () => {
    setName('');
    setDistance('');
    setElevationGain('');
    setDifficulty('');
    setRating('');
    setDateHiked('');
    setNotes('');
    setAlltrailsUrl('');
  };

  const getDifficultyColor = (diff: string | null) => {
    if (!diff) return 'default';
    switch (diff.toLowerCase()) {
      case 'easy': return 'secondary';
      case 'moderate': return 'default';
      case 'hard': return 'destructive';
      case 'strenuous': return 'destructive';
      default: return 'default';
    }
  };

  const handleSaveTrail = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        distance: distance ? parseFloat(distance) : null,
        elevation_gain: elevationGain ? parseInt(elevationGain, 10) : null,
        difficulty: difficulty || null,
        rating: rating ? parseInt(rating, 10) : null,
        date_hiked: dateHiked || null,
        notes: notes.trim() || null,
        alltrails_url: alltrailsUrl.trim() || null,
      };

      let response;
      if (editingTrail) {
        response = await fetch(`/api/parks/${parkSlug}/trails/${editingTrail.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`/api/parks/${parkSlug}/trails`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save trail');
      }

      resetForm();
      setIsAddingTrail(false);
      setEditingTrail(null);
      fetchTrails();
    } catch (error) {
      console.error('Error saving trail:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTrail = async (trailId: number) => {
    if (!confirm('Are you sure you want to delete this trail?')) return;

    try {
      const response = await fetch(`/api/parks/${parkSlug}/trails/${trailId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete trail');
      }

      fetchTrails();
    } catch (error) {
      console.error('Error deleting trail:', error);
    }
  };

  const openEditDialog = (trail: ParkTrail) => {
    setEditingTrail(trail);
    setName(trail.name);
    setDistance(trail.distance?.toString() || '');
    setElevationGain(trail.elevation_gain?.toString() || '');
    setDifficulty(trail.difficulty || '');
    setRating(trail.rating?.toString() || '');
    setDateHiked(trail.date_hiked || '');
    setNotes(trail.notes || '');
    setAlltrailsUrl(trail.alltrails_url || '');
  };

  const closeEditDialog = () => {
    setEditingTrail(null);
    resetForm();
  };

  if (isLoading) return null;

  const isFormOpen = isAddingTrail || editingTrail !== null;

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Map className="w-5 h-5" />
          Trails
        </CardTitle>
        <Dialog 
          open={isFormOpen} 
          onOpenChange={(open) => {
            if (!open) {
              setIsAddingTrail(false);
              closeEditDialog();
            } else {
              setIsAddingTrail(true);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => { resetForm(); setIsAddingTrail(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Trail
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTrail ? 'Edit' : 'Add'} Trail</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="trail-name">Trail Name *</Label>
                <Input
                  id="trail-name"
                  placeholder="e.g. Half Dome, Angel's Landing"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trail-distance">Distance (miles)</Label>
                  <Input
                    id="trail-distance"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 5.4"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trail-elevation">Elevation Gain (ft)</Label>
                  <Input
                    id="trail-elevation"
                    type="number"
                    placeholder="e.g. 1200"
                    value={elevationGain}
                    onChange={(e) => setElevationGain(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trail-difficulty">Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                      <SelectItem value="Strenuous">Strenuous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trail-rating">Rating (1-10)</Label>
                  <Input
                    id="trail-rating"
                    type="number"
                    min="1"
                    max="10"
                    placeholder="e.g. 9"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trail-date">Date Hiked</Label>
                <Input
                  id="trail-date"
                  type="date"
                  value={dateHiked}
                  onChange={(e) => setDateHiked(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trail-alltrails">AllTrails URL</Label>
                <Input
                  id="trail-alltrails"
                  type="url"
                  placeholder="https://www.alltrails.com/..."
                  value={alltrailsUrl}
                  onChange={(e) => setAlltrailsUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trail-notes">Notes / Conditions</Label>
                <Textarea
                  id="trail-notes"
                  placeholder="Review the trail, mention wildlife, conditions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSaveTrail} disabled={isSubmitting || !name.trim()}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Trail
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {trails.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Map className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No trails logged yet</p>
            <p className="text-sm mt-1">Keep track of the hikes you conquer here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trails.map((trail) => (
              <div 
                key={trail.id} 
                className="flex flex-col md:flex-row md:items-start justify-between p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors"
              >
                {/* Left side: Trail Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{trail.name}</h3>
                    {trail.difficulty && (
                      <Badge variant={getDifficultyColor(trail.difficulty)}>
                        {trail.difficulty}
                      </Badge>
                    )}
                    {trail.rating && (
                      <div className="flex items-center text-yellow-500 text-sm ml-2 font-medium">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        {trail.rating}/10
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    {trail.distance !== null && (
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {trail.distance} mi
                      </span>
                    )}
                    {trail.elevation_gain !== null && (
                      <span className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {trail.elevation_gain} ft
                      </span>
                    )}
                    {trail.date_hiked && (
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(trail.date_hiked + 'T00:00:00').toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {trail.notes && (
                    <p className="text-sm border-l-2 pl-3 italic text-muted-foreground mt-2">
                      &quot;{trail.notes}&quot;
                    </p>
                  )}
                  
                  {trail.alltrails_url && (
                    <a 
                      href={trail.alltrails_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-500 hover:underline mt-2"
                    >
                      <Mountain className="w-4 h-4 mr-1" />
                      View on AllTrails
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>

                {/* Right side: Actions */}
                <div className="flex items-center gap-2 mt-4 md:mt-0 justify-end flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(trail)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTrail(trail.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
