/* Inline SVG charts — no libs */
function LineChart({ data, height = 220, color = "var(--brand-500)" }) {
  const w = 720, h = height, pad = { t: 20, r: 20, b: 30, l: 40 };
  const max = Math.max(...data.map(d => d.v)) * 1.1;
  const min = 0;
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const x = (i) => pad.l + (i / (data.length - 1)) * innerW;
  const y = (v) => pad.t + innerH - ((v - min) / (max - min)) * innerH;
  const line = data.map((d,i) => (i===0?"M":"L") + x(i) + "," + y(d.v)).join(" ");
  const area = line + ` L ${x(data.length-1)},${pad.t+innerH} L ${x(0)},${pad.t+innerH} Z`;
  const yTicks = 4;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="chart" preserveAspectRatio="none" style={{ height: h }}>
      <defs>
        <linearGradient id="lg1" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"  stopColor={color} stopOpacity=".22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({length: yTicks+1}).map((_,i) => {
        const v = (max / yTicks) * i;
        const yy = pad.t + innerH - (i/yTicks) * innerH;
        return (
          <g key={i}>
            <line x1={pad.l} x2={w - pad.r} y1={yy} y2={yy} stroke="var(--border)" strokeDasharray="3 4"/>
            <text x={pad.l - 8} y={yy + 4} textAnchor="end" fontSize="10.5" fill="var(--ink-400)" fontFamily="Inter">
              {Math.round(v)}
            </text>
          </g>
        );
      })}
      <path d={area} fill="url(#lg1)" />
      <path d={line} fill="none" stroke={color} strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d,i) => (
        (i % 5 === 0 || i === data.length-1) && (
          <g key={i}>
            <circle cx={x(i)} cy={y(d.v)} r="3.5" fill="#fff" stroke={color} strokeWidth="2"/>
          </g>
        )
      ))}
      {data.map((d,i) => (
        (i % 5 === 0 || i === data.length-1) && (
          <text key={"t"+i} x={x(i)} y={h - 10} textAnchor="middle" fontSize="10.5" fill="var(--ink-400)" fontFamily="Inter">{d.l}</text>
        )
      ))}
    </svg>
  );
}

function DonutChart({ data, size = 190 }) {
  const total = data.reduce((a,c) => a + c.v, 0);
  const R = size/2 - 8;
  const r = R * 0.62;
  const cx = size/2, cy = size/2;
  let acc = 0;
  const arcs = data.map((d,i) => {
    const a0 = (acc/total) * Math.PI * 2 - Math.PI/2;
    acc += d.v;
    const a1 = (acc/total) * Math.PI * 2 - Math.PI/2;
    const large = (a1 - a0) > Math.PI ? 1 : 0;
    const x0 = cx + R*Math.cos(a0), y0 = cy + R*Math.sin(a0);
    const x1 = cx + R*Math.cos(a1), y1 = cy + R*Math.sin(a1);
    const xi1 = cx + r*Math.cos(a1), yi1 = cy + r*Math.sin(a1);
    const xi0 = cx + r*Math.cos(a0), yi0 = cy + r*Math.sin(a0);
    const path = `M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} L ${xi1} ${yi1} A ${r} ${r} 0 ${large} 0 ${xi0} ${yi0} Z`;
    return <path key={i} d={path} fill={d.c} />;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {arcs}
      <text x={cx} y={cy-2} textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--ink-900)" fontFamily="Plus Jakarta Sans">{total}</text>
      <text x={cx} y={cy+16} textAnchor="middle" fontSize="10.5" fill="var(--ink-400)" fontFamily="Inter">total jasa</text>
    </svg>
  );
}

function Sparkline({ data, color = "var(--brand-500)", w = 90, h = 28 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v,i) => [(i/(data.length-1))*w, h - ((v-min)/Math.max(1,(max-min)))*h]);
  const d = pts.map((p,i) => (i===0?"M":"L") + p[0] + "," + p[1]).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round"/>
    </svg>
  );
}

Object.assign(window, { LineChart, DonutChart, Sparkline });
