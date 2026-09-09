export function ScoreGauge({ score, max = 100, size = 148 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, score / max));
  const offset = circumference * (1 - pct);
  const color = pct >= 0.75 ? "#4CE0D2" : pct >= 0.5 ? "#F5A623" : "#FF6B6B";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#223047" strokeWidth="8" fill="none" />
        <circle
          className="gauge-ring"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-3xl font-semibold text-ink">{score}</span>
        <span className="font-mono text-[10px] tracking-wide text-muted">/ {max}</span>
      </div>
    </div>
  );
}
