import { Suspense } from 'react';
import GoldenTicketPage from '../../../components/GoldenTicketPage';
import TicketLoadingPlaceholder from '../../../components/TicketLoadingPlaceholder';

export const metadata = {
  title: 'Golden Ticket',
  description: 'Scratch to reveal your exclusive offer',
};

export default function GoldenTicketRoute() {
  return (
    <Suspense fallback={<TicketLoadingPlaceholder message="Loading your ticket…" />}>
      <GoldenTicketPage />
    </Suspense>
  );
}
