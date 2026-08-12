export default function StarRow({ color = '#111', size = 10, className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`} aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M12 2.5l2.9 6.1 6.7.9-4.9 4.6 1.2 6.6L12 17.8 6.1 20.7l1.2-6.6L2.4 9.5l6.7-.9L12 2.5z" />
        </svg>
      ))}
    </div>
  );
}
