
import { queryOne, query } from "./index";
import type { Goal } from "@jmsutorus/earthbound-shared";

export interface PublicProfileData {
    user: {
        id: string;
        name: string | null;
        image: string | null;
        publishedPhoto: string | null;
        public_slug: string | null;
    };
    showcase: any[]; // Mixed items
    stats: {
        curations: number;
        streak: number;
        expeditions: number;
    };
    aspirations: Goal[];
}

/**
 * Get public profile data for a user by their slug
 */
export async function getPublicProfileData(slug: string): Promise<PublicProfileData | null> {
    // Some routers or browsers might decode '+' as a space. Normalize it back.
    const decodedSlug = decodeURIComponent(slug);
    const normalizedSlug = decodedSlug.includes(' ') ? decodedSlug.replace(/ /g, '+') : decodedSlug;

    const user = await queryOne<any>(
        "SELECT id, name, image, publishedPhoto, public_slug, showProfile FROM user WHERE (public_slug = ? OR public_slug = ? OR public_slug = ?) AND showProfile = 1",
        [slug, decodedSlug, normalizedSlug]
    );

    if (!user) return null;

    const userId = user.id;

    // Fetch published items from all tables
    // We only take featured items for the showcase, or recent ones
    
    const [
        events,
        workouts,
        mediaCompleted,
        mediaInProgress,
        mediaTotalCount,
        vacations,
        goals,
        journals,
        drinks,
        meals,
        restaurants
    ] = await Promise.all([
        query<any>("SELECT *, (SELECT url FROM event_photos WHERE eventId = events.id ORDER BY order_index ASC LIMIT 1) as cover_image FROM events WHERE userId = ? AND published = 1", [userId]),
        query<any>("SELECT *, length as duration, json_array_length(exercises) as exerciseCount FROM workout_activities WHERE userId = ? AND published = 1", [userId]),
        query<any>("SELECT * FROM media_content WHERE userId = ? AND published = 1 AND status = 'completed' ORDER BY completed DESC LIMIT 5", [userId]),
        query<any>("SELECT * FROM media_content WHERE userId = ? AND published = 1 AND status = 'in-progress' ORDER BY created_at DESC LIMIT 1", [userId]),
        queryOne<any>("SELECT COUNT(*) as count FROM media_content WHERE userId = ? AND published = 1", [userId]),
        query<any>("SELECT * FROM vacations WHERE userId = ? AND published = 1 AND end_date <= DATE('now')", [userId]),
        query<any>("SELECT * FROM goals WHERE userId = ? AND published = 1", [userId]),
        query<any>("SELECT * FROM journals WHERE userId = ? AND published = 1", [userId]),
        query<any>("SELECT * FROM drinks WHERE userId = ? AND published = 1", [userId]),
        query<any>("SELECT * FROM meals WHERE userId = ? AND published = 1", [userId]),
        query<any>("SELECT * FROM restaurants WHERE userId = ? AND published = 1", [userId]),
    ]);

    const media = [...mediaInProgress, ...mediaCompleted];

    // Build stats
    const stats = {
        curations: events.length + workouts.length + (mediaTotalCount?.count || 0) + vacations.length + goals.length + journals.length + drinks.length + meals.length + restaurants.length,
        streak: 0,
        expeditions: vacations.length,
    };

    // Filter goals for aspirations (include in_progress and not_started)
    const aspirations = goals.filter(g => g.status === 'in_progress' || g.status === 'not_started').slice(0, 2);

    // Build showcase
    // 1. Start with all featured items
    const showcase: any[] = [];
    
    const featuredItems = [
        ...vacations.filter(v => v.featured).map(v => ({ ...v, cardType: 'vacation' })),
        ...workouts.filter(w => w.featured).map(w => ({ ...w, cardType: 'fitness' })),
        ...media.filter(m => m.featured).map(m => ({ ...m, cardType: 'media' })),
        ...journals.filter(j => j.featured).map(j => ({ ...j, cardType: 'journal' })),
        ...drinks.filter(d => d.featured).map(d => ({ ...d, cardType: 'drink' })),
        ...meals.filter(m => m.featured).map(m => ({ ...m, cardType: 'recipe' })),
        ...restaurants.filter(r => r.featured).map(r => ({ ...r, cardType: 'restaurant' })),
        ...events.filter(e => e.featured).map(e => ({ ...e, cardType: 'event' }))
    ];

    showcase.push(...featuredItems);

    // 2. If we need more items, build a fair pool
    if (showcase.length < 12) {
        const categories = [
            { items: vacations, type: 'vacation', dateField: 'start_date' },
            { items: workouts, type: 'fitness', dateField: 'date' },
            { items: media, type: 'media', dateField: 'completed' },
            { items: journals, type: 'journal', dateField: 'daily_date' },
            { items: drinks, type: 'drink', dateField: 'created_at' },
            { items: meals, type: 'recipe', dateField: 'created_at' },
            { items: restaurants, type: 'restaurant', dateField: 'created_at' },
            { items: events, type: 'event', dateField: 'date' }
        ];

        const existingTypes = new Set(showcase.map(i => i.cardType));
        const existingIds = new Set(showcase.map(i => `${i.cardType}-${i.id}`));
        const pool: any[] = [];

        for (const cat of categories) {
            const unpublished = cat.items
                .filter(item => !item.featured)
                .map(item => ({ 
                    ...item, 
                    cardType: cat.type, 
                    sortDate: item[cat.dateField] || item.created_at 
                }));
            
            // Sort category items by date
            unpublished.sort((a, b) => {
                const dateA = new Date(a.sortDate || 0).getTime();
                const dateB = new Date(b.sortDate || 0).getTime();
                return dateB - dateA;
            });

            // GUARANTEE: If this category isn't in showcase yet, add the most recent one
            if (!existingTypes.has(cat.type) && unpublished.length > 0) {
                const topItem = unpublished[0];
                showcase.push(topItem);
                existingTypes.add(cat.type);
                existingIds.add(`${cat.type}-${topItem.id}`);
                // Remove from further pool consideration
                pool.push(...unpublished.slice(1));
            } else {
                pool.push(...unpublished);
            }
        }

        // 3. Fill the remaining slots (up to 12) with the most recent items from the pool
        pool.sort((a, b) => {
            const dateA = new Date(a.sortDate || 0).getTime();
            const dateB = new Date(b.sortDate || 0).getTime();
            return dateB - dateA;
        });

        for (const item of pool) {
            if (showcase.length >= 12) break;
            const key = `${item.cardType}-${item.id}`;
            if (!existingIds.has(key)) {
                showcase.push(item);
                existingIds.add(key);
            }
        }
    }

    return {
        user,
        showcase: showcase.slice(0, 18),
        stats,
        aspirations
    };
}
