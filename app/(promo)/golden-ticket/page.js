import { Suspense } from 'react';
import GoldenTicketPage from '../../../components/GoldenTicketPage';
import TicketLoadingPlaceholder from '../../../components/TicketLoadingPlaceholder';

export const metadata = {
  title: 'Golden Ticket | Blue Top Villa',
  description: 'Scratch to reveal your exclusive Blue Top Villa offer',
};

export default function GoldenTicketRoute() {
  return (
    <Suspense fallback={<TicketLoadingPlaceholder message="Loading your ticket…" />}>
      <GoldenTicketPage />
    </Suspense>
  );
}
