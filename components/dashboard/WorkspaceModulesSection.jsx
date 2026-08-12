import ModuleCard from './ModuleCard';
import { SectionHeader } from './ui';
import { WORKSPACE_MODULES } from '../../lib/dashboard/modules';

export default function WorkspaceModulesSection() {
  return (
    <section aria-label="Modules" className="space-y-3">
      <SectionHeader title="Workspace modules" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {WORKSPACE_MODULES.map((mod) => (
          <ModuleCard
            key={mod.id}
            href={mod.href}
            title={mod.title}
            description={mod.description}
            status={mod.status}
            icon={mod.icon}
          />
        ))}
      </div>
    </section>
  );
}
