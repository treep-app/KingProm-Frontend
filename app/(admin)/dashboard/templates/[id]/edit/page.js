import TemplateEditorPage from '../../../../../../components/dashboard/TemplateEditorPage';

export const metadata = { title: 'Edit template' };

export default async function EditTemplatePage({ params }) {
  const { id } = await params;
  return <TemplateEditorPage mode="edit" templateId={id} />;
}
