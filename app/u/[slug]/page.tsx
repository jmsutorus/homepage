
import { notFound } from "next/navigation";
import { getPublicProfileData } from "@/lib/db/public-profile";
import { Metadata } from "next";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import Image from "next/image";

interface PublicProfilePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicProfileData(slug);
  
  if (!data) return { title: "User Not Found | Earthbound" };

  return {
    title: `${data.user.name || "User"} | Earthbound Curator`,
    description: `Explore the curations and expeditions of ${data.user.name}.`,
  };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { slug } = await params;
  const data = await getPublicProfileData(slug);

  if (!data) {
    notFound();
  }

  const { user, showcase, stats, aspirations } = data;

  return (
    <div className="bg-[#faf9f6] text-[#1a1c1a] font-['Lexend'] min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: `
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 1.5rem;
          grid-auto-flow: dense;
        }
        @media (max-width: 768px) {
          .bento-grid {
            grid-template-columns: 1fr;
          }
        }
      `}} />
      
      <PublicHeader />

      <main className="pt-32 pb-24">
        {/* Profile Header Section */}
        <section className="max-w-screen-2xl mx-auto px-8 mb-20">
          <div className="flex flex-col md:flex-row gap-12 items-end">
            <div className="relative w-full md:w-1/3 aspect-[4/5] overflow-hidden rounded-xl bg-[#efeeeb] shadow-sm group">
              <Image 
                fill
                className="object-cover transition-all duration-700" 
                src={user.publishedPhoto || user.image || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop"} 
                alt={user.name || "Curator"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#061b0e]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div className="md:w-2/3 pb-4">
              <span className="text-[#9f402d] font-bold tracking-widest uppercase text-sm mb-4 block">Master Curator</span>
              <h1 className="text-7xl font-bold text-[#061b0e] tracking-tighter leading-none mb-6">{user.name}</h1>
              <p className="text-2xl text-[#434843] max-w-xl leading-relaxed mb-10">
                Lover of the rugged outdoors and modern archivist. Mapping the intersection of wilderness and well-lived moments.
              </p>
              <div className="flex gap-8 mb-12 border-l-2 border-[#b4cdb8] pl-8">
                <div className="hidden md:block">
                  <span className="block text-4xl font-bold text-[#061b0e]">{stats.curations}</span>
                  <span className="text-sm uppercase tracking-widest text-[#434843] font-medium">Curations</span>
                </div>
                <div>
                  <span className="block text-4xl font-bold text-[#061b0e]">{stats.streak}-day</span>
                  <span className="text-sm uppercase tracking-widest text-[#434843] font-medium">Streak</span>
                </div>
                <div className="hidden md:block">
                  <span className="block text-4xl font-bold text-[#061b0e]">{stats.expeditions}</span>
                  <span className="text-sm uppercase tracking-widest text-[#434843] font-medium">Expeditions</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="cursor-pointer bg-[#9f402d] text-white px-10 py-4 rounded-lg font-bold text-lg hover:brightness-110 transition-all shadow-xl shadow-[#9f402d]/20">Follow</button>
                <button className="cursor-pointer bg-[#061b0e] text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-[#1b3022] transition-all">Message</button>
              </div>
            </div>
          </div>
        </section>

        {/* Active Aspirations Spotlight */}
        {aspirations.length > 0 && (
          <section className="bg-[#1b3022] py-20 mb-20 overflow-hidden relative">
            <div className="max-w-screen-2xl mx-auto px-8 relative z-10">
              <div className="flex justify-between items-end mb-10">
                <div>
                  <h2 className="text-3xl font-bold text-[#d0e9d4] mb-2">Active Aspirations</h2>
                  <p className="text-[#819986]">Currently charting heights and depths.</p>
                </div>
                <a className="text-[#9f402d] font-bold flex items-center gap-2 hover:gap-3 transition-all" href="#">
                  View All Intentions <span className="material-symbols-outlined">arrow_forward</span>
                </a>
              </div>
              <div className="flex gap-8 overflow-x-auto pb-4 no-scrollbar">
                {aspirations.map((goal) => (
                  <div key={goal.id} className="min-w-[400px] bg-[#243d2c] p-8 rounded-xl flex flex-col justify-between h-64 border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex justify-between items-start">
                      <span className="bg-[#d0e9d4] text-[#061b0e] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                        {goal.status.replace('_', ' ')}
                      </span>
                      <span className="material-symbols-outlined text-[#d0e9d4]" style={{ fontVariationSettings: "'FILL' 1" }}>landscape</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-4">{goal.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#9f402d] opacity-5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
          </section>
        )}

        {/* The Showcase Grid */}
        <section className="max-w-screen-2xl mx-auto px-8">
          <h2 className="text-4xl font-bold text-[#061b0e] mb-12 tracking-tight">The Showcase</h2>
          <div className="bento-grid">
            {showcase.map((item, index) => {
              if (item.cardType === 'vacation') {
                return (
                  <div key={index} className="col-span-12 md:col-span-8 group relative overflow-hidden rounded-xl aspect-video bg-[#f4f3f1]">
                    <Image fill className="object-cover group-hover:scale-105 transition-transform duration-1000" src={item.poster || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"} alt={item.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-10">
                      <span className="text-[#ffdad3] font-bold tracking-widest uppercase text-sm mb-2">Vacation Journal</span>
                      <h3 className="text-4xl font-bold text-white mb-2">{item.name}</h3>
                      <p className="text-white/80 max-w-md">{item.description}</p>
                    </div>
                  </div>
                );
              }
              if (item.cardType === 'fitness') {
                return (
                  <div key={index} className="h-full col-span-12 md:col-span-4 bg-[#e9e8e5] p-8 rounded-xl flex flex-col group hover:bg-[#e3e2e0] transition-colors">
                    <div className="flex justify-between items-start mb-12">
                      <div className="bg-[#9f402d] p-3 rounded-lg text-white shadow-lg shadow-[#9f402d]/20">
                        <span className="material-symbols-outlined">bolt</span>
                      </div>
                      <span className="text-[#434843] font-bold text-xs uppercase tracking-tighter">Fitness Routine</span>
                    </div>
                    <h3 className="text-3xl font-bold text-[#061b0e] mb-2">{item.type} session</h3>
                    <p className="text-[#434843] mb-8 flex-grow">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {item.time ? ` • ${item.time}` : ''}
                      <br />
                      <span className="text-xs opacity-70 italic">{item.notes || "A high-intensity awakening in the mountain air."}</span>
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <span className="block text-xl font-bold text-[#061b0e]">
                          {item.distance > 0 ? item.distance : (item.exerciseCount || 0)}
                        </span>
                        <span className="text-[10px] uppercase text-[#434843]">
                          {item.distance > 0 ? 'mi' : 'exercises'}
                        </span>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <span className="block text-xl font-bold text-[#061b0e]">{item.duration || item.length || 0}</span>
                        <span className="text-[10px] uppercase text-[#434843]">min</span>
                      </div>
                    </div>
                  </div>
                );
              }
              if (item.cardType === 'media') {
                const statusTag = item.status === 'completed' 
                  ? 'Completed' 
                  : (() => {
                      switch (item.type) {
                        case 'book': return 'Currently Reading';
                        case 'movie':
                        case 'tv': return 'Currently Watching';
                        case 'game': return 'Currently Playing';
                        case 'album': return 'Currently Listening';
                        default: return 'In Progress';
                      }
                    })();

                return (
                  <div key={index} className="h-full col-span-12 md:col-span-4 bg-[#061b0e] text-white rounded-xl relative overflow-hidden group min-h-[400px]">
                    {/* Background Image */}
                    {item.poster && (
                      <div className="absolute inset-0 z-0">
                        <Image 
                          fill
                          className="object-cover opacity-30 group-hover:scale-110 transition-transform duration-[3000ms]" 
                          src={item.poster} 
                          alt="" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#061b0e] via-[#061b0e]/80 to-transparent"></div>
                      </div>
                    )}
                    
                    <div className="relative z-10 p-8 h-full flex flex-col">
                      <span className="bg-[#9f402d] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase mb-8 inline-block w-fit">{statusTag}</span>
                      <h3 className="text-3xl font-black mb-1 leading-tight">{item.title}</h3>
                      <p className="text-[#b4cdb8] text-sm mb-auto">
                        {(() => {
                          try {
                            return item.creator ? JSON.parse(item.creator).join(', ') : "Author Unknown";
                          } catch (e) {
                            return item.creator || "Author Unknown";
                          }
                        })()}
                      </p>
                      
                      <div className="flex items-center gap-1 mt-6 text-[#ffdad3]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: i < (item.rating / 2) ? "'FILL' 1" : "" }}>star</span>
                        ))}
                        <span className="ml-2 text-white/60 text-xs uppercase">{item.rating / 2} / 5.0</span>
                      </div>
                    </div>

                    {/* Watermark Icon */}
                    <div className="absolute -right-4 -bottom-4 opacity-30 group-hover:scale-110 transition-transform duration-700 pointer-events-none z-0">
                      <span className="material-symbols-outlined text-[160px] text-white/20">
                        {(() => {
                          switch (item.type) {
                            case 'book': return 'auto_stories';
                            case 'movie': return 'movie';
                            case 'tv': return 'live_tv';
                            case 'game': return 'sports_esports';
                            case 'album': return 'album';
                            default: return 'media_output';
                          }
                        })()}
                      </span>
                    </div>
                  </div>
                );
              }
              if (item.cardType === 'journal') {
                return (
                  <div key={index} className="h-full col-span-12 md:col-span-4 group relative overflow-hidden rounded-xl bg-[#efeeeb] min-h-[400px]">
                    <Image fill className="object-cover group-hover:scale-105 transition-transform duration-1000" src={item.image_url || "https://images.unsplash.com/photo-1441974231531-c6227db76b6e"} alt={item.title} />
                    <div className="absolute inset-0 bg-black/40 p-8 flex flex-col justify-end">
                      <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-white/80 line-clamp-3 text-sm leading-relaxed italic">{item.content.substring(0, 100)}...</p>
                      <button className="cursor-pointer mt-4 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">Read Entry <span className="material-symbols-outlined text-sm">open_in_new</span></button>
                    </div>
                  </div>
                );
              }
              if (item.cardType === 'recipe') {
                return (
                  <div key={index} className="h-full col-span-12 md:col-span-4 bg-[#e4e4cc] text-[#1b1d0e] p-8 rounded-xl group hover:bg-[#e3e2b0] transition-colors">
                    <div className="relative aspect-square bg-white/50 rounded-lg mb-6 overflow-hidden shadow-inner">
                      <Image fill className="object-cover group-hover:scale-110 transition-transform duration-1000" src={item.image_url || item.poster || "https://images.unsplash.com/photo-1476500882210-a248356b258b"} alt={item.name} />
                    </div>
                    <span className="text-[#9f402d] font-bold text-[10px] uppercase tracking-widest block mb-2">Wild Harvest Series</span>
                    <h3 className="text-2xl font-bold text-[#061b0e] leading-tight mb-4">{item.name}</h3>
                    <div className="flex items-center gap-4 text-[#474836] text-xs">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> {item.serving_temp || "45 min"}</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">restaurant</span> Moderate</span>
                    </div>
                  </div>
                );
              }
              if (item.cardType === 'restaurant') {
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.name} ${item.address || ''} ${item.city || ''} ${item.state || ''}`)}`;

                return (
                  <div key={index} className="col-span-12 bg-[#061b0e] text-white rounded-xl overflow-hidden flex flex-col md:flex-row group">
                    {/* Column 1: Info */}
                    <div className="md:w-1/3 p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-[#fd876f] text-sm">restaurant</span>
                        <span className="text-[#fd876f] font-bold text-[10px] uppercase tracking-widest">Recommended Dining</span>
                      </div>
                      <h3 className="text-3xl font-black text-[#b4cdb8] mb-2 tracking-tighter leading-none">{item.name}</h3>
                      <p className="text-[#b4cdb8]/60 text-sm mb-6">{item.cuisine} • {item.city}</p>
                      <a 
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#fd876f] text-[#3e0500] px-5 py-2.5 rounded-full font-bold text-xs w-fit hover:bg-[#ffdad3] transition-colors inline-block"
                      >
                        View on Maps
                      </a>
                    </div>

                    {/* Column 2: Image */}
                    <div className="md:w-1/3 h-[300px] md:h-auto relative overflow-hidden border-b md:border-b-0 md:border-r border-white/10">
                      <Image fill className="object-cover group-hover:scale-110 transition-transform duration-[2000ms]" src={item.poster || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b"} alt={item.name} />
                      <div className="absolute inset-0 bg-[#061b0e]/20"></div>
                    </div>

                    {/* Column 3: Notes */}
                    <div className="md:w-1/3 p-8 bg-[#1b3022] flex flex-col justify-center">
                      <span className="text-[#fd876f] font-bold text-[10px] uppercase tracking-widest block mb-3">Curator&apos;s Notes</span>
                      <p className="text-[#b4cdb8]/90 text-sm leading-relaxed italic">
                        &quot;{item.notes || `A hidden gem in ${item.city}. The atmosphere is matched only by the excellence of the ${item.cuisine} cuisine.`}&quot;
                      </p>
                    </div>
                  </div>
                );
              }
              if (item.cardType === 'event') {
                const eventDate = new Date(item.date + 'T00:00:00');
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isPast = eventDate < today;
                const isToday = eventDate.getTime() === today.getTime();
                const statusTag = isToday ? 'Happening Today' : (isPast ? 'Past Event' : 'Upcoming');

                return (
                  <div key={index} className="h-full col-span-12 md:col-span-4 group relative overflow-hidden rounded-xl min-h-[450px] bg-[#061b0e]">
                    {/* Background Image */}
                    {item.cover_image && (
                      <div className="absolute inset-0 z-0">
                        <Image 
                          fill
                          className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-[3000ms]" 
                          src={item.cover_image} 
                          alt="" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#061b0e] via-[#061b0e]/40 to-transparent"></div>
                      </div>
                    )}
                    
                    <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                      <div className="mb-auto flex justify-between items-start">
                        <div className="flex gap-2">
                          <div className="bg-[#9f402d] p-2 rounded text-white">
                            <span className="material-symbols-outlined text-xl">event</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center ${isPast ? 'bg-white/10 text-white/60' : 'bg-[#fd876f] text-[#3e0500]'}`}>
                            {statusTag}
                          </span>
                        </div>
                        <span className="bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <h3 className="text-3xl font-black text-white mb-2 leading-none tracking-tighter">{item.title}</h3>
                      <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-4">
                        {item.location || "Earthbound HQ"}
                      </p>
                      <p className="text-white/80 text-sm italic line-clamp-2 leading-relaxed">
                        {item.description || "An invitation to gather and share in the moment."}
                      </p>
                    </div>
                  </div>
                );
              }
              if (item.cardType === 'drink') {
                return (
                  <div key={index} className="h-full col-span-12 md:col-span-4 bg-[#fdfaf5] p-8 rounded-xl flex flex-col group border border-[#061b0e]/5 relative overflow-hidden">
                    <div className="relative z-10 h-full flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#9f402d]">local_bar</span>
                          <span className="text-[#9f402d] font-bold text-[10px] uppercase tracking-widest">Curation</span>
                        </div>
                        {item.rating && (
                          <div className="flex items-center gap-1 text-[#9f402d]">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className="material-symbols-outlined text-xs" style={{ fontVariationSettings: i < (item.rating / 2) ? "'FILL' 1" : "" }}>star</span>
                            ))}
                          </div>
                        )}
                      </div>

                      <h3 className="text-3xl font-black text-[#061b0e] mb-1 tracking-tighter leading-none">{item.name}</h3>
                      <p className="text-[#9f402d] text-[10px] font-bold uppercase tracking-widest mb-6">
                        {item.producer || "Small Batch Discovery"}
                      </p>

                      <div className="bg-white/40 backdrop-blur-sm p-4 rounded-lg border border-[#061b0e]/5 mb-6">
                        <span className="text-[10px] font-black uppercase text-[#061b0e]/40 block mb-2">Curator&apos;s Notes</span>
                        <p className="text-[#434843] text-sm leading-relaxed italic">
                          &quot;{item.notes || item.description || "A perfectly balanced pour for the evening wind-down."}&quot;
                        </p>
                      </div>

                      {item.image_url && (
                        <div className="relative mt-auto aspect-video rounded-lg overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 shadow-inner">
                          <Image fill className="object-cover" src={item.image_url} alt={item.name} />
                        </div>
                      )}
                    </div>
                    <div className="absolute -right-8 -top-8 material-symbols-outlined text-[120px] text-[#061b0e]/5 pointer-events-none rotate-12">
                      glass_cup
                    </div>
                  </div>
                );
              }
              if (item.cardType === 'goal') {
                return (
                  <div key={index} className="h-full col-span-12 md:col-span-4 bg-[#f4f3f1] p-8 rounded-xl flex flex-col group border border-[#061b0e]/5">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="material-symbols-outlined text-[#9f402d]">target</span>
                      <span className="text-[#9f402d] font-bold text-[10px] uppercase tracking-widest">Active Aspiration</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[#061b0e] mb-4">{item.title}</h3>
                    <p className="text-[#434843] text-sm mb-8 flex-grow line-clamp-3">{item.description || "Pursuing excellence through dedicated discipline and steady progress."}</p>
                    
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-[#061b0e]/10">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-[#434843]/60 font-bold">Target Date</span>
                        <span className="text-sm font-bold text-[#061b0e]">
                          {item.target_date ? new Date(item.target_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Ongoing'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
