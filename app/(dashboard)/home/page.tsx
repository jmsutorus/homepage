import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getRecentlyCompletedMedia } from "@/lib/media";
import { SteamStatus } from "@/components/widgets/steam/steam-status";
import { HomeAssistantWidget } from "@/components/widgets/home-assistant/home-assistant-widget";
import { PlexStatus } from "@/components/widgets/media/plex-status";
import { WeatherWidget } from "@/components/widgets/weather/weather-widget";
import { getUserId } from "@/lib/auth/server";
import { getCalendarDataForMonth } from "@/lib/db/calendar";
import { auth } from "@/auth";
import { getGithubEventsByDateRange } from "@/lib/db/github";
import { queryOne } from "@/lib/db";
import { getCalendarColorsForUser } from "@/lib/actions/calendar-colors";
import { getFeatureFlag } from "@/lib/flags";
import { ActionBanner } from "@/components/widgets/action-banner";
import { getHabits, getHabitCompletions } from "@/lib/db/habits";
import { getMoodEntry, getMoodEntriesInRange } from "@/lib/db/mood";
import { getMediaByStatus } from "@/lib/db/media";
import { getAllParks, getParkPeople } from "@/lib/db/parks";
import { getAllJournals } from "@/lib/db/journals";
import { getGoalsWithProgress } from "@/lib/db/goals";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { DuolingoWidget } from "@/components/widgets/duolingo/duolingo-widget";
import { VacationModeBanner } from "@/components/widgets/vacations/vacation-mode-banner";
import { getActiveVacation, getUpcomingVacations } from "@/lib/db/vacations";
import { getUpcomingBirthdays, getUpcomingAnniversaries } from "@/lib/db/people";
import { UpcomingBirthdays } from "@/components/widgets/people/upcoming-birthdays";
import { UpcomingAnniversaries } from "@/components/widgets/people/upcoming-anniversaries";
import { getUpcomingWorkoutActivities, getRecentWorkoutActivities } from "@/lib/db/workout-activities";
import { BirthdayBanner } from "@/components/birthday/birthday-banner";

// Editorial Components
import { EditorialQuickLinks } from "@/components/widgets/quick-links/editorial-quick-links";
import { EditorialScratchPad } from "@/components/widgets/scratch-pad/editorial-scratch-pad";
import { EditorialRecentTasks } from "@/components/widgets/tasks/editorial-recent-tasks";
import { EditorialDailyHabits } from "@/components/widgets/habits/editorial-daily-habits";
import { EditorialHomeGoals } from "@/components/widgets/goals/editorial-home-goals";

export const dynamic = "force-dynamic";

function serialize<T>(data: T): T {
  if (data === null || data === undefined) return data;
  return JSON.parse(JSON.stringify(data));
}

function getMoodLabel(rating: number) {
  switch (rating) {
    case 5: return "Radiant";
    case 4: return "Serene";
    case 3: return "Flowing";
    case 2: return "Reflective";
    case 1: return "Shadowed";
    default: return "Unknown";
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const userId = await getUserId();
  const sessionPromise = auth();

  const params = await searchParams;
  const now = new Date();
  const currentYear = params.year ? parseInt(params.year) : now.getFullYear();
  const currentMonth = params.month ? parseInt(params.month) : now.getMonth() + 1;
  const todayStr = now.toLocaleDateString("en-CA"); // YYYY-MM-DD local time

  const isPlexEnabledPromise = getFeatureFlag("Plex", false);
  const isSteamEnabledPromise = getFeatureFlag("Steam", false);
  const isHomeAssistantEnabledPromise = getFeatureFlag("HomeAssistant", false);
  const isWeatherEnabledPromise = getFeatureFlag("Weather", false);

  const githubEventsPromise = (async () => {
    const session = await sessionPromise;
    if (session?.user?.id) {
      const startDate = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01T00:00:00Z`;
      const lastDay = new Date(currentYear, currentMonth, 0).getDate();
      const endDate = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}T23:59:59Z`;
      return getGithubEventsByDateRange(session.user.id, startDate, endDate);
    }
    return [];
  })();

  const [
    habitsRaw,
    habitCompletionsRaw,
    todayMoodRaw,
    recentMoodsRaw,
    allParksRaw,
    journalsRaw,
    completedMediaRaw,
    calendarColors,
    activeGoalsRaw,
    isPlexEnabled,
    isSteamEnabled,
    isHomeAssistantEnabled,
    isWeatherEnabled,
    activeVacationRaw,
    upcomingVacationsRaw,
    userBirthdayRaw,
    session,
    upcomingBirthdaysRaw,
    upcomingAnniversariesRaw
  ] = await Promise.all([
    getHabits(userId),
    getHabitCompletions(userId, todayStr),
    getMoodEntry(todayStr, userId),
    getMoodEntriesInRange(
      new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      todayStr,
      userId
    ),
    getAllParks(userId),
    getAllJournals(userId).then(journals => journals.slice(0, 3)),
    getMediaByStatus("completed", userId),
    getCalendarColorsForUser(),
    getGoalsWithProgress(userId, { status: ['not_started', 'in_progress'] }),
    isPlexEnabledPromise,
    isSteamEnabledPromise,
    isHomeAssistantEnabledPromise,
    isWeatherEnabledPromise,
    getActiveVacation(userId, todayStr),
    getUpcomingVacations(userId, todayStr, 365),
    queryOne<{ birthday: string | null }>(
      "SELECT birthday FROM user WHERE id = ?",
      [userId]
    ),
    sessionPromise,
    getUpcomingBirthdays(userId, 30),
    getUpcomingAnniversaries(userId, 30)
  ]);

  const habits = serialize(habitsRaw);
  const habitCompletions = serialize(habitCompletionsRaw);
  const recentJournals = serialize(journalsRaw);
  const todayMood = serialize(todayMoodRaw);
  const activeGoals = serialize(activeGoalsRaw.slice(0, 3)); 
  const activeVacation = serialize(activeVacationRaw);
  const upcomingVacations = serialize(upcomingVacationsRaw);
  const upcomingBirthdays = serialize(upcomingBirthdaysRaw);
  const upcomingAnniversaries = serialize(upcomingAnniversariesRaw);
  const allParks = serialize(allParksRaw);
  const completedMedia = serialize(completedMediaRaw);
  const recentMediaEntries = completedMedia.slice(0, 3);

  const userBirthday = serialize(userBirthdayRaw);
  const isBirthday = userBirthday?.birthday ? (() => {
    const [, birthMonth, birthDay] = userBirthday.birthday.split('-');
    const [, todayMonth, todayDay] = todayStr.split('-');
    return birthMonth === todayMonth && birthDay === todayDay;
  })() : false;

  const nextVacation = upcomingVacations.length > 0 ? upcomingVacations[0] : null;
  const recentPark = allParks.length > 0 ? allParks[0] : null;
  const recentParkCompanionsRaw = recentPark ? await getParkPeople(recentPark.id) : [];
  const recentParkCompanions = serialize(recentParkCompanionsRaw);
  
  // Calculate stats
  // Rough estimate of journal streaks/counts just for display parity (or use real data)
  const totalJournals = recentJournals.length > 0 ? recentJournals.length + "+" : "0"; 
  const activeGoalsCount = activeGoalsRaw.length;
  const habitsCount = habits.length;
  const recentMediaCount = completedMedia.length;

  return (
    <div className="pt-8 px-4 md:px-8 pb-12 w-full space-y-6">
      {isBirthday && <BirthdayBanner userName={session?.user?.name} />}
      {activeVacation && <VacationModeBanner vacation={activeVacation} todayDate={todayStr} />}
      <ActionBanner />

      {/* Legacy banners for people not placed in bento intentionally */}
      {(upcomingBirthdays.length > 0 || upcomingAnniversaries.length > 0) && (
         <div className="flex flex-col gap-4">
           {upcomingBirthdays.length > 0 && <UpcomingBirthdays birthdays={upcomingBirthdays} />}
           {upcomingAnniversaries.length > 0 && <UpcomingAnniversaries anniversaries={upcomingAnniversaries} />}
         </div>
      )}

      {/* Section 1: Immersive Hero */}
      <section className="mb-12 relative h-[500px] rounded-2xl overflow-hidden group">
        <img 
          className="absolute inset-0 w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-1000" 
          alt="Majestic deep forest" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCncD12ttrDeESySaNcjkiFuHGwB4bE-tl7isq2GFp9HKz5kg36jLc2MnB13EbNGyVDCufS8gr4TCMu9yV4vTq3jkIBd05pQGvQKc6JxbnS1oy5A2K8b6GDnPh5NSgLtIvsDEkX27Jcc44WkRZtripDjS4N2Njn_ZV5vR8kmiLBJ1i-Sm87uZOsg4Lyb78_qpN9SuO77WqG_ftqMlIrxs48byvHGMNVbGVQLUxPMbWfjjGNmrNvi_nWmSaa_FPeY9tr4OwEwjJEGdE"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-media-primary/80 to-transparent flex flex-col justify-center px-6 md:px-12 text-media-on-secondary">
          <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter leading-none mb-6">The Editorial<br/>Life Balance</h1>
          <p className="max-w-md text-lg text-media-primary-fixed-dim leading-relaxed opacity-90">An intentional audit of the rhythms that define your season. Pursuing kinetic harmony through mindful curation.</p>
        </div>
        
        {/* Focus Card */}
        <Link href={`/daily/${todayStr}`} className="absolute hidden md:block bottom-12 right-12 bg-media-surface/90 backdrop-blur-xl p-8 rounded-xl w-80 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-media-secondary/20 group cursor-pointer">
          <span className="text-media-secondary tracking-widest uppercase text-[10px] font-bold block mb-2">Daily Directive</span>
          <h3 className="text-2xl font-bold text-media-primary mb-3">Mindful Horizons</h3>
          <p className="text-media-on-surface-variant text-sm leading-relaxed mb-6">Focus on the most meaningful task today. Pursue progress over perfection.</p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-media-secondary">Stay present</span>
            <span className="material-symbols-outlined text-media-secondary transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </div>
        </Link>
      </section>

      {/* Section 2: Quick Dashboard Grid (Quick Links, Notes, Tasks) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <EditorialQuickLinks />
        <EditorialScratchPad />
        <EditorialRecentTasks />
      </section>

      {/* Section 3: Rituals & Aspirations (Habits & Goals) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <EditorialDailyHabits habits={habits} completions={habitCompletions} date={todayStr} />
        <EditorialHomeGoals goals={activeGoals} />
      </section>

      {/* Section 4: Insights Row (Bento Grid) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* Parks */}
        <Link href="/parks" className="bg-media-surface-container-low p-8 rounded-2xl flex flex-col justify-between group hover:bg-media-surface-container-high transition-colors relative overflow-hidden">
          {recentPark && recentPark.poster && (
            <>
              <img src={recentPark.poster} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-75 transition-opacity duration-700 grayscale group-hover:grayscale-0" alt={recentPark.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-media-primary/95 via-media-primary/60 to-transparent" />
            </>
          )}
          <div className="relative z-10 w-full h-full flex flex-col">
            <div>
              <span className={cn("material-symbols-outlined mb-4 text-3xl group-hover:scale-110 transition-transform", recentPark && recentPark.poster ? "text-media-secondary" : "text-media-primary")}>nature_people</span>
              <h4 className={cn("text-lg font-bold mb-1", recentPark && recentPark.poster ? "text-white" : "text-media-primary")}>
                {recentPark ? recentPark.title : "Local Discoveries"}
              </h4>
              <p className={cn("text-sm", recentPark && recentPark.poster ? "text-white/80" : "text-media-on-surface-variant")}>
                {recentPark && recentPark.state ? `Revisit your memories from ${recentPark.state}.` : "Explore curated parks and nature reserves."}
              </p>
            </div>
            
            <div className="mt-auto pt-8 flex -space-x-2">
               {recentParkCompanions.length > 0 ? (
                 <>
                   {recentParkCompanions.slice(0, 3).map((person, i) => (
                      <div key={person.id} className="w-10 h-10 rounded-full border-2 border-media-surface overflow-hidden bg-media-primary/20 flex items-center justify-center z-10" style={{ zIndex: 10 - i }}>
                        {person.photo ? (
                          <img src={person.photo} alt={person.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className={cn("text-[10px] uppercase font-bold", recentPark && recentPark.poster ? "text-white" : "text-media-primary")}>{(person.name || "P").substring(0,2)}</span>
                        )}
                      </div>
                   ))}
                   {recentParkCompanions.length > 3 && (
                      <div className="w-10 h-10 rounded-full border-2 border-media-surface bg-media-surface-container-highest flex items-center justify-center text-[10px] font-bold z-0">+{recentParkCompanions.length - 3}</div>
                   )}
                 </>
               ) : (
                 <div className={cn("text-xs font-medium opacity-70", recentPark && recentPark.poster ? "text-white/60" : "text-media-on-surface-variant")}>No companions recorded</div>
               )}
            </div>
          </div>
        </Link>

        {/* Weather & Mood */}
        <div className="bg-media-primary p-8 rounded-2xl text-media-on-secondary flex flex-col justify-between hover:bg-media-primary-container transition-colors relative overflow-hidden group">
          <div className="relative z-10 w-full h-full flex flex-col">
            <h4 className="text-media-secondary-fixed tracking-widest uppercase text-[10px] font-bold mb-4">Atmosphere</h4>
            {todayMood ? (
              <span className="text-2xl font-bold tracking-tight">{getMoodLabel(todayMood.rating)}</span>
            ) : (
              <Link href={`/daily/${todayStr}`} className="text-2xl font-bold tracking-tight opacity-70 hover:opacity-100 hover:text-white transition-all cursor-pointer inline-flex items-center gap-2 group/mood">
                Log your mood
                <span className="material-symbols-outlined text-xl transform group-hover/mood:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            )}
            <p className="text-media-primary-fixed-dim text-sm mt-2 flex-grow">
              {todayMood?.note || "No notes for today."}
            </p>
            {isWeatherEnabled && (
               <div className="mt-6 pt-4 border-t border-white/20">
                 <WeatherWidget />
               </div>
            )}
          </div>
          {/* Abstract bars mirroring the original prototype */}
          <div className="absolute inset-0 opacity-10 flex items-end gap-1 pointer-events-none p-4">
            <div className="w-full bg-media-secondary h-[20%] rounded-t-sm"></div>
            <div className="w-full bg-media-secondary h-[40%] rounded-t-sm"></div>
            <div className="w-full bg-media-secondary h-[35%] rounded-t-sm"></div>
            <div className="w-full bg-media-secondary h-[70%] rounded-t-sm"></div>
            <div className="w-full bg-media-secondary h-[90%] rounded-t-sm"></div>
            <div className="w-full bg-media-secondary h-[85%] rounded-t-sm"></div>
          </div>
        </div>

        {/* Next Odyssey (Vacations) */}
        <Link href={nextVacation ? `/vacations/${nextVacation.slug}` : "/vacations/new"} className="relative rounded-2xl overflow-hidden group cursor-pointer h-full min-h-[220px]">
          {nextVacation && nextVacation.poster ? (
             <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={nextVacation.destination} src={nextVacation.poster} />
          ) : (
             <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="vibrant coastal view" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5PW5QVjZ_HxrD4VU-7LoF_iEcAsj3w4Bxy3AMWAuPVxV0iw4SsiT0P1hmNjKK1cM7nktn_x_Fo1fmeSjygPOjWj4bWcld0HVyUFlT0qDprBVYx3s_OoL7BJiblgOxnzj5Jnvba066XGRG1fIN6iOGamE39TfZlvPQ3xyYZMxetVafrT3vlUp0ti3WfyyN_BqMBH93npuxUcvT3gIbLMaBaIZhMQlBGIHt2EG_fatDsnAIYogHQPbT-Dcw89km2pO8jgQtKzF2xrI" />
          )}
          <div className="absolute inset-0 bg-black/40 p-8 flex flex-col justify-end">
            <span className="text-white/80 tracking-widest uppercase text-[10px] font-bold mb-1">Upcoming Odyssey</span>
            <h4 className="text-2xl font-bold text-white tracking-tight">
               {nextVacation ? nextVacation.title : "No trips planned"}
            </h4>
            <p className="text-white/70 text-xs mt-1">
               {nextVacation ? `Departing to ${nextVacation.destination}` : "Plan your next getaway"}
            </p>
          </div>
        </Link>
      </section>

      {/* Section 5: Recent Media */}
      {recentMediaEntries.length > 0 && (
         <section className="mb-16">
           <div className="flex items-baseline justify-between mb-8">
             <h2 className="text-3xl font-bold font-headline tracking-tighter text-media-primary">Recent Media</h2>
             <Link className="text-media-secondary text-sm font-bold tracking-tight flex items-center gap-2 hover:opacity-80" href="/media">
               Browse All <span className="material-symbols-outlined text-sm">arrow_forward</span>
             </Link>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {recentMediaEntries.map((item) => (
               <Link key={item.id} href={`/media/${item.slug}`} className="group cursor-pointer">
                 <div className="aspect-[2/3] rounded-xl overflow-hidden mb-4 bg-media-surface-container relative">
                   {item.poster ? (
                     <img 
                       className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                       alt={item.title} 
                       src={item.poster} 
                     />
                   ) : (
                     <div className="w-full h-full bg-media-primary/10 flex items-center justify-center p-8">
                       <span className="material-symbols-outlined text-4xl opacity-20 text-media-primary">movie</span>
                     </div>
                   )}
                 </div>
                 <p className="text-[10px] text-media-secondary font-bold tracking-widest uppercase mb-2">
                   {item.type} • {item.rating ? `${item.rating}/10` : 'Unrated'}
                 </p>
                 <h3 className="text-xl font-bold text-media-primary mb-2 group-hover:text-media-secondary transition-colors line-clamp-1">{item.title}</h3>
                 <p className="text-sm text-media-on-surface-variant line-clamp-2 leading-relaxed">
                   {item.description || "No description available."}
                 </p>
               </Link>
             ))}
           </div>
         </section>
      )}

      {/* Services Grid (If any are active) */}
      {(isSteamEnabled || isPlexEnabled || isHomeAssistantEnabled) && (
        <section className="mb-16">
          <h2 className="text-xl font-bold font-headline tracking-tighter text-media-primary mb-6">Active Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isSteamEnabled && <SteamStatus />}
            {isPlexEnabled && <PlexStatus />}
            {isHomeAssistantEnabled && <HomeAssistantWidget />}
          </div>
        </section>
      )}

      {/* Section 6: Final Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-media-surface-container-lowest p-6 rounded-xl shadow-sm border border-media-outline-variant/10">
          <span className="text-[10px] font-bold text-media-on-surface-variant tracking-widest uppercase block mb-1">Active Goals</span>
          <div className="text-3xl font-bold text-media-primary">{activeGoalsCount}</div>
        </div>
        <div className="bg-media-surface-container-lowest p-6 rounded-xl shadow-sm border border-media-outline-variant/10">
          <span className="text-[10px] font-bold text-media-on-surface-variant tracking-widest uppercase block mb-1">Daily Rituals</span>
          <div className="text-3xl font-bold text-media-primary">{habitsCount}</div>
        </div>
        <div className="bg-media-surface-container-lowest p-6 rounded-xl shadow-sm border border-media-outline-variant/10">
          <span className="text-[10px] font-bold text-media-on-surface-variant tracking-widest uppercase block mb-1">Recent Media</span>
          <div className="text-3xl font-bold text-media-primary">{recentMediaCount}</div>
        </div>
        <div className="bg-media-surface-container-lowest p-6 rounded-xl shadow-sm border border-media-outline-variant/10">
          <span className="text-[10px] font-bold text-media-on-surface-variant tracking-widest uppercase block mb-1">Journals</span>
          <div className="text-3xl font-bold text-media-primary">{totalJournals}</div>
        </div>
      </section>

      {/* Contextual FAB for New Entry */}
      <Link href="/journals" className="fixed bottom-8 right-8 bg-media-secondary text-media-on-secondary w-16 h-16 rounded-2xl shadow-2xl shadow-media-secondary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 group z-40 md:hidden hover:bg-media-secondary/90">
        <span className="material-symbols-outlined text-3xl font-bold">edit_note</span>
      </Link>

    </div>
  );
}
