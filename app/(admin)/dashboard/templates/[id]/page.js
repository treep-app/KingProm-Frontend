import { redirect } from 'next/navigation';

export default async function TemplateDetailPage({ params }) {
  const { id } = await params;
  redirect(`/dashboard/templates/${encodeURIComponent(id)}/edit`);
}
