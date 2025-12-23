/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, User, Users, UserPlus, Briefcase, Mail, Phone, Trash2, Edit, Cake, Heart, Settings, ListTodo, Search, X, Copy, Sparkles, Gift } from "lucide-react";
import { type Person, type RelationshipCategory } from "@/lib/db/people";
import { PersonFormDialog } from "@/components/widgets/people/person-form-dialog";
import { DeletePersonDialog } from "@/components/widgets/people/delete-person-dialog";
import { RelationshipTypeManager } from "@/components/widgets/people/relationship-type-manager";
import { getZodiacSignFromBirthday, getZodiacElementColor } from "@/lib/zodiac";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PageTabsList } from "@/components/ui/page-tabs-list";
import { toast } from "sonner";
import { AnimatedProgressRing } from "@/components/ui/animations/animated-progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">People</h1>
          <p className="text-muted-foreground">Track birthdays and important dates for family and friends</p>
        </div>
        {viewTab === "people" && (
          <Button onClick={openAddDialog} className="w-full sm:w-auto hidden md:flex">
            <Plus className="mr-2 h-4 w-4" />
            Add Person
          </Button>
        )}
      </div>

      <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as "people" | "manage")}>
        <PageTabsList
          tabs={[
            { value: "people", label: "People", icon: ListTodo, showLabel: false },
            { value: "manage", label: "Manage", icon: Settings, showLabel: false },
          ]}
          actionButton={viewTab === "people" ? {
            label: "Add Person",
            onClick: openAddDialog,
            icon: Plus,
          } : undefined}
        />

        <TabsContent value="people" className="space-y-6 mt-6 pb-20 md:pb-0">

      {/* Birthday Countdown Widgets */}
      {people.length > 0 && isClient && (() => {
        // Get next 3 upcoming birthdays
        const upcomingBirthdays = [...people]
          .map(person => ({
            ...person,
            daysUntil: calculateDaysUntil(person.birthday)
          }))
          .sort((a, b) => a.daysUntil - b.daysUntil)
          .slice(0, 3);

        if (upcomingBirthdays.length === 0) return null;

        return (
          <div className="flex flex-wrap justify-center gap-8">
            {upcomingBirthdays.map((person, index) => {
              const age = calculateAge(person.birthday);
              const upcomingAge = age !== null ? age + 1 : null;
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              const [, month, day] = person.birthday.split('-');
              const birthdayDate = `${monthNames[parseInt(month) - 1]} ${parseInt(day)}`;

              // Calculate progress (ring fills up as birthday approaches)
              const maxDays = 30;
              const progress = Math.max(0, maxDays - person.daysUntil);

              return (
                <TooltipProvider key={person.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center cursor-help">
                        <div className="relative">
                          <AnimatedProgressRing
                            value={progress}
                            max={maxDays}
                            size={100}
                            strokeWidth={10}
                            color={
                              person.daysUntil === 0 ? "success" :
                              person.daysUntil <= 7 ? "warning" :
                              "primary"
                            }
                            showLabel={false}
                            delay={index * 0.15}
                          />
                          {/* Days remaining in center */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-2xl font-bold">
                              {person.daysUntil === 0 ? '🎉' : person.daysUntil}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {person.daysUntil === 0 ? 'Today!' : person.daysUntil === 1 ? 'day' : 'days'}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 text-center">
                          <div className="font-medium text-sm">{person.name}</div>
                          <div className="text-xs text-muted-foreground">{birthdayDate}</div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">{person.name}</p>
                        <p className="text-sm">Birthday: {birthdayDate}</p>
                        {upcomingAge && <p className="text-sm">Turning {upcomingAge}</p>}
                        <p className="text-sm text-muted-foreground">
                          {person.daysUntil === 0 ? 'Today!' : `${person.daysUntil} day${person.daysUntil !== 1 ? 's' : ''} away`}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        );
      })()}

      {/* Fun Stats */}
      {people.length > 0 && isClient && (
        <Card className="border-dashed border-2">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-6 text-sm">
              {(() => {
                // Calculate zodiac distribution
                const zodiacCounts = new Map<string, { count: number; emoji: string; element: string }>();
                people.forEach((p) => {
                  const sign = getZodiacSignFromBirthday(p.birthday);
                  if (sign) {
                    const existing = zodiacCounts.get(sign.name);
                    if (existing) {
                      existing.count++;
                    } else {
                      zodiacCounts.set(sign.name, { count: 1, emoji: sign.emoji, element: sign.element });
                    }
                  }
                });

                // Find most common zodiac
                let mostCommonZodiac = { name: '', count: 0, emoji: '', element: '' };
                zodiacCounts.forEach((data, name) => {
                  if (data.count > mostCommonZodiac.count) {
                    mostCommonZodiac = { name, count: data.count, emoji: data.emoji, element: data.element };
                  }
                });

                // Calculate most common birth month
                const monthCounts = new Map<number, number>();
                people.forEach((p) => {
                  const [, month] = p.birthday.split('-');
                  const monthNum = parseInt(month, 10);
                  monthCounts.set(monthNum, (monthCounts.get(monthNum) || 0) + 1);
                });

                let mostCommonMonth = { num: 0, count: 0 };
                monthCounts.forEach((count, monthNum) => {
                  if (count > mostCommonMonth.count) {
                    mostCommonMonth = { num: monthNum, count };
                  }
                });

                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

                // Calculate milestone birthdays
                let milestoneCount = 0;
                people.forEach((p) => {
                  const age = calculateAge(p.birthday);
                  if (age !== null) {
                    const upcomingAge = age + 1;
                    if (MILESTONE_AGES.includes(upcomingAge)) {
                      milestoneCount++;
                    }
                  }
                });

                return (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">👥</span>
                      <span className="font-medium">{people.length}</span>
                      <span className="text-muted-foreground">
                        {people.length === 1 ? 'person tracked' : 'people tracked'}
                      </span>
                    </div>
                    {mostCommonZodiac.count > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Most common:</span>
                        <Badge variant="outline" className={getZodiacElementColor(mostCommonZodiac.element as any)}>
                          <span className="mr-1">{mostCommonZodiac.emoji}</span>
                          {mostCommonZodiac.name}
                        </Badge>
                        <span className="text-muted-foreground">
                          ({mostCommonZodiac.count} {mostCommonZodiac.count === 1 ? 'person' : 'people'})
                        </span>
                      </div>
                    )}
                    {mostCommonMonth.count > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">🎂 Most birthdays in:</span>
                        <span className="font-medium">{monthNames[mostCommonMonth.num - 1]}</span>
                        <span className="text-muted-foreground">
                          ({mostCommonMonth.count})
                        </span>
                      </div>
                    )}
                    {milestoneCount > 0 && (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="font-medium text-yellow-900 dark:text-yellow-200">
                          {milestoneCount} milestone {milestoneCount === 1 ? 'birthday' : 'birthdays'} coming up!
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, phone, notes, or gift ideas..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Relationship filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("all")}
          >
            All
          </Button>
          {(Object.keys(RELATIONSHIP_CONFIG) as RelationshipCategory[]).map((rel) => {
            const config = RELATIONSHIP_CONFIG[rel];
            const Icon = config.icon;
            return (
              <Button
                key={rel}
                variant={selectedFilter === rel ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange(rel)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {config.label}
              </Button>
            );
          })}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 sm:ml-auto">
          <Label className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</Label>
          <Select value={sortBy} onValueChange={(value) => handleSortChange(value as SortOption)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="birthday">Birthday</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* People list */}
      {filteredPeople.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No people found</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {searchTerm
                ? `No results for "${searchTerm}"`
                : selectedFilter === "all"
                ? "Add your first contact to start tracking birthdays"
                : `No people in the ${RELATIONSHIP_CONFIG[selectedFilter as RelationshipCategory].label} category`}
            </p>
            {searchTerm ? (
              <Button onClick={clearSearch} variant="outline">
                Clear Search
              </Button>
            ) : selectedFilter === "all" && (
              <Button onClick={openAddDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Person
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPeople.map((person) => {
            const config = RELATIONSHIP_CONFIG[person.relationship];
            const Icon = config.icon;
            // Only calculate date-dependent values on the client to prevent hydration mismatch
            const daysUntil = isClient ? calculateDaysUntil(person.birthday) : null;
            const age = isClient ? calculateAge(person.birthday) : null;
            const isToday = isClient && daysUntil === 0;
            const zodiacSign = isClient ? getZodiacSignFromBirthday(person.birthday) : null;

            // Calculate upcoming age and check if it's a milestone
            const upcomingAge = isClient && age !== null ? age + 1 : null;
            const isMilestoneBirthday = isClient && upcomingAge !== null && MILESTONE_AGES.includes(upcomingAge);

            return (
              <Card key={person.id} className={`${isToday ? "border-pink-500 border-2" : ""} ${person.is_partner ? "border-rose-400/50 bg-rose-500/5" : ""} ${isMilestoneBirthday && !isToday ? "border-yellow-500/50 bg-gradient-to-br from-yellow-500/5 to-amber-500/5" : ""}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className="relative h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        {person.photo ? (
                          <img src={person.photo} alt={person.name} className="h-12 w-12 rounded-full object-cover" />
                        ) : (
                          <User className="h-6 w-6 text-muted-foreground" />
                        )}
                        {person.is_partner && (
                          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-rose-500 flex items-center justify-center">
                            <Heart className="h-3 w-3 text-white fill-white" />
                          </div>
                        )}
                      </div>

                      {/* Person info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-lg">{person.name}</CardTitle>
                          {person.relationshipTypeName && (
                            <Badge variant="outline" className="bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300">
                              {person.relationshipTypeName}
                            </Badge>
                          )}
                          <Badge variant="outline" className={config.bgClass}>
                            <Icon className="mr-1 h-3 w-3" />
                            {config.label}
                          </Badge>
                          {isToday && (
                            <Badge variant="outline" className="bg-pink-500/10 border-pink-500/30 text-pink-700 dark:text-pink-300">
                              <Cake className="mr-1 h-3 w-3" />
                              Today!
                            </Badge>
                          )}
                          {zodiacSign && (
                            <Badge
                              variant="outline"
                              className={getZodiacElementColor(zodiacSign.element)}
                              title={`${zodiacSign.name} (${zodiacSign.dateRange})`}
                            >
                              <span className="mr-1">{zodiacSign.emoji}</span>
                              {zodiacSign.name}
                            </Badge>
                          )}
                          {isMilestoneBirthday && (
                            <Badge
                              variant="outline"
                              className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/40 text-yellow-900 dark:text-yellow-200"
                              title={`Turning ${upcomingAge} - Milestone Birthday!`}
                            >
                              <Sparkles className="mr-1 h-3 w-3" />
                              Milestone: {upcomingAge}
                            </Badge>
                          )}
                        </div>

                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex items-center gap-4 flex-wrap">
                            <span className="text-muted-foreground">
                              Birthday: {(() => {
                                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                                const [, month, day] = person.birthday.split('-');
                                return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}`;
                              })()}
                            </span>
                            {isClient && daysUntil !== null && daysUntil > 0 && (
                              <span className="text-muted-foreground">
                                ({daysUntil} day{daysUntil !== 1 ? 's' : ''})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 flex-wrap text-muted-foreground">
                            {isClient ? (
                              age !== null ? (
                                <span>Age: {age}</span>
                              ) : (
                                <span>Age unknown</span>
                              )
                            ) : (
                              <span>Age: ...</span>
                            )}
                            {person.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <a
                                  href={`mailto:${person.email}`}
                                  className="hover:underline hover:text-primary transition-colors"
                                >
                                  {person.email}
                                </a>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 ml-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(person.email!, "Email");
                                  }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                            {person.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <a
                                  href={`tel:${person.phone}`}
                                  className="hover:underline hover:text-primary transition-colors"
                                >
                                  {person.phone}
                                </a>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 ml-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(person.phone!, "Phone");
                                  }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                          {person.notes && (
                            <p className="text-muted-foreground mt-2 line-clamp-2">{person.notes}</p>
                          )}
                          {person.gift_ideas && (
                            <div className="flex items-start gap-2 text-muted-foreground mt-2">
                              <Gift className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <p className="line-clamp-2">{person.gift_ideas}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(person)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(person)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}
        </TabsContent>

        <TabsContent value="manage" className="space-y-6 mt-6 pb-20 md:pb-0">
          <RelationshipTypeManager onTypesChanged={refreshPeople} />
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
