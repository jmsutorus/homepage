import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, MapPin } from "lucide-react";
import { formatDateLongSafe } from "@/lib/utils";

interface RelatedMediaItem {
  id: number;
  slug: string;
  title: string;
  type: string;
  poster: string | null;
  rating: number | null;
  status: string;
  matchScore: number;
}

interface RelatedJournalItem {
  id: number;
  slug: string;
  title: string;
  journal_type: string;
  daily_date: string | null;
  created_at: string;
  matchScore: number;
}

interface RelatedParkItem {
  id: number;
  slug: string;
  title: string;
  category: string;
  state: string | null;
  poster: string | null;
  matchScore: number;
}

interface RelatedMediaProps {
  items: RelatedMediaItem[];
  title?: string;
}

interface RelatedJournalsProps {
  items: RelatedJournalItem[];
  title?: string;
}

interface RelatedParksProps {
  items: RelatedParkItem[];
  title?: string;
}

export function RelatedMedia({ items, title = "Related Media" }: RelatedMediaProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((item) => (
          <Link key={item.id} href={`/media/${item.type}/${item.slug}`}>
            <Card className="overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer h-full">
              <CardContent className="p-0">
                {item.poster ? (
                  <div className="aspect-[2/3] relative">
                    <img
                      src={item.poster}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {item.rating && (
                      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        <span className="text-xs font-semibold text-white">
                          {item.rating}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-[2/3] bg-muted flex items-center justify-center">
                    <Badge variant="outline" className="capitalize">
                      {item.type}
                    </Badge>
                  </div>
                )}
                <div className="p-3 space-y-1">
                  <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
                    {item.title}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="text-xs capitalize"
                  >
                    {item.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function RelatedJournals({ items, title = "Related Journal Entries" }: RelatedJournalsProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Link key={item.id} href={`/journals/${item.slug}`}>
            <Card className="hover:ring-2 hover:ring-primary transition-all cursor-pointer h-full">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm line-clamp-2 flex-1">
                    {item.title}
                  </h3>
                  <Badge variant="outline" className="text-xs capitalize shrink-0">
                    {item.journal_type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {item.journal_type === "daily" && item.daily_date
                      ? formatDateLongSafe(item.daily_date, "en-US")
                      : formatDateLongSafe(item.created_at, "en-US")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function RelatedParks({ items, title = "Related Parks" }: RelatedParksProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((item) => (
          <Link key={item.id} href={`/parks/${item.slug}`}>
            <Card className="overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer h-full">
              <CardContent className="p-0">
                {item.poster ? (
                  <div className="aspect-[4/3] relative">
                    <img
                      src={item.poster}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="p-3 space-y-1">
                  <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
                    {item.title}
                  </h3>
                  <div className="items-center gap-2">
                    <Badge variant="secondary" className="text-xs capitalize mt-2">
                      {item.category}
                    </Badge>
                    <div>
                    {item.state && (
                      <Badge variant="secondary" className="text-xs capitalize text-muted-foreground mt-2">
                      {item.state}
                    </Badge>
                    )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
