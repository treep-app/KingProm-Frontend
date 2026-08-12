import { redirect } from 'next/navigation';

/** Legacy path — keep working for older seeded links */
export default async function ScratchCardRedirect({ searchParams }) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params?.token) qs.set('token', params.token);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  redirect(`/golden-ticket${suffix}`);
}
