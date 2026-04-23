/**
 * hand-drawn looking X and O marks. rendered as SVG so they scale
 * perfectly inside any cell size. colors match asher's crayons.
 */

export function MarkX({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-label="X">
      <g
        fill="none"
        stroke="#e84242"
        strokeWidth={14}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 22 L80 80" />
        <path d="M80 20 L22 80" />
      </g>
    </svg>
  );
}

export function MarkO({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-label="O">
      {/* slightly imperfect circle — rotated ellipse approximation */}
      <ellipse
        cx="50"
        cy="52"
        rx="32"
        ry="30"
        fill="none"
        stroke="#3fa14a"
        strokeWidth={13}
        strokeLinecap="round"
        transform="rotate(-4 50 50)"
      />
    </svg>
  );
}

export function Mark({
  kind,
  className,
}: {
  kind: 'X' | 'O';
  className?: string;
}) {
  return kind === 'X' ? <MarkX className={className} /> : <MarkO className={className} />;
}
