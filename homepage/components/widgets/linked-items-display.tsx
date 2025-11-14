'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { JournalLink } from '@/lib/db/journals';
import { Film, BookOpen, Gamepad2, Tv, MapPin, FileText, Activity } from 'lucide-react';

interface LinkedItemDetails {
  id: number;
  slug: string;
  title: string;
  type?: string;
  category?: string;
  poster?: string;
}

interface LinkedItemsDisplayProps {
  links: JournalLink[];
}

export function LinkedItemsDisplay({ links }: LinkedItemsDisplayProps) {
  const [itemDetails, setItemDetails] = useState<Map<string, LinkedItemDetails>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItemDetails = async () => {
      const details = new Map<string, LinkedItemDetails>();

      for (const link of links) {
        try {
          let endpoint = '';
          let urlPath = '';

          switch (link.linked_type) {
            case 'media':
              if (link.linked_slug) {
                const [type, slug] = link.linked_slug.split('/');
                endpoint = `/api/media/${type}/${slug}`;
                urlPath = `/media/${type}/${slug}`;
              }
              break;
            case 'park':
              if (link.linked_slug) {
                endpoint = `/api/parks/${link.linked_slug}`;
                urlPath = `/parks/${link.linked_slug}`;
              }
              break;
            case 'journal':
              if (link.linked_slug) {
                endpoint = `/api/journals/${link.linked_slug}`;
                urlPath = `/journals/${link.linked_slug}`;
              }
              break;
            case 'activity':
              // For activities, we'll handle this differently
              // For now, just show the ID
              details.set(`${link.linked_type}-${link.linked_id}`, {
                id: link.linked_id,
                slug: '',
                title: `Activity #${link.linked_id}`,
                type: link.linked_type,
              });
              continue;
          }

          if (endpoint) {
            const res = await fetch(endpoint);
            if (res.ok) {
              const data = await res.json();
              details.set(`${link.linked_type}-${link.linked_id}`, {
                id: link.linked_id,
                slug: urlPath,
                title: data.frontmatter?.title || data.title || 'Unknown',
                type: data.frontmatter?.type || data.type || link.linked_type,
                category: data.frontmatter?.category || data.category,
                poster: data.frontmatter?.poster || data.poster,
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching ${link.linked_type} details:`, error);
          // Add fallback details
          details.set(`${link.linked_type}-${link.linked_id}`, {
            id: link.linked_id,
            slug: '',
            title: `${link.linked_type} #${link.linked_id}`,
            type: link.linked_type,
          });
        }
      }

      setItemDetails(details);
      setLoading(false);
    };

    fetchItemDetails();
  }, [links]);

  const getIcon = (type: string, subtype?: string) => {
    if (type === 'media') {
      switch (subtype) {
        case 'movie':
          return <Film className="h-4 w-4" />;
        case 'book':
          return <BookOpen className="h-4 w-4" />;
        case 'game':
          return <Gamepad2 className="h-4 w-4" />;
        case 'tv':
          return <Tv className="h-4 w-4" />;
        default:
          return <Film className="h-4 w-4" />;
      }
    }
    if (type === 'park') return <MapPin className="h-4 w-4" />;
    if (type === 'journal') return <FileText className="h-4 w-4" />;
    if (type === 'activity') return <Activity className="h-4 w-4" />;
    return null;
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading linked items...</div>;
  }

  if (links.length === 0) {
    return <div className="text-sm text-muted-foreground">No linked items</div>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {links.map((link) => {
        const key = `${link.linked_type}-${link.linked_id}`;
        const details = itemDetails.get(key);

        if (!details) return null;

        const content = (
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {details.poster ? (
                  <img
                    src={details.poster}
                    alt={details.title}
                    className="w-12 h-12 object-cover rounded"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                    {getIcon(link.linked_type, details.type)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{details.title}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-xs capitalize">
                      {link.linked_type}
                    </Badge>
                    {details.type && details.type !== link.linked_type && (
                      <Badge variant="secondary" className="text-xs capitalize">
                        {details.type}
                      </Badge>
                    )}
                    {details.category && (
                      <Badge variant="secondary" className="text-xs">
                        {details.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

        if (details.slug) {
          return (
            <Link key={key} href={details.slug}>
              {content}
            </Link>
          );
        }

        return <div key={key}>{content}</div>;
      })}
    </div>
  );
}
