import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getJournalBySlug, getLinksForJournal, getMoodForDate, getAdjacentJournals } from "@/lib/db/journals";
import { formatDateLongSafe, cn } from "@/lib/utils";
import { ExportButton } from "@/components/widgets/shared/export-button";
import { getRelatedJournals } from "@/lib/actions/related-content";
import { getUserId } from "@/lib/auth/server";

interface JournalDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function JournalDetailPage({ params }: JournalDetailPageProps) {
  const { slug } = await params;
  const userId = await getUserId();
  const journal = await getJournalBySlug(slug, userId);

  if (!journal) {
    notFound();
  }

  // Get linked items
  const links = await getLinksForJournal(journal.id);

  // For daily journals, get mood from mood_entries
  let displayMood = journal.mood;
  if (journal.journal_type === "daily" && journal.daily_date) {
    const moodRating = await getMoodForDate(journal.daily_date, userId);
    if (moodRating !== null) {
      displayMood = moodRating;
    }
  }

  // Fetch related journals based on tags and mood
  const relatedJournals = await getRelatedJournals(
    slug,
    journal.tags || [],
    displayMood !== null && displayMood !== undefined ? displayMood : undefined,
    6
  );

  // Fetch adjacent journals for navigation
  const { prev, next } = await getAdjacentJournals(slug, userId);

  const heroImage = journal.image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDdAehNfGris-7VY1n1jbjVISrCikrv3DAOB3BL4tgz2yyr8Xyo0uz1zsktn0p8MBzwAmf9d22pM1x1bzjYvOMJLFC3ClYfNcKKf4R24yCA9jP4HwytP9OqQ-7fGWMCyYbj_7zqfsDS3V3HjBh6F2wtd3OCriCsR2jy7yERtzYS63jes30AeibIVfZpvQ37hRP8QJj2DE3EBHzWRKfHX-Bteprj-eA7TQ62b5j9jrPHzdndOBTYrb7ENvp5zThauyuqywRby76Shco";

  const mdxComponents = {
    p: (props: any) => (
      <p 
        {...props} 
        className={cn(
          "mb-6 leading-relaxed text-lg font-light first-of-type:first-letter:text-7xl first-of-type:first-letter:font-black first-of-type:first-letter:text-[#061b0e] first-of-type:first-letter:mr-3 first-of-type:first-letter:float-left first-of-type:first-letter:leading-[0.8]",
          props.className
        )} 
      />
    ),
    h2: (props: any) => <h2 {...props} className="text-2xl font-bold text-[#061b0e] mt-12 mb-6" />,
    h3: (props: any) => <h3 {...props} className="text-xl font-bold text-[#061b0e] mt-8 mb-4" />,
    blockquote: (props: any) => (
      <div className="bg-[#f4f3f1] p-10 rounded-xl my-12 border-l-4 border-[#9f402d]">
        <p className="text-[#061b0e] italic font-medium text-xl leading-snug m-0">{props.children}</p>
      </div>
    ),
  };

  const dayOfWeek = journal.daily_date 
    ? new Date(journal.daily_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })
    : formatDateLongSafe(journal.created_at, "en-US").split(',')[0];

  const mainTitle = journal.journal_type === 'daily' && journal.daily_date
    ? new Date(journal.daily_date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : journal.title;

  return (
    <div className="flex min-h-screen bg-[#faf9f6] font-['Lexend'] text-[#1a1c1a]">
      <main className="flex-1 bg-[#faf9f6] min-h-screen pb-20">
        {/* Hero Section */}
        <div className="relative w-full h-[665px] overflow-hidden group">
          <img 
            alt={journal.title} 
            className="w-full h-full object-cover brightness-[0.85] group-hover:brightness-90 transition-all duration-700" 
            src={heroImage}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#061b0e]/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
              <div className="space-y-2">
                <p className="text-[#ffdad3] text-sm font-bold tracking-[0.2em] uppercase">{dayOfWeek}</p>
                <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none">{mainTitle}</h1>
              </div>
              <div className="flex flex-col items-end">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-xl flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#fd876f]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {displayMood && displayMood > 5 ? 'mood' : 'mood_bad'}
                    </span>
                    <span className="font-bold text-xl text-white">{displayMood ?? "?"}/10</span>
                  </div>
                  <div className="w-[1px] h-6 bg-white/20"></div>
                  <p className="text-white/80 text-xs font-medium tracking-wide capitalize">{journal.journal_type} Journal</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-10">
          {/* Metadata & Actions Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-10 border-b border-[#e3e2e0] mb-12">
            <div className="flex gap-4 items-center">
              <Link 
                href={`/journals/${slug}/edit`}
                className="flex items-center gap-2 text-[#061b0e] font-semibold hover:text-[#9f402d] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#efeeeb]"
              >
                <span className="material-symbols-outlined text-[20px]">edit</span>
                <span className="text-sm">Edit Entry</span>
              </Link>
              <div className="w-1 h-1 rounded-full bg-[#c3c8c1]"></div>
              {journal.content && (
                <div className="flex items-center gap-2 text-[#061b0e] font-semibold hover:text-[#9f402d] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#efeeeb]">
                   <span className="material-symbols-outlined text-[20px]">ios_share</span>
                   <ExportButton
                    content={journal.content}
                    filename={journal.slug}
                    className="text-sm font-semibold p-0 bg-transparent hover:bg-transparent border-none shadow-none h-auto text-current"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-8">
              {journal.tags && journal.tags.length > 0 && (
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold text-[#434843]/50 uppercase tracking-widest self-center mr-1">Tags</span>
                  {journal.tags.map(tag => (
                    <span key={tag} className="bg-[#e4e4cc] text-[#1b1d0e] px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              {links.length > 0 && (
                <>
                  <div className="w-[1px] h-4 bg-[#c3c8c1] hidden lg:block"></div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-[#434843]/50 uppercase tracking-widest">Linked</span>
                    <div className="flex gap-3">
                      {links.map((link, idx) => (
                        <Link 
                          key={idx} 
                          href={`/${link.linked_type}s/${link.linked_slug || link.linked_id}`}
                          className="text-xs font-bold text-[#061b0e] hover:text-[#9f402d] transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-xs">
                            {link.linked_type === 'media' ? 'movie' : link.linked_type === 'park' ? 'park' : 'link'}
                          </span>
                          {link.linked_slug?.replace(/-/g, ' ') || link.linked_type}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
            <div className="md:col-span-8">
              <article className="prose prose-lg max-w-none text-[#434843]">
                {journal.content ? (
                  <MDXRemote source={journal.content} components={mdxComponents} />
                ) : (
                  <p className="italic text-muted-foreground">No content provided for this entry.</p>
                )}
              </article>
            </div>

            <div className="md:col-span-4 space-y-8">
              {relatedJournals.length > 0 && (
                <div className="bg-[#f4f3f1] p-6 rounded-xl space-y-6">
                  <section>
                    <h3 className="text-[#061b0e] font-black tracking-tight text-xs uppercase mb-4 opacity-50">Related Archive</h3>
                    <div className="space-y-4">
                      {relatedJournals.map((rel) => (
                        <Link key={rel.slug} href={`/journals/${rel.slug}`} className="group block">
                          <p className="text-[#9f402d] font-bold text-[10px] mb-0.5 uppercase tracking-wider">
                            {rel.journal_type}
                          </p>
                          <h4 className="text-[#061b0e] font-bold text-sm group-hover:text-[#9f402d] transition-colors">
                            {rel.title}
                          </h4>
                        </Link>
                      ))}
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>

          {/* Footer Navigation */}
          <footer className="mt-32 pt-16 border-t border-[#e3e2e0] flex justify-between items-center">
            {prev ? (
              <Link href={`/journals/${prev.slug}`} className="group">
                <p className="text-[#434843] text-xs uppercase font-bold tracking-widest mb-1">Previous Entry</p>
                <h5 className="text-[#061b0e] font-black text-lg group-hover:text-[#9f402d] transition-colors">
                  {prev.title}
                </h5>
              </Link>
            ) : <div />}
            
            {next ? (
              <Link href={`/journals/${next.slug}`} className="group text-right">
                <p className="text-[#434843] text-xs uppercase font-bold tracking-widest mb-1">Next Entry</p>
                <h5 className="text-[#061b0e] font-black text-lg group-hover:text-[#9f402d] transition-colors">
                  {next.title}
                </h5>
              </Link>
            ) : <div />}
          </footer>
        </div>
      </main>
    </div>
  );
}
