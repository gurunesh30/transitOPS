import React, { useState } from 'react';

// Fleet Utilization: Area Chart
export const FleetUtilizationChart: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const data = [
    { day: 'Mon', value: 72 },
    { day: 'Tue', value: 78 },
    { day: 'Wed', value: 85 },
    { day: 'Thu', value: 82 },
    { day: 'Fri', value: 88 },
    { day: 'Sat', value: 65 },
    { day: 'Sun', value: 68 }
  ];

  const width = 500;
  const height = 180;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Calculate coordinates
  const points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.value / 100) * chartHeight;
    return { x, y, day: d.day, val: d.value };
  });

  // Area and Line Path definitions
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  return (
    <div className="relative w-full h-full bg-transparent select-none">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-primary)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--color-brand-primary)" stopOpacity="0.0" />
          </linearGradient>
          <filter id="shadowGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="var(--color-brand-primary)" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Gridlines */}
        {[0, 25, 50, 75, 100].map((level) => {
          const y = paddingTop + chartHeight - (level / 100) * chartHeight;
          return (
            <g key={level}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="var(--color-border-primary)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-white/40 font-mono">
                {level}%
              </text>
            </g>
          );
        })}

        {/* X Axis Labels */}
        {points.map((p, index) => (
          <text
            key={index}
            x={p.x}
            y={height - 6}
            textAnchor="middle"
            className="text-[10px] fill-white/40 font-medium"
          >
            {p.day}
          </text>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGlow)" />

        {/* Glow Line path */}
        <path
          d={linePath}
          fill="none"
          stroke="var(--color-brand-primary)"
          strokeWidth="2.5"
          filter="url(#shadowGlow)"
          className="transition-all duration-300"
        />

        {/* Interaction zones */}
        {points.map((p, index) => (
          <g key={index}>
            {/* Hit target */}
            <rect
              x={p.x - chartWidth / (data.length - 1) / 2}
              y={paddingTop}
              width={chartWidth / (data.length - 1)}
              height={chartHeight}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(index)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
            {/* Guide line */}
            {hoveredIdx === index && (
              <line
                x1={p.x}
                y1={paddingTop}
                x2={p.x}
                y2={paddingTop + chartHeight}
                stroke="var(--color-brand-secondary)"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
            )}
            {/* Point indicator */}
            {(hoveredIdx === index || hoveredIdx === null) && (
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === index ? 6 : 4}
                fill="var(--color-bg-primary)"
                stroke={hoveredIdx === index ? 'var(--color-brand-secondary)' : 'var(--color-brand-primary)'}
                strokeWidth="2"
                className="transition-all duration-150"
              />
            )}
          </g>
        ))}
      </svg>

      {/* Floating Tooltip */}
      {hoveredIdx !== null && (
        <div
          className="absolute z-10 p-2.5 rounded-lg border border-white/10 glass-panel shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full flex flex-col gap-0.5 animate-scale-up"
          style={{
            left: `${((points[hoveredIdx].x - paddingLeft) / chartWidth) * 100}%`,
            top: `${(points[hoveredIdx].y / height) * 100 - 5}%`,
            marginLeft: `${paddingLeft}px`
          }}
        >
          <span className="text-[10px] text-white/40 font-semibold uppercase">{data[hoveredIdx].day} Utilization</span>
          <span className="text-sm font-bold text-white">{data[hoveredIdx].value}% Capacity</span>
        </div>
      )}
    </div>
  );
};

// Vehicle Status: Donut Chart
export const VehicleStatusChart: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const data = [
    { label: 'Available', value: 4, color: 'var(--color-brand-success)', colorBg: 'rgba(34, 197, 94, 0.15)' },
    { label: 'On Trip', value: 3, color: 'var(--color-brand-secondary)', colorBg: 'rgba(59, 130, 246, 0.15)' },
    { label: 'In Shop', value: 1, color: 'var(--color-brand-warning)', colorBg: 'rgba(245, 158, 11, 0.15)' },
    { label: 'Retired', value: 1, color: 'var(--color-brand-danger)', colorBg: 'rgba(239, 68, 68, 0.15)' }
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  // SVG Circle stroke dash calculations
  const size = 150;
  const radius = 50;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
      {/* SVG Ring Container */}
      <div className="relative w-[150px] h-[150px] shrink-0">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--color-border-primary)"
            strokeWidth={strokeWidth}
          />
          {data.map((item, index) => {
            const percent = (item.value / total) * 100;
            const strokeDashOffset = circumference - (percent / 100) * circumference;
            const rotationOffset = (accumulatedPercent / 100) * circumference;
            accumulatedPercent += percent;

            const isHovered = hoveredIdx === index;

            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashOffset}
                className="transition-all duration-200 cursor-pointer"
                style={{
                  transformOrigin: 'center',
                  transform: `rotate(${(rotationOffset / circumference) * 360}deg)`
                }}
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {hoveredIdx !== null ? (
            <>
              <span className="text-xl font-bold text-white leading-none">
                {Math.round((data[hoveredIdx].value / total) * 100)}%
              </span>
              <span className="text-[10px] text-white/50 font-medium mt-1 uppercase tracking-wider truncate max-w-[80px]">
                {data[hoveredIdx].label}
              </span>
            </>
          ) : (
            <>
              <span className="text-2xl font-black text-white leading-none">{total}</span>
              <span className="text-[9px] text-white/40 font-semibold mt-1 uppercase tracking-widest">
                Vehicles
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 space-y-1.5 w-full">
        {data.map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-1.5 px-2.5 rounded-lg border transition-all ${
              hoveredIdx === index
                ? 'bg-white/5 border-white/10 translate-x-1'
                : 'bg-transparent border-transparent'
            }`}
            onMouseEnter={() => setHoveredIdx(index)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-xs font-semibold text-white/80">{item.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-white">{item.value}</span>
              <span className="text-[10px] font-mono text-white/40">
                ({Math.round((item.value / total) * 100)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Fuel Efficiency: Vertical Bar Chart
export const FuelUsageChart: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const data = [
    { type: 'Semi-Truck', efficiency: 7.2, target: 8.5 },
    { type: 'Box Truck', efficiency: 12.4, target: 14.0 },
    { type: 'Cargo Van', efficiency: 16.8, target: 18.0 }
  ];

  const maxVal = 20;

  return (
    <div className="space-y-4 py-2">
      {data.map((item, index) => {
        const percentActual = (item.efficiency / maxVal) * 100;
        const percentTarget = (item.target / maxVal) * 100;
        const isHovered = hoveredIdx === index;

        return (
          <div
            key={index}
            className="space-y-1.5"
            onMouseEnter={() => setHoveredIdx(index)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-white/80">{item.type}</span>
              <div className="flex gap-3 text-right">
                <span className="text-white font-mono">{item.efficiency} MPG</span>
                <span className="text-white/40 font-mono font-medium">Target: {item.target}</span>
              </div>
            </div>

            {/* Visual Double Track bar */}
            <div className="relative w-full h-3.5 bg-white/5 rounded-full overflow-hidden border border-white/5 cursor-pointer">
              {/* Target Line marker */}
              <div
                className="absolute top-0 bottom-0 border-r border-white/30 z-2"
                style={{ left: `${percentTarget}%` }}
              />
              {/* Actual Filled Bar */}
              <div
                className={`h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full transition-all duration-500 ${
                  isHovered ? 'brightness-110 shadow-lg' : ''
                }`}
                style={{ width: `${percentActual}%` }}
              />
            </div>
          </div>
        );
      })}
      
      <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[9px] text-white/40 font-mono">
        <span>0 MPG</span>
        <span>10 MPG</span>
        <span>20 MPG (Max)</span>
      </div>
    </div>
  );
};

// Maintenance Trends & Expenses: Double line chart
export const MaintenanceTrendsChart: React.FC = () => {
  const data = [
    { month: 'Jan', cost: 1200, count: 2 },
    { month: 'Feb', cost: 850, count: 1 },
    { month: 'Mar', cost: 2300, count: 4 },
    { month: 'Apr', cost: 1100, count: 2 },
    { month: 'May', cost: 3400, count: 5 },
    { month: 'Jun', cost: 1600, count: 3 }
  ];

  const width = 500;
  const height = 150;
  const paddingLeft = 45;
  const paddingRight = 10;
  const paddingTop = 15;
  const paddingBottom = 20;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxCost = 4000;

  const points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.cost / maxCost) * chartHeight;
    return { x, y, month: d.month, cost: d.cost, count: d.count };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="w-full h-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        {/* Horizontal scale */}
        {[0, 1000, 2000, 3000, 4000].map((val) => {
          const y = paddingTop + chartHeight - (val / maxCost) * chartHeight;
          return (
            <g key={val}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="var(--color-border-primary)"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-white/40 font-mono">
              ₹{val}
              </text>
            </g>
          );
        })}

        {/* X labels */}
        {points.map((p, idx) => (
          <text
            key={idx}
            x={p.x}
            y={height - 4}
            textAnchor="middle"
            className="text-[10px] fill-white/40 font-semibold"
          >
            {p.month}
          </text>
        ))}

        {/* Spark Line */}
        <path
          d={linePath}
          fill="none"
          stroke="var(--color-brand-primary)"
          strokeWidth="2.5"
          className="transition-all"
        />

        {/* Points */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle cx={p.x} cy={p.y} r="4" fill="var(--color-bg-primary)" stroke="var(--color-brand-primary)" strokeWidth="2.5" />
            <text
              x={p.x}
              y={p.y - 8}
              textAnchor="middle"
              className="text-[9px] fill-white/70 font-mono font-bold"
            >
              x{p.count}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};