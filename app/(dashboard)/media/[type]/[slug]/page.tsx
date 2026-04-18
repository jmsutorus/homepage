import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getMediaBySlug } from "@/lib/media";
import { formatDateLongSafe } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Info, ChevronRight } from "lucide-react";
import { DeleteMediaButton } from "@/components/widgets/media/delete-media-button";
import { MediaStatusSelect } from "@/components/widgets/media/media-status-select";
import { ExportButton } from "@/components/widgets/shared/export-button";
import { getRelatedMedia } from "@/lib/actions/related-content";
import { getUserId } from "@/lib/auth/server";
import { cn } from "@/lib/utils";
import { HomePageButton } from "@/Shared/Components/Buttons/HomePageButton";

interface MediaDetailPageProps {
  params: Promise<{
    type: string;
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function MediaDetailPage({ params }: MediaDetailPageProps) {
  const { type, slug } = await params;
  const userId = await getUserId();
  const media = await getMediaBySlug(`media/${type}`, slug, userId);

  if (!media) {
    notFound();
  }

  const { frontmatter, content } = media;

  const relatedMedia = await getRelatedMedia(
    slug,
    frontmatter.genres || [],
    frontmatter.tags || [],
    5
  );

  const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
  
  // Parse creators
  let creators: string[] = [];
  try {
    if (typeof frontmatter.creator === 'string') {
      creators = JSON.parse(frontmatter.creator);
    } else if (Array.isArray(frontmatter.creator)) {
      creators = frontmatter.creator;
    }
  } catch {
    if (typeof frontmatter.creator === 'string') {
      creators = [frontmatter.creator];
    }
  }

  return (
    <main className="min-h-screen font-lexend text-media-on-surface">
      {/* Hero Section */}
      <section className="pt-16 max-w-4xl mx-auto px-6 text-center">
        <div className="mb-16 relative inline-block group">
          <div className="absolute -inset-6 bg-media-primary/5 rounded-3xl blur-2xl transform transition-transform group-hover:scale-105 duration-700"></div>
          {frontmatter.poster && (
            <img 
              className="w-80 md:w-[450px] aspect-[2/3] object-cover rounded-lg shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] relative z-10 mx-auto" 
              src={frontmatter.poster} 
              alt={frontmatter.title}
              referrerPolicy="no-referrer"
            />
          )}
        </div>

        <div className="">
          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
            {frontmatter.tags?.slice(0, 2).map((tag, i) => (
              <span 
                key={tag}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold",
                  i === 0 ? "bg-media-primary-fixed text-media-on-primary-fixed" : "bg-media-secondary-fixed text-media-on-secondary-fixed"
                )}
              >
                {tag}
              </span>
            ))}
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black text-media-primary tracking-tighter mb-4 leading-tight">
            {frontmatter.title.replace(/-/g, ' ')}
          </h1>
          
          {creators.length > 0 && (
            <p className="text-2xl md:text-3xl text-media-secondary font-medium tracking-tight mb-12 italic">
              {creators.join(', ')}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <HomePageButton asChild variant="primary" className="bg-media-secondary">
              <Link href={`/media/${type}/${slug}/edit`}>
                <span className="material-symbols-outlined text-sm">edit</span>
                <span className="text-sm uppercase tracking-widest text-white">Edit Entry</span>
              </Link>
            </HomePageButton>
            
            <div className="flex items-center gap-4">
              <DeleteMediaButton 
                slug={slug} 
                mediaType={type} 
              />
              
              {/* <MediaStatusSelect
                status={frontmatter.status}
                slug={slug}
                type={frontmatter.type}
                frontmatter={frontmatter}
                content={content}
                className="h-[60px] bg-media-surface-container border-none font-bold uppercase tracking-widest text-[10px] px-8 rounded-xl shadow-xl"
              /> */}
              
              {content && (
                <ExportButton
                  content={content}
                  filename={slug}
                  className="h-[60px] bg-media-surface-container border-none text-media-on-surface-variant hover:bg-media-primary hover:text-white transition-colors px-8 rounded-xl shadow-xl"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-t border-media-surface-variant max-w-3xl mx-auto">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-media-on-surface-variant font-bold mb-2">Medium</p>
              <p className="text-lg font-medium text-media-primary capitalize">{frontmatter.type}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-media-on-surface-variant font-bold mb-2">Genre</p>
              <p className="text-lg font-medium text-media-primary line-clamp-1">
                {frontmatter.genres?.[0] || 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-media-on-surface-variant font-bold mb-2">Rating</p>
              <div className="flex items-center justify-center gap-1">
                <p className="text-lg font-black text-media-secondary">{frontmatter.rating || '—'}</p>
                <p className="text-sm text-media-on-surface-variant">/ 10</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-media-on-surface-variant font-bold mb-2">Completed</p>
              <p className="text-lg font-medium text-media-primary">
                {frontmatter.completed ? formatDateLongSafe(frontmatter.completed, "en-US") : frontmatter.started ? "In Progress" : "Planned"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Overview & Content Section */}
      <section className="max-w-3xl mx-auto px-6 py-24 border-t border-media-surface-variant">
        {frontmatter.description && (
          <div className="mb-24">
            <div className="flex items-center gap-4 mb-8">
              <h3 className="text-xs uppercase tracking-[0.3em] font-black text-media-primary">Overview</h3>
              <div className="h-px bg-media-surface-variant flex-grow"></div>
            </div>
            <p className="text-xl text-media-on-surface-variant leading-relaxed font-light">
              {frontmatter.description}
            </p>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-black text-media-primary tracking-tight">Personal Review & Notes</h2>
            <span className="text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant bg-media-surface-container px-4 py-1.5 rounded-full capitalize">
              {frontmatter.status}
            </span>
          </div>

          <div className="prose prose-stone dark:prose-invert max-w-none text-media-on-surface-variant leading-relaxed space-y-10 text-lg 
            prose-p:first-of-type:first-letter:text-7xl prose-p:first-of-type:first-letter:font-black prose-p:first-of-type:first-letter:mr-4 prose-p:first-of-type:first-letter:float-left prose-p:first-of-type:first-letter:text-media-primary prose-p:first-of-type:first-letter:leading-[0.8]
            prose-blockquote:bg-media-surface-container prose-blockquote:p-10 prose-blockquote:rounded-2xl prose-blockquote:border-l-8 prose-blockquote:border-media-secondary prose-blockquote:italic prose-blockquote:relative prose-blockquote:overflow-hidden prose-blockquote:not-italic prose-blockquote:my-12
            prose-blockquote:before:content-none prose-blockquote:after:content-none
          ">
            {content && typeof content === 'string' && content.trim() ? (
              <MDXRemote source={content} />
            ) : (
              <p className="text-center py-12 text-media-on-surface-variant opacity-60">
                No detailed notes available for this entry.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Progress Section */}
      {(frontmatter.status === "in-progress" || frontmatter.status === "completed") && (
        <section className="w-full bg-media-primary py-12 px-6 md:px-16 text-media-on-primary">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="bg-media-primary-container p-4 rounded-xl text-white">
                <span className="material-symbols-outlined text-4xl">
                  {frontmatter.type === 'book' ? 'menu_book' : frontmatter.type === 'movie' ? 'movie' : 'dashboard'}
                </span>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-widest font-black text-media-primary-fixed mb-1">Current Progress</h3>
                <p className="text-2xl font-black">{formattedType} Stats</p>
              </div>
            </div>
            
            <div className="flex-grow max-w-md w-full px-4">
              <div className="flex justify-between items-end mb-3">
                <span className="text-3xl font-black">
                  {frontmatter.status === 'completed' ? (frontmatter.length || 'Done') : 'Processing'} 
                  <span className="text-sm font-normal opacity-60 ml-1">
                    {frontmatter.type === 'book' ? 'Pages' : 'Progress'}
                  </span>
                </span>
                <span className="text-sm font-bold text-media-secondary">
                  {frontmatter.status === 'completed' ? '100% Complete' : 'In Progress'}
                </span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-media-secondary rounded-full" 
                  style={{ width: frontmatter.status === 'completed' ? '100%' : '35%' }}
                ></div>
              </div>
            </div>
            
            <div className="hidden lg:block text-right">
              <p className="text-[10px] uppercase tracking-widest opacity-40 mb-1">Last Updated</p>
              <p className="font-bold text-media-primary-fixed">
                {frontmatter.completed ? formatDateLongSafe(frontmatter.completed, "en-US") : "Recently"}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Related Media Section */}
      {relatedMedia.length > 0 && (
        <section className="px-6 md:px-16 py-24 bg-media-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
              <div>
                <h2 className="text-4xl font-black text-media-primary tracking-tighter mb-2">You might also like</h2>
                <p className="text-media-on-surface-variant text-sm tracking-wide">Continue your journey through the collection.</p>
              </div>
              <Link 
                className="text-xs uppercase tracking-widest font-bold text-media-secondary flex items-center gap-2 group border-b border-transparent hover:border-media-secondary transition-all pb-1" 
                href="/media"
              >
                View full library
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
              {relatedMedia.map((item) => (
                <Link 
                  key={item.slug} 
                  href={`/media/${item.type === 'movie' ? 'movies' : item.type === 'tv' ? 'tv' : item.type === 'book' ? 'books' : item.type === 'game' ? 'games' : 'albums'}/${item.slug}`}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[2/3] rounded-lg overflow-hidden mb-5 relative shadow-lg group-hover:shadow-2xl transition-all duration-500">
                    {item.poster ? (
                      <img 
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                        src={item.poster} 
                        alt={item.title}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-media-surface-container flex items-center justify-center">
                        <Info className="w-8 h-8 text-media-on-surface-variant opacity-20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-media-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <h4 className="font-bold text-media-primary group-hover:text-media-secondary transition-colors truncate">
                    {item.title.replace(/-/g, ' ')}
                  </h4>
                  <p className="text-xs text-media-on-surface-variant capitalize">
                    {item.type}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
