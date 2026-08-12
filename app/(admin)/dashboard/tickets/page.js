import { redirect } from 'next/navigation';

/** Legacy path — tickets module lives at /dashboard/promo-codes */
export default function TicketsRedirect() {
  redirect('/dashboard/promo-codes');
}
