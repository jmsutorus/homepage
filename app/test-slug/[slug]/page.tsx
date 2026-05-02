
import { getPublicProfileData } from "@/lib/db/public-profile";
import { query } from "@/lib/db";

export default async function TestSlugPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const data = await getPublicProfileData(slug);
    
    // Check if the column exists and has any data
    let allSlugs: string[] = [];
    try {
        const rows = await query<any>("SELECT public_slug FROM user WHERE public_slug IS NOT NULL");
        allSlugs = rows.map(r => r.public_slug);
    } catch (e: any) {
        allSlugs = ["Error: " + e.message];
    }
    
    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h1>Slug Test</h1>
            <p>Target Slug: {slug}</p>
            <p>User Found: {data ? "✅ YES" : "❌ NO"}</p>
            
            <hr />
            <h3>Database Debug</h3>
            <p>Slugs in DB: {JSON.stringify(allSlugs, null, 2)}</p>
            <p>Slug matches target: {allSlugs.includes(slug) ? "✅ YES" : "❌ NO"}</p>
            
            <hr />
            <h3>Params Info</h3>
            <pre>{JSON.stringify(await params, null, 2)}</pre>
        </div>
    );
}
