import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="dashboard-container">
      {/* Header Skeleton */}
      <header className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '16px' }}>
          <div className="header-title-section" style={{ width: '100%', maxWidth: '500px' }}>
            <div className="skeleton-item" style={{ height: '28px', width: '70%', marginBottom: '10px' }}></div>
            <div className="skeleton-item" style={{ height: '16px', width: '100%' }}></div>
          </div>
        </div>
        {/* Integrated Filter Bar Skeleton */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', flexWrap: 'wrap', width: '100%' }}>
          <div className="skeleton-item" style={{ height: '16px', width: '100px' }}></div>
          <div className="skeleton-item" style={{ height: '36px', width: '160px', borderRadius: '8px' }}></div>
          <div className="skeleton-item" style={{ height: '36px', width: '160px', borderRadius: '8px' }}></div>
          <div className="skeleton-item" style={{ height: '36px', width: '160px', borderRadius: '8px' }}></div>
        </div>
      </header>

      {/* Metrics Grid Skeleton */}
      <section className="metrics-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="metric-card" style={{ display: 'flex', gap: '16px', padding: '20px' }}>
            <div className="skeleton-item" style={{ width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0 }}></div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
              <div className="skeleton-item" style={{ height: '12px', width: '60%' }}></div>
              <div className="skeleton-item" style={{ height: '24px', width: '30%' }}></div>
            </div>
          </div>
        ))}
      </section>

      {/* Map Section Split Skeleton */}
      <section className="dashboard-main-section" id="map-view-section">
        {/* Left Side: Leaflet Map Skeleton */}
        <div className="map-container-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="section-card-title" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="skeleton-item" style={{ height: '20px', width: '250px' }}></div>
            <div className="skeleton-item" style={{ height: '12px', width: '180px' }}></div>
          </div>
          <div className="skeleton-item" style={{ flex: 1, minHeight: '500px', borderRadius: '12px', marginTop: '16px' }}></div>
        </div>

        {/* Right Side: Active Spot List Skeleton */}
        <div className="spots-sidebar">
          <div className="sidebar-header" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="skeleton-item" style={{ height: '20px', width: '150px' }}></div>
            <div className="skeleton-item" style={{ height: '38px', width: '100%', borderRadius: '8px' }}></div>
          </div>
          <div className="sidebar-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="sidebar-item" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="skeleton-item" style={{ height: '14px', width: '30%' }}></div>
                  <div className="skeleton-item" style={{ height: '14px', width: '20%' }}></div>
                </div>
                <div className="skeleton-item" style={{ height: '12px', width: '80%' }}></div>
                <div className="skeleton-item" style={{ height: '10px', width: '40%' }}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Charts Grid Skeleton */}
      <div className="charts-grid">
        {/* Chart 1: Stacked Bar Chart Skeleton */}
        <div className="section-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="skeleton-item" style={{ height: '20px', width: '300px' }}></div>
          <div className="skeleton-item" style={{ height: '12px', width: '200px' }}></div>
          <div className="skeleton-item" style={{ height: '280px', width: '100%', marginTop: '12px' }}></div>
        </div>
        {/* Chart 2: Pie Chart Skeleton */}
        <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="skeleton-item" style={{ height: '20px', width: '200px' }}></div>
          <div className="skeleton-item" style={{ height: '12px', width: '150px' }}></div>
          <div className="skeleton-item" style={{ height: '280px', width: '100%', marginTop: '12px' }}></div>
        </div>
        {/* Chart 3: Media Type Chart Skeleton */}
        <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="skeleton-item" style={{ height: '20px', width: '200px' }}></div>
          <div className="skeleton-item" style={{ height: '12px', width: '150px' }}></div>
          <div className="skeleton-item" style={{ height: '280px', width: '100%', marginTop: '12px' }}></div>
        </div>
      </div>
    </div>
  );
}
