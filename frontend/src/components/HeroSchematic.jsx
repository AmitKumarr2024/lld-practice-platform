const nodes = [
  { key: "problem", label: "PROBLEM", x: 40, y: 160 },
  { key: "design", label: "DESIGN", x: 220, y: 60 },
  { key: "submit", label: "SUBMIT", x: 400, y: 160 },
  { key: "feedback", label: "FEEDBACK", x: 220, y: 260 },
];

const loopBackX = 40;
const loopBackY = 160;

export function HeroSchematic() {
  return (
    <svg viewBox="0 0 460 320" className="h-auto w-full max-w-xl" aria-hidden="true">
      {/* connecting paths, each drawn in sequence */}
      <path
        d="M 70 150 L 195 75"
        stroke="#33465F"
        strokeWidth="1.5"
        fill="none"
        className="draw-path"
        style={{ animationDelay: "0.1s" }}
      />
      <path
        d="M 250 70 L 375 150"
        stroke="#33465F"
        strokeWidth="1.5"
        fill="none"
        className="draw-path"
        style={{ animationDelay: "0.4s" }}
      />
      <path
        d="M 390 185 L 255 250"
        stroke="#33465F"
        strokeWidth="1.5"
        fill="none"
        className="draw-path"
        style={{ animationDelay: "0.7s" }}
      />
      <path
        d="M 195 258 C 100 280, 40 230, 55 185"
        stroke="#4CE0D2"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="4 5"
        className="draw-path"
        style={{ animationDelay: "1.0s" }}
      />
      {/* retry arrowhead */}
      <polygon points="52,175 62,183 47,190" fill="#4CE0D2" className="draw-node" style={{ animationDelay: "1.35s" }} />

      {nodes.map((n, i) => (
        <g key={n.key} className="draw-node" style={{ animationDelay: `${0.15 + i * 0.25}s` }}>
          <circle cx={n.x} cy={n.y} r="22" fill="#0E1420" stroke={i === 0 || i === 2 ? "#4CE0D2" : "#33465F"} strokeWidth="1.5" />
          <text
            x={n.x}
            y={n.y + 40}
            textAnchor="middle"
            className="font-mono"
            fontSize="10"
            letterSpacing="1"
            fill="#7C8CA5"
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
