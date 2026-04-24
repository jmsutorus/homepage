import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getParkBySlug } from "@/lib/db/parks";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { ExportButton } from "@/components/widgets/shared/export-button";
import { getRelatedParks } from "@/lib/actions/related-content";
import { RelatedParks } from "@/components/widgets/shared/related-content";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { getUserId } from "@/lib/auth/server";

// Editorial Components
import { ParkHeroEditorial } from "@/components/widgets/parks/editorial/park-hero";
import { ParkExpeditionSummary } from "@/components/widgets/parks/editorial/park-expedition-summary";
import { ParkGalleryEditorial } from "@/components/widgets/parks/editorial/park-gallery-editorial";
import { ParkCompanionsEditorial } from "@/components/widgets/parks/editorial/park-companions-editorial";
import { ParkTrailsEditorial } from "@/components/widgets/parks/editorial/park-trails-editorial";
import { ParkFooterQuote } from "@/components/widgets/parks/editorial/park-editorial-footer";

interface ParkDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function ParkDetailPage({ params }: ParkDetailPageProps) {
  const { slug } = await params;
  const userId = await getUserId();
  const park = await getParkBySlug(slug, userId);

  if (!park) {
    notFound();
  }

  // Fetch related parks based on tags and category
  const relatedParks = await getRelatedParks(
    slug,
    park.tags || [],
    park.category,
    6
  );

  return (
    <div className="min-h-screen font-lexend -mt-8 -mx-4 md:-mx-8">
      {/* Floating Action Menu for Admin */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
        {park.content && (
          <ExportButton
            content={park.content}
            filename={park.slug}
            variant="outline"
            size="icon"
            className="w-14 h-14 rounded-full bg-media-surface/80 backdrop-blur-xl border-media-outline-variant/20 shadow-2xl hover:bg-media-secondary hover:text-white transition-all duration-300"
          />
        )}
        <Button size="icon" className="w-14 h-14 rounded-full bg-media-secondary text-media-on-secondary shadow-2xl hover:scale-110 transition-transform duration-300 border-none" asChild>
          <Link href={`/parks/${slug}/edit`}>
            <Pencil className="h-6 w-6" />
          </Link>
        </Button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-24 pb-24">
        {/* Breadcrumb Navigation - Styled to blend in */}
        <div className="opacity-50 hover:opacity-100 transition-opacity duration-300">
          <PageBreadcrumb
            items={[
              { label: "Parks", href: "/parks" },
              { label: park.title },
            ]}
          />
        </div>

        {/* Cinematic Hero */}
        <ParkHeroEditorial park={park} />

        {/* Expedition Summary */}
        <ParkExpeditionSummary park={park} />

        {/* Photos Grid */}
        <ParkGalleryEditorial parkSlug={slug} />

        {/* Travel Companions */}
        <ParkCompanionsEditorial parkSlug={slug} />

        {/* The Trails */}
        <ParkTrailsEditorial parkSlug={slug} />

        {/* Markdown Content Section */}
        {park.content && (
          <section className="relative">
            <div className="flex items-baseline gap-4 mb-12">
              <span className="text-media-secondary font-black text-5xl md:text-7xl opacity-20 leading-none">05</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none text-media-primary">The Narrative</h2>
            </div>
            <div className="bg-media-surface-container/30 rounded-[2.5rem] p-8 md:p-16 border border-media-outline-variant/5 shadow-inner">
              <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-p:text-lg prose-p:font-light prose-p:leading-relaxed prose-a:text-media-secondary hover:prose-a:text-media-primary transition-colors">
                <MDXRemote source={park.content} />
              </article>
            </div>
          </section>
        )}

        {/* Topographic Map Segment */}
        {/* <ParkMapSection /> */}

        {/* Related Content */}
        {relatedParks.length > 0 && (
          <section className="border-t border-media-outline-variant/10">
            <RelatedParks items={relatedParks} title="Beyond the Horizon" />
          </section>
        )}

        {/* Stylized Footer Quote */}
        <ParkFooterQuote title={park.title} />
      </div>
    </div>
  );
}

