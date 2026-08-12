import StatCard from './StatCard';

export default function KpiCards({ items = [] }) {
  return (
    <section aria-label="Key metrics">
      {/* Phone: 2-up dense grid · tablet: 2 · laptop+: 4 */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-4">
        {items.map((kpi) => (
          <StatCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.display}
            description={kpi.description}
            trend={kpi.trend}
            status={kpi.status}
            source={kpi.source}
            icon={kpi.icon}
            errorMessage={kpi.errorMessage}
          />
        ))}
      </div>
    </section>
  );
}
