 
"use client";

import { useState, useEffect } from "react";
import { Plus, User, Users, UserPlus, Briefcase, Mail, Phone, Trash2, Edit, Cake, Heart, Settings, ListTodo, Search, X, Copy, Sparkles, Gift } from "lucide-react";
import { type Person, type RelationshipCategory } from "@/lib/db/people";
import { PersonFormDialog } from "@/components/widgets/people/person-form-dialog";
import { DeletePersonDialog } from "@/components/widgets/people/delete-person-dialog";
import { RelationshipTypeManager } from "@/components/widgets/people/relationship-type-manager";
import { getZodiacSignFromBirthday, getZodiacElementColor } from "@/lib/zodiac";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

interface PeoplePageClientProps {
  initialPeople: Person[];
}

const RELATIONSHIP_CONFIG = {
  family: {
    icon: Users,
    color: "rose" as const,
    bgClass: "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300",
    label: "Family"
  },
  friends: {
    icon: UserPlus,
    color: "blue" as const,
    bgClass: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300",
    label: "Friends"
  },
  work: {
    icon: Briefcase,
    color: "slate" as const,
    bgClass: "bg-slate-500/10 border-slate-500/30 text-slate-700 dark:text-slate-300",
    label: "Work"
  },
  other: {
    icon: User,
    color: "purple" as const,
    bgClass: "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300",
    label: "Other"
  }
};

const MILESTONE_AGES = [18, 21, 25, 30, 40, 50, 60, 75, 100];

type SortOption = "name" | "birthday" | "upcoming";

export function PeoplePageClient({ initialPeople }: PeoplePageClientProps) {
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>(initialPeople);
  const [selectedFilter, setSelectedFilter] = useState<RelationshipCategory | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deletingPerson, setDeletingPerson] = useState<Person | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [viewTab, setViewTab] = useState<"people" | "manage">("people");

  // Set isClient to true after hydration to prevent hydration mismatch with date calculations
  useEffect(() => {
     
    setIsClient(true);
  }, []);

  // Calculate days until birthday
  const calculateDaysUntil = (birthday: string): number => {
    const [year, month, day] = birthday.split('-');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();

    let nextBirthday = new Date(currentYear, parseInt(month) - 1, parseInt(day));
    if (nextBirthday < today) {
      nextBirthday = new Date(currentYear + 1, parseInt(month) - 1, parseInt(day));
    }

    const diffTime = nextBirthday.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calculate age
  const calculateAge = (birthday: string): number | null => {
    const [year] = birthday.split('-');
    if (year === '0000') return null;

    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  // Apply filters and sorting
  const applyFiltersAndSort = (peopleList: Person[], filter: RelationshipCategory | "all", sort: SortOption, search: string) => {
    let result = [...peopleList];

    // Filter by search term
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.email?.toLowerCase().includes(searchLower) ||
        p.phone?.toLowerCase().includes(searchLower) ||
        p.notes?.toLowerCase().includes(searchLower) ||
        p.gift_ideas?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by relationship
    if (filter !== "all") {
      result = result.filter(p => p.relationship === filter);
    }

    // Sort
    if (sort === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "birthday") {
      result.sort((a, b) => {
        const [, aMonth, aDay] = a.birthday.split('-');
        const [, bMonth, bDay] = b.birthday.split('-');
        return `${aMonth}-${aDay}`.localeCompare(`${bMonth}-${bDay}`);
      });
    } else if (sort === "upcoming") {
      result.sort((a, b) => calculateDaysUntil(a.birthday) - calculateDaysUntil(b.birthday));
    }

    setFilteredPeople(result);
  };

  const handleFilterChange = (filter: RelationshipCategory | "all") => {
    setSelectedFilter(filter);
    applyFiltersAndSort(people, filter, sortBy, searchTerm);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    applyFiltersAndSort(people, selectedFilter, sort, searchTerm);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    applyFiltersAndSort(people, selectedFilter, sortBy, value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    applyFiltersAndSort(people, selectedFilter, sortBy, "");
  };

  const openAddDialog = () => {
    setEditingPerson(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (person: Person) => {
    setEditingPerson(person);
    setIsDialogOpen(true);
  };

  const refreshPeople = async () => {
    const refreshResponse = await fetch("/api/people");
    const updatedPeople = await refreshResponse.json();
    setPeople(updatedPeople);
    applyFiltersAndSort(updatedPeople, selectedFilter, sortBy, searchTerm);
  };

  const openDeleteDialog = (person: Person) => {
    setDeletingPerson(person);
    setIsDeleteDialogOpen(true);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (error) {
      toast.error(`Failed to copy ${label}`);
    }
  };

  // Summary metrics logic
  const summaryMetrics = isClient ? (() => {
    // Volume
    const volume = people.length;

    // Trends: Zodiac distribution
    const zodiacCounts = new Map<string, { count: number; name: string }>();
    people.forEach((p) => {
      const sign = getZodiacSignFromBirthday(p.birthday);
      if (sign) {
        const existing = zodiacCounts.get(sign.name);
        if (existing) {
          existing.count++;
        } else {
          zodiacCounts.set(sign.name, { count: 1, name: sign.name });
        }
      }
    });

    let mostCommonZodiac = { name: 'None', count: 0 };
    zodiacCounts.forEach((data) => {
      if (data.count > mostCommonZodiac.count) {
        mostCommonZodiac = data;
      }
    });

    // Upcoming: Milestones and next birthday
    let milestoneCount = 0;
    let nextBirthdayDays = Infinity;
    people.forEach((p) => {
      const age = calculateAge(p.birthday);
      if (age !== null) {
        const upcomingAge = age + 1;
        if (MILESTONE_AGES.includes(upcomingAge)) {
          milestoneCount++;
        }
      }
      const days = calculateDaysUntil(p.birthday);
      if (days < nextBirthdayDays) {
        nextBirthdayDays = days;
      }
    });

    return {
      volume,
      trends: mostCommonZodiac.name,
      milestones: milestoneCount,
      nextBirthdayDays: nextBirthdayDays === Infinity ? null : nextBirthdayDays
    };
  })() : { volume: 0, trends: '...', milestones: 0, nextBirthdayDays: null };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-lexend text-media-on-surface">
      {/* Hero & Editorial Title */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-media-primary leading-none mb-4">The People Directory</h1>
          <p className="text-media-on-surface-variant text-lg max-w-xl">A curated archive of your personal inner circle, milestones, and shared history.</p>
        </div>
        <button 
          onClick={openAddDialog}
          className="cursor-pointer bg-media-primary text-white px-8 py-4 rounded-lg flex items-center gap-3 self-start md:self-auto hover:scale-105 transition-transform"
        >
          <span className="material-symbols-outlined">person_add</span>
          <span className="font-bold tracking-tight">Add Person</span>
        </button>
      </div>

      <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as "people" | "manage")} className="space-y-8">
        <div className="flex border-b border-media-outline-variant/20 mb-8">
          <button 
            onClick={() => setViewTab("people")}
            className={`px-8 py-4 text-sm font-bold tracking-tight transition-all border-b-2 ${viewTab === "people" ? "border-media-secondary text-media-primary" : "border-transparent text-media-on-surface-variant hover:text-media-primary"}`}
          >
            DIRECTORY
          </button>
          <button 
            onClick={() => setViewTab("manage")}
            className={`px-8 py-4 text-sm font-bold tracking-tight transition-all border-b-2 ${viewTab === "manage" ? "border-media-secondary text-media-primary" : "border-transparent text-media-on-surface-variant hover:text-media-primary"}`}
          >
            MANAGE TYPES
          </button>
        </div>

        <TabsContent value="people" className="space-y-12">
          {/* Summary Widget */}
          <div className="bg-media-surface-container-low rounded-xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-1 border-r border-media-outline-variant/20 pr-4">
              <span className="text-xs uppercase tracking-widest text-media-secondary font-bold">Volume</span>
              <span className="text-4xl font-bold text-media-primary">{summaryMetrics.volume} people</span>
              <span className="text-sm text-media-on-surface-variant">Archived in directory</span>
            </div>
            <div className="flex flex-col gap-1 border-r border-media-outline-variant/20 pr-4">
              <span className="text-xs uppercase tracking-widest text-media-secondary font-bold">Trends</span>
              <span className="text-4xl font-bold text-media-primary">{summaryMetrics.trends}</span>
              <span className="text-sm text-media-on-surface-variant">Most common sign</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-widest text-media-secondary font-bold">Upcoming</span>
              <span className="text-4xl font-bold text-media-primary">
                {summaryMetrics.milestones} {summaryMetrics.milestones === 1 ? 'milestone' : 'milestones'}
              </span>
              <span className="text-sm text-media-on-surface-variant">
                {summaryMetrics.nextBirthdayDays !== null 
                  ? `Birthday in ${summaryMetrics.nextBirthdayDays} days` 
                  : 'No upcoming birthdays'}
              </span>
            </div>
          </div>

          {/* Search & Filter Cluster */}
          <div className="flex flex-col gap-8">
            <div className="relative w-full max-w-2xl group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-media-outline group-focus-within:text-media-secondary">search</span>
              <input 
                className="w-full bg-media-surface-container border-none rounded-lg pl-14 pr-6 py-5 focus:ring-0 focus:bg-media-surface-container-high transition-all font-lexend" 
                placeholder="Search the directory..." 
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              <div className={`absolute bottom-0 left-4 right-4 h-0.5 bg-media-secondary transition-transform origin-left ${searchTerm ? 'scale-x-100' : 'scale-x-0 group-focus-within:scale-x-100'}`}></div>
            </div>
            
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => handleFilterChange("all")}
                  className={`px-6 py-2 rounded-full font-medium text-sm transition-colors ${selectedFilter === "all" ? "bg-media-primary text-white" : "bg-media-tertiary-fixed text-media-on-tertiary-fixed hover:bg-media-tertiary-fixed-dim"}`}
                >
                  All
                </button>
                {(Object.keys(RELATIONSHIP_CONFIG) as RelationshipCategory[]).map((rel) => (
                  <button
                    key={rel}
                    onClick={() => handleFilterChange(rel)}
                    className={`px-6 py-2 rounded-full font-medium text-sm transition-colors ${selectedFilter === rel ? "bg-media-primary text-white" : "bg-media-tertiary-fixed text-media-on-tertiary-fixed hover:bg-media-tertiary-fixed-dim"}`}
                  >
                    {RELATIONSHIP_CONFIG[rel].label}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold tracking-tight text-media-on-surface-variant uppercase">Sort by</span>
                <Select value={sortBy} onValueChange={(value) => handleSortChange(value as SortOption)}>
                  <SelectTrigger className="w-[160px] bg-media-surface-container border-none rounded-lg focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-media-surface-container-high border-media-outline-variant/20">
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="birthday">Birthday</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Directory Grid */}
          {filteredPeople.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-media-surface-container-lowest rounded-xl border border-dashed border-media-outline-variant/30">
              <span className="material-symbols-outlined text-6xl text-media-outline/30 mb-4">person_search</span>
              <h3 className="text-2xl font-bold text-media-primary mb-2">No people found</h3>
              <p className="text-media-on-surface-variant text-center max-w-md">
                {searchTerm
                  ? `No results for "${searchTerm}". Try a different name or relationship type.`
                  : "Start building your editorial directory by adding your first contact."}
              </p>
              {searchTerm && (
                <button 
                  onClick={clearSearch}
                  className="cursor-pointer mt-6 text-media-secondary font-bold hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 pt-12">
              {filteredPeople.map((person) => {
                const config = RELATIONSHIP_CONFIG[person.relationship];
                const daysUntil = isClient ? calculateDaysUntil(person.birthday) : null;
                const zodiacSign = isClient ? getZodiacSignFromBirthday(person.birthday) : null;
                const initials = person.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

                return (
                  <div key={person.id} className="group flex flex-col bg-media-surface-container-lowest p-6 rounded-lg shadow-sm hover:scale-[1.02] transition-all duration-300 editorial-shadow">
                    <div className="relative mb-6 -mt-12 ml-4">
                      {person.photo ? (
                        <img 
                          alt={person.name} 
                          className="w-24 h-24 rounded-lg object-cover shadow-lg border-4 border-media-surface" 
                          src={person.photo} 
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-media-primary-fixed flex items-center justify-center text-media-primary text-3xl font-bold shadow-lg border-4 border-media-surface">
                          {initials}
                        </div>
                      )}
                      <div className={`absolute -bottom-2 -right-2 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded shadow-sm ${
                        person.relationship === 'family' ? 'bg-rose-500' :
                        person.relationship === 'friends' ? 'bg-blue-500' :
                        person.relationship === 'work' ? 'bg-media-tertiary-container' :
                        'bg-purple-500'
                      }`}>
                        {person.relationship}
                      </div>
                      {person.is_partner && (
                        <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-rose-500 flex items-center justify-center shadow-md">
                          <Heart className="h-3 w-3 text-white fill-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-media-primary tracking-tight line-clamp-1">{person.name}</h3>
                        <p className="text-media-on-surface-variant italic font-serif">
                          {person.relationshipTypeName || config.label}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditDialog(person)}
                          className="cursor-pointer p-2 hover:bg-media-surface-container rounded-full text-media-outline hover:text-media-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button 
                          onClick={() => openDeleteDialog(person)}
                          className="cursor-pointer p-2 hover:bg-media-surface-container rounded-full text-media-outline hover:text-media-error transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 mt-auto">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="material-symbols-outlined text-media-secondary text-lg">cake</span>
                        <div className="flex flex-col">
                          <span className="text-media-primary font-medium">
                            {(() => {
                              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                              const [, month, day] = person.birthday.split('-');
                              return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}`;
                            })()}
                          </span>
                          <span className="text-xs text-media-on-surface-variant">
                            ({daysUntil === 0 ? 'Today!' : `${daysUntil} days left`})
                          </span>
                        </div>
                      </div>
                      {zodiacSign && (
                        <div className="flex items-center gap-3 text-sm">
                          <span className="material-symbols-outlined text-media-secondary text-lg">auto_awesome</span>
                          <span className="text-media-primary font-medium">{zodiacSign.name}</span>
                        </div>
                      )}
                      
                      {/* Expansion info */}
                      {(person.email || person.phone) && (
                        <div className="pt-4 border-t border-media-outline-variant/10 flex gap-4">
                          {person.email && (
                            <button 
                              onClick={() => copyToClipboard(person.email!, "Email")}
                              className="cursor-pointer text-media-outline hover:text-media-primary transition-colors"
                              title={person.email}
                            >
                              <span className="material-symbols-outlined text-lg">mail</span>
                            </button>
                          )}
                          {person.phone && (
                            <button 
                              onClick={() => copyToClipboard(person.phone!, "Phone")}
                              className="cursor-pointer text-media-outline hover:text-media-primary transition-colors"
                              title={person.phone}
                            >
                              <span className="material-symbols-outlined text-lg">call</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Implementation */}
          <div className="mt-32 border-t-2 border-media-primary-container/10 pt-16 flex flex-col md:flex-row items-center gap-12 pb-20">
            <div className="flex-1">
              <h4 className="text-3xl font-bold text-media-primary mb-4 tracking-tighter">Expanding the Archive</h4>
              <p className="text-media-on-surface-variant text-lg leading-relaxed">The Editorial Directory is more than a list of names. It’s a rhythmic record of the people who shape your narrative. Add birthdays, milestones, and relationship notes to create a complete picture of your life’s core ensemble.</p>
            </div>
            <div className="flex-1 w-full aspect-video bg-media-surface-container-high rounded-xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-media-primary/10 to-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-7xl text-media-primary-container/20">auto_stories</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="mt-8">
          <div className="bg-media-surface-container-low rounded-xl p-8 border border-media-outline-variant/10 shadow-sm">
            <h3 className="text-3xl font-bold text-media-primary mb-6 tracking-tight">Relationship Management</h3>
            <p className="text-media-on-surface-variant mb-8 max-w-2xl">
              Customize the relationship categories and types to better organize your editorial directory. These labels will appear on your contact cards.
            </p>
            <RelationshipTypeManager onTypesChanged={refreshPeople} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <PersonFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingPerson={editingPerson}
        onSuccess={refreshPeople}
      />

      <DeletePersonDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        person={deletingPerson}
        onSuccess={refreshPeople}
      />
    </div>
  );
}
