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
  'Dalmia Bharat Cement': '#1e40af',   // Deep Navy Blue
  'Dalmia Cement': '#1e40af',          // Deep Navy Blue
  'JK Cement': '#f97316',              // Orange
  'JSW Cement': '#a855f7',             // Purple
  'Ambuja Cement': '#10b981',          // Emerald Green
  'Adani Ambuja Cement': '#10b981',    // Emerald Green
  'ACC Cement': '#06b6d4',             // Cyan
  'Adani ACC Cement': '#06b6d4',       // Cyan
  'Ultratech Cement': '#f59e0b',       // Amber/Gold
  'Nuvoco Cement': '#ec4899',          // Pink
  'Rashmi Cement': '#14b8a6',          // Teal
  'Ramco': '#6366f1',                  // Indigo
  'Other': '#64748b',                  // Slate
};

const getBrandColor = (brandName) => {
  if (!brandName) return BRAND_COLORS['Other'];
  const normalized = String(brandName).toLowerCase().trim();
  
  if (normalized.includes('dalmia')) return BRAND_COLORS['Dalmia Bharat Cement'];
  if (normalized.includes('jsw')) return BRAND_COLORS['JSW Cement'];
  if (normalized.includes('jk')) return BRAND_COLORS['JK Cement'];
  if (normalized.includes('ambuja')) return BRAND_COLORS['Ambuja Cement'];
  if (normalized.includes('acc')) return BRAND_COLORS['ACC Cement'];
  if (normalized.includes('ultratech')) return BRAND_COLORS['Ultratech Cement'];
  if (normalized.includes('nuvoco')) return BRAND_COLORS['Nuvoco Cement'];
  if (normalized.includes('rashmi')) return BRAND_COLORS['Rashmi Cement'];
  if (normalized.includes('ramco')) return BRAND_COLORS['Ramco'];
  
  for (const [key, color] of Object.entries(BRAND_COLORS)) {
    if (key.toLowerCase() === normalized) return color;
  }
  
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
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
    
    // Check if this is the "Other" segment of the Pie chart
    const pieEntry = payload[0];
    const isOtherPieSegment = pieEntry && pieEntry.name === 'Other' && pieEntry.payload && pieEntry.payload.otherBrands;
    const isMediaShareBar = pieEntry && pieEntry.payload && pieEntry.payload.brandBreakdown;
    
    return (
      <div style={{
        background: 'rgba(15, 17, 28, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        padding: '12px',
        borderRadius: '8px',
        color: '#f8fafc',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
        maxHeight: '300px',
        overflowY: 'auto',
        minWidth: '240px'
      }}>
        <p style={{ fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '4px' }}>
          {label || pieEntry.name} {totalSpots !== null ? `(Total: ${totalSpots} Spots)` : ''}
        </p>
        
        {isOtherPieSegment ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}>
              Breakdown of {pieEntry.value} competitor spots:
            </p>
            {pieEntry.payload.otherBrands.map((b, i) => (
              <div key={i} style={{ fontSize: '11px', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', gap: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.02)', paddingBottom: '2px' }}>
                <span>{b.name}</span>
                <span style={{ fontWeight: 700, color: '#3b82f6' }}>{b.value} {b.value === 1 ? 'spot' : 'spots'}</span>
              </div>
            ))}
          </div>
        ) : isMediaShareBar ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}>
              Format Share: {pieEntry.value}% of all OOH spots
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: '6px' }}>
              <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginBottom: '2px' }}>
                Brand breakdown for this format:
              </p>
              {pieEntry.payload.brandBreakdown.map((b, i) => {
                const brandPct = pieEntry.payload.rawCount > 0 ? ((b.value / pieEntry.payload.rawCount) * 100).toFixed(1) : 0;
                const color = getBrandColor(b.name);
                return (
                  <div key={i} style={{ fontSize: '11px', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', gap: '16px', padding: '2px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.02)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: color }}></span>
                      {b.name}
                    </span>
                    <span style={{ fontWeight: 700 }}>
                      {brandPct}% <span style={{ color: '#94a3b8', fontWeight: 400 }}>({b.value} {b.value === 1 ? 'spot' : 'spots'})</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          payload.map((entry, index) => {
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
          })
        )}
      </div>
    );
  }
  return null;
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  // Show all segment labels except absolute zero values
  if (percent <= 0) return null;
  
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 18;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  return (
    <text 
      x={x} 
      y={y} 
      fill="#cbd5e1" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize="9"
      fontWeight="600"
      fontFamily="Outfit, sans-serif"
    >
      {`${name} (${(percent * 100).toFixed(1)}%)`}
    </text>
  );
};

const renderCustomizedLabelLine = (props) => {
  if (props.percent <= 0) return null;
  const { points } = props;
  if (!points || points.length < 2) return null;
  
  return (
    <polyline
      points={`${points[0].x},${points[0].y} ${points[1].x},${points[1].y}`}
      stroke="rgba(255, 255, 255, 0.25)"
      strokeWidth={1.2}
      fill="none"
    />
  );
};

export default function ChartsComponent({ stats, campaigns }) {
  if (!stats) return <div style={{ color: '#94a3b8' }}>Loading charts...</div>;

  // Group brand counts by media type dynamically for the media formats breakdown
  const mediaTypeBrandCounts = {};
  (campaigns || []).forEach(c => {
    const mediaTypeRaw = c.media_type || 'Unknown';
    const mediaTypes = mediaTypeRaw !== 'Unknown' 
      ? mediaTypeRaw.split(',').map(m => m.strip ? m.strip() : m.trim()).filter(m => m) 
      : ['Unknown'];
    
    mediaTypes.forEach(mediaType => {
      if (!mediaTypeBrandCounts[mediaType]) {
        mediaTypeBrandCounts[mediaType] = {};
      }
      const brands = c.brands && c.brands.length > 0 ? c.brands : [c.brand || 'No Brand'];
      brands.forEach(b => {
        if (!mediaTypeBrandCounts[mediaType][b]) {
          mediaTypeBrandCounts[mediaType][b] = 0;
        }
        mediaTypeBrandCounts[mediaType][b]++;
      });
    });
  });

  // 1. Area wise Brand Count Stacked Bar Chart (Absolute heights, percentage in tooltips)
  const areaDataRaw = (stats.area_brand_counts || []).slice(0, 12);
  const allBrands = stats.brands || [];

  // 2. Brand Shares Donut Chart (Group small competitor brands into "Other" to prevent text overlap)
  const rawBrandShares = Object.entries(stats.brand_counts || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const topBrandsLimit = 5;
  let brandShareData = [];
  if (rawBrandShares.length > topBrandsLimit + 1) {
    brandShareData = rawBrandShares.slice(0, topBrandsLimit);
    const otherBrandsList = rawBrandShares.slice(topBrandsLimit);
    const otherSum = otherBrandsList.reduce((sum, item) => sum + item.value, 0);
    brandShareData.push({ name: 'Other', value: otherSum, otherBrands: otherBrandsList });
  } else {
    brandShareData = rawBrandShares;
  }

  // 3. Media Type Counts in Percentage Form (Filter out invalid '-' or empty formats)
  const mediaTypeDataRaw = Object.entries(stats.media_type_counts || {})
    .filter(([name]) => name && name.trim() !== '-' && name.trim() !== '')
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
    
  const totalMedia = mediaTypeDataRaw.reduce((acc, curr) => acc + curr.value, 0);
  const mediaTypeDataPercent = mediaTypeDataRaw.map(item => {
    const mediaType = item.name;
    const brandCountsForType = mediaTypeBrandCounts[mediaType] || {};
    const sortedBrands = Object.entries(brandCountsForType)
      .map(([brandName, count]) => ({ name: brandName, value: count }))
      .sort((a, b) => b.value - a.value);

    return {
      name: item.name,
      value: totalMedia > 0 ? parseFloat(((item.value / totalMedia) * 100).toFixed(1)) : 0,
      rawCount: item.value,
      brandBreakdown: sortedBrands
    };
  });

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
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                label={renderCustomizedLabel}
                labelLine={renderCustomizedLabelLine}
              >
                {brandShareData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBrandColor(entry.name)} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
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
