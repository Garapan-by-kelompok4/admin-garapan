interface StatSparklineProps {
  points: number[];
  color: string;
  width?: number;
  height?: number;
}

export function StatSparkline({
  points,
  color,
  width = 68,
  height = 28,
}: StatSparklineProps) {
  if (points.length < 2) {
    return null;
  }

  const inset = 1;
  const plotWidth = width - inset * 2;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const step = plotWidth / (points.length - 1);

  const svgPoints = points
    .map((p, idx) => {
      const x = inset + idx * step;
      const y = height - inset - ((p - min) / range) * (height - inset * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className="block max-w-full select-none pointer-events-none"
      aria-hidden
      overflow="hidden"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={svgPoints}
      />
    </svg>
  );
}
