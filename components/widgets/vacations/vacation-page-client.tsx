'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { PageTabsList } from '@/components/ui/page-tabs-list';
import { Plus, Search, Plane } from 'lucide-react';
import { Vacation, VacationStatus, VACATION_STATUSES, VACATION_STATUS_NAMES } from '@/lib/types/vacations';
import { VacationYearGroups } from './vacation-year-groups';

interface VacationPageClientProps {
  vacations: Vacation[];
}

type ViewTab = 'vacations';

export function VacationPageClient({ vacations }: VacationPageClientProps) {
  const router = useRouter();
  const [viewTab, setViewTab] = useState<ViewTab>('vacations');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<VacationStatus | 'all'>('all');

  // Filter vacations
  const filteredVacations = vacations.filter((vacation) => {
    const matchesSearch =
      searchTerm === '' ||
      vacation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacation.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vacation.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (vacation.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ?? false);

    const matchesStatus = statusFilter === 'all' || vacation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto py-6 sm:py-8 px-4 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Vacations</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Plan and track your trips with detailed itineraries
          </p>
        </div>
        {/* Hide header button on mobile to avoid duplication with Tabs action */}
        <div className="hidden sm:block">
          <Button asChild>
            <Link href="/vacations/new">
              <Plus className="w-4 h-4 mr-2" />
              Plan Vacation
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as ViewTab)}>
        <PageTabsList
          tabs={[
            { value: 'vacations', label: 'Vacations', icon: Plane, showLabel: false },
          ]}
          actionButton={{
            label: 'Plan Vacation',
            onClick: () => router.push('/vacations/new'),
            icon: Plus,
          }}
        />

        <TabsContent value="vacations" className="space-y-6 sm:space-y-8 mt-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search vacations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as VacationStatus | 'all')}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {VACATION_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {VACATION_STATUS_NAMES[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          {searchTerm || statusFilter !== 'all' ? (
            <p className="text-sm text-muted-foreground">
              Showing {filteredVacations.length} of {vacations.length} vacations
            </p>
          ) : null}

          {/* Vacation List */}
          <VacationYearGroups vacations={filteredVacations} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
