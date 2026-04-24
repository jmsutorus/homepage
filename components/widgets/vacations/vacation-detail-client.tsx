'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VacationWithDetails } from '@/lib/types/vacations';
import { PlannedView } from './planned-view';
import { DetailView } from './detail-view';

interface VacationDetailClientProps {
  vacationData: VacationWithDetails;
}


export function VacationDetailClient({ vacationData: initialData }: VacationDetailClientProps) {
  const router = useRouter();
  const [vacationData, setVacationData] = useState(initialData);
  const { vacation } = vacationData;

  const handleUpdate = async () => {
    // Fetch fresh data from the API (no cache)
    const response = await fetch(`/api/vacations/${vacation.slug}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    if (response.ok) {
      const freshData = await response.json();
      setVacationData(freshData);
    }
    // Also refresh the server component for consistency
    router.refresh();
  };

  const isPlannedOrBooked = vacation.status === 'planning' || vacation.status === 'booked';

  if (isPlannedOrBooked) {
    return <PlannedView vacationData={vacationData} onUpdate={handleUpdate} />;
  }

  return <DetailView vacationData={vacationData} onUpdate={handleUpdate} />;
}
