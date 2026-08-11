'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Color map for brands
const BRAND_COLORS = {
  'Ultratech Cement': '#f59e0b',       // Amber
  'Dalmia Bharat Cement': '#ef4444',   // Red
  'Dalmia Cement': '#f87171',          // Light Red
  'Adani Ambuja Cement': '#10b981',    // Emerald Green
  'Adani Acc Cement': '#06b6d4',       // Cyan
  'Jsw Cement': '#a855f7',             // Purple
  'Nuvoco Cement': '#ec4899',          // Pink
  'Rashmi Cement': '#14b8a6',          // Teal
  'Ramco': '#6366f1',                  // Indigo
  'Other': '#475569',                  // Slate
};

const getBrandColor = (brandName) => {
  if (BRAND_COLORS[brandName]) return BRAND_COLORS[brandName];
  // Simple hash for dynamic colors if brand is not predefined
  let hash = 0;
  for (let i = 0; i < brandName.length; i++) {
    hash = brandName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 60%)`;
};

// Custom Chart Tooltip styling to fit dark glassmorphism theme
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Calculate total spots dynamically based on active payload bars (stacked bar chart)
    const isStacked = payload.length > 1 || (payload[0] && payload[0].payload.area !== undefined);
    const totalSpots = isStacked 
      ? payload.reduce((sum, entry) => sum + (typeof entry.value === 'number' ? entry.value : 0), 0)
      : null;
    
    return (
      <div style={{
        background: 'rgba(15, 17, 28, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        padding: '12px',
        borderRadius: '8px',
        color: '#f8fafc',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
      }}>
        <p style={{ fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '4px' }}>
          {label} {totalSpots !== null ? `(Total: ${totalSpots} Spots)` : ''}
        </p>
        {payload.map((entry, index) => {
          if (entry.value === 0) return null; // Hide brands with 0 count in this area
          
          let displayVal = entry.value;
          
          if (isStacked) {
            const percent = totalSpots > 0 ? ((entry.value / totalSpots) * 100).toFixed(1) : 0;
            displayVal = `${percent}% (${entry.value} ${entry.value === 1 ? 'spot' : 'spots'})`;
          } else if (entry.payload.rawCount !== undefined) {
            displayVal = `${entry.value}% (${entry.payload.rawCount} spots)`;
          } else {
            displayVal = `${entry.value} spots`;
          }

          return (
            <p key={index} style={{ color: entry.color, fontSize: '13px', margin: '4px 0' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: entry.color, marginRight: '6px' }}></span>
              {entry.name}: {displayVal}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

export default function ChartsComponent({ stats }) {
  if (!stats) return <div style={{ color: '#94a3b8' }}>Loading charts...</div>;

  // 1. Area wise Brand Count Stacked Bar Chart (Absolute heights, percentage in tooltips)
  const areaDataRaw = (stats.area_brand_counts || []).slice(0, 12);
  const allBrands = stats.brands || [];

  // 2. Brand Shares Donut Chart
  const brandShareData = Object.entries(stats.brand_counts || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // 3. Media Type Counts in Percentage Form
  const mediaTypeDataRaw = Object.entries(stats.media_type_counts || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
    
  const totalMedia = mediaTypeDataRaw.reduce((acc, curr) => acc + curr.value, 0);
  const mediaTypeDataPercent = mediaTypeDataRaw.map(item => ({
    name: item.name,
    value: totalMedia > 0 ? parseFloat(((item.value / totalMedia) * 100).toFixed(1)) : 0,
    rawCount: item.value
  }));

  return (
    <div className="charts-grid">
      {/* Chart 1: Stacked Bar Chart for Area Wise Brands */}
      <div className="section-card chart-double-col">
        <div className="section-card-title">
          <h2>Area-wise Brand Concentration</h2>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Showing Top Areas (Stacked by Brand, hover to see shares)</span>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={areaDataRaw}
              margin={{ top: 20, right: 10, left: -25, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="area" 
                stroke="#94a3b8" 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis 
                stroke="#94a3b8" 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '10px', fontSize: '11px', color: '#94a3b8' }} 
                iconSize={10}
              />
              {allBrands.map((brand) => (
                <Bar 
                  key={brand} 
                  dataKey={brand} 
                  stackId="a" 
                  fill={getBrandColor(brand)} 
                  maxBarSize={35}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Brand Distribution Pie Chart */}
      <div className="section-card">
        <div className="section-card-title">
          <h2>Brand Distribution</h2>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Overall Market Share</span>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={brandShareData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
              >
                {brandShareData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBrandColor(entry.name)} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: '10px', color: '#94a3b8', maxHeight: '60px', overflowY: 'auto' }}
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Media Type Distribution */}
      <div className="section-card">
        <div className="section-card-title">
          <h2>Branding Formats (Media Share)</h2>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Branding Formats Share (Percentage)</span>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={mediaTypeDataPercent}
              layout="vertical"
              margin={{ top: 5, right: 15, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                type="number" 
                stroke="#94a3b8" 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="#94a3b8" 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                width={155}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill="#3b82f6" 
                radius={[0, 4, 4, 0]}
                maxBarSize={20}
              >
                {mediaTypeDataPercent.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#a855f7'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
