'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  MapPin, 
  Layers, 
  TrendingUp, 
  Compass, 
  Search, 
  FileText, 
  RefreshCw, 
  SlidersHorizontal,
  Map as MapIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import ChartsComponent from '../components/ChartsComponent';
import SkeletonLoader from '../components/SkeletonLoader';

// Dynamically load MapComponent with SSR disabled since Leaflet relies on the 'window' object
const MapComponent = dynamic(
  () => import('../components/MapComponent'),
  { 
    ssr: false, 
    loading: () => (
      <div style={{ 
        width: '100%', 
        height: '480px', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'rgba(255, 255, 255, 0.02)',
        color: '#94a3b8',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <RefreshCw className="animate-spin" style={{ marginBottom: '12px' }} />
        <span>Initializing Leaflet Map Coordinates...</span>
      </div>
    ) 
  }
);

const API_BASE_URL = '';

const BrandPlaceholder = ({ title, description, icon: Icon }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 24px',
    textAlign: 'center',
    height: '100%',
    width: '100%',
    minHeight: '380px',
    background: 'rgba(255, 255, 255, 0.01)',
    borderRadius: '12px',
    border: '1px dashed rgba(255, 255, 255, 0.08)'
  }}>
    <div style={{
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      background: 'rgba(59, 130, 246, 0.05)',
      border: '1px solid rgba(59, 130, 246, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '20px',
      color: '#3b82f6'
    }}>
      <Icon size={28} />
    </div>
    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>{title}</h3>
    <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '320px', lineHeight: 1.5 }}>{description}</p>
  </div>
);

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filter and Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedMediaType, setSelectedMediaType] = useState('All');
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Table pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [campaignsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/campaigns`),
        fetch(`${API_BASE_URL}/api/campaigns/stats`)
      ]);

      if (!campaignsRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch data from API');
      }

      const campaignsData = await campaignsRes.json();
      const statsData = await statsRes.json();

      setCampaigns(campaignsData);
      setStats(statsData);
      
    } catch (err) {
      console.error(err);
      setError('Could not connect to the database. Ensure database connection string is configured correctly.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Filter campaigns logic
  const filteredCampaigns = campaigns.filter(item => {
    const matchesSearch = 
      item.campaign_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.road_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesArea = selectedArea === 'All' || item.area === selectedArea;
    const matchesBrand = selectedBrand === 'All' || (item.brands && item.brands.includes(selectedBrand)) || (!item.brands && item.brand === selectedBrand);
    const matchesMediaType = selectedMediaType === 'All' || item.media_type === selectedMediaType;

    return matchesSearch && matchesArea && matchesBrand && matchesMediaType;
  });

  // Reset selected campaign if it is no longer in the filtered list
  useEffect(() => {
    if (selectedCampaign && !filteredCampaigns.some(c => c.id === selectedCampaign.id)) {
      setSelectedCampaign(null);
    }
  }, [filteredCampaigns, selectedCampaign]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCampaigns.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSelectCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    // Smooth scroll map into view on mobile
    const mapEl = document.getElementById('map-view-section');
    if (mapEl && window.innerWidth < 768) {
      mapEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#06070d',
        color: '#f8fafc',
        fontFamily: 'Outfit, sans-serif',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '500px'
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#ef4444' }}>Backend Connection Error</h2>
          <p style={{ color: '#94a3b8', margin: '16px 0', fontSize: '15px', lineHeight: 1.6 }}>{error}</p>
          <button 
            onClick={handleRefresh}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '16px' }}>
          <div className="header-title-section">
            <h1>Dalmia Brand & OOH Campaign Dashboard</h1>
            <p>Real-time campaign monitoring, OOH locations mapping, and brand presence analytics for Kolkata</p>
          </div>
        </div>

        {/* Integrated Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', flexWrap: 'wrap', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>
            <SlidersHorizontal size={14} /> Filter Spots:
          </div>
          
          {/* Area Filter */}
          <select 
            className="filter-select"
            value={selectedArea}
            onChange={(e) => { setSelectedArea(e.target.value); setCurrentPage(1); }}
            style={{ padding: '8px 12px' }}
          >
            <option value="All">All Areas ({stats?.total_areas})</option>
            {stats?.areas.sort().map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>

          {/* Brand Filter */}
          <select 
            className="filter-select"
            value={selectedBrand}
            onChange={(e) => { setSelectedBrand(e.target.value); setCurrentPage(1); }}
            style={{ padding: '8px 12px' }}
          >
            <option value="All">All Brands ({stats?.total_brands})</option>
            {stats?.brands.sort().map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>

          {/* Media Type Filter */}
          <select 
            className="filter-select"
            value={selectedMediaType}
            onChange={(e) => { setSelectedMediaType(e.target.value); setCurrentPage(1); }}
            style={{ padding: '8px 12px' }}
          >
            <option value="All">All Media Types</option>
            {stats && Object.keys(stats.media_type_counts).sort().map((mtype) => (
              <option key={mtype} value={mtype}>{mtype}</option>
            ))}
          </select>
          
          {/* Reset Filters button */}
          {(selectedArea !== 'All' || selectedBrand !== 'All' || selectedMediaType !== 'All' || searchQuery !== '') && (
            <button 
              className="pagination-btn"
              onClick={() => {
                setSelectedArea('All');
                setSelectedBrand('All');
                setSelectedMediaType('All');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              style={{ fontSize: '13px', padding: '8px 14px' }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </header>

      {/* Metrics Row */}
      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrapper">
            <MapPin size={24} />
          </div>
          <div className="metric-info">
            <h3>Total Branding Spots</h3>
            <div className="metric-value">{stats?.total_spots || 0}</div>
          </div>
        </div>
        <div className="metric-card color-2">
          <div className="metric-icon-wrapper">
            <TrendingUp size={24} />
          </div>
          <div className="metric-info">
            <h3>Monitored Brands</h3>
            <div className="metric-value">{stats?.total_brands || 0}</div>
          </div>
        </div>
        <div className="metric-card color-3">
          <div className="metric-icon-wrapper">
            <Compass size={24} />
          </div>
          <div className="metric-info">
            <h3>Active Areas / Hubs</h3>
            <div className="metric-value">{stats?.total_areas || 0}</div>
          </div>
        </div>
        <div className="metric-card color-4">
          <div className="metric-icon-wrapper">
            <Layers size={24} />
          </div>
          <div className="metric-info">
            <h3>Branding Formats</h3>
            <div className="metric-value">
              {stats?.media_type_counts ? Object.keys(stats.media_type_counts).length : 0}
            </div>
          </div>
        </div>
      </section>

      {/* Map Section & Active Spots List Split */}
      <section className="dashboard-main-section" id="map-view-section">
        {/* Left Side: Leaflet Map */}
        <div className="section-card">
          <div className="section-card-title">
            <h2><MapIcon size={18} /> OOH Spot Locations Map</h2>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Click pins for brands and photo links</span>
          </div>
          <div className="map-wrapper">
            <MapComponent 
              campaigns={filteredCampaigns} 
              selectedCampaign={selectedCampaign}
              onSelectCampaign={handleSelectCampaign}
              selectedBrand={selectedBrand}
              onSelectBrand={setSelectedBrand}
            />
          </div>
        </div>

        {/* Right Side: Active Spots List */}
        <div className="section-card">
          <div className="section-card-title">
            <h2><MapPin size={18} /> Active Spot List</h2>
            {selectedBrand !== 'All' && (
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Showing {filteredCampaigns.length} Spots</span>
            )}
          </div>
          
          {/* Quick search & Brand filter inside sidebar (Always Visible) */}
          <div className="sidebar-search-row">
            <div className="search-input-wrapper" style={{ flex: 1.5, position: 'relative' }}>
              <Search className="search-icon" />
              <input 
                type="text" 
                placeholder="Search spots..." 
                className="search-input" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', paddingLeft: '36px' }}
              />
            </div>
            
            <select 
              className="filter-select"
              value={selectedBrand}
              onChange={(e) => { setSelectedBrand(e.target.value); setCurrentPage(1); }}
              style={{ 
                flex: 1, 
                padding: '10px 12px', 
                background: 'rgba(255, 255, 255, 0.04)', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer',
                minWidth: '120px'
              }}
            >
              <option value="All">All Brands</option>
              {stats?.brands.sort().map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {selectedBrand === 'All' ? (
            <BrandPlaceholder 
              title="No Brand Selected" 
              description="Select a brand from the dropdown above to view its active campaign spots." 
              icon={MapPin} 
            />
          ) : (
            <div className="sidebar-list">
              {filteredCampaigns.length > 0 ? (
                filteredCampaigns.map((c) => (
                  <div 
                    key={c.id} 
                    className={`sidebar-item ${selectedCampaign?.id === c.id ? 'selected' : ''}`}
                    onClick={() => handleSelectCampaign(c)}
                  >
                    <div className="sidebar-item-header">
                      <span className="sidebar-item-id">{c.campaign_id}</span>
                      <span className="sidebar-item-type">{c.media_type}</span>
                    </div>
                    <div className="sidebar-item-loc">{c.location}</div>
                    <div className="sidebar-item-brands">
                      {c.brands && c.brands
                        .filter(b => selectedBrand === 'All' || b === selectedBrand)
                        .map((b, i) => (
                          <span 
                            key={i} 
                            className="brand-tag" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBrand(b);
                            }}
                            style={{
                              fontSize: '9px',
                              padding: '1px 4px',
                              background: b.includes('Dalmia') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                              borderColor: b.includes('Dalmia') ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)',
                              color: b.includes('Dalmia') ? '#f87171' : '#60a5fa',
                              cursor: 'pointer'
                            }}
                          >{b}</span>
                        ))
                      }
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>No spots match filters</div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Analytics Charts */}
      {stats && <ChartsComponent stats={stats} />}


    </div>
  );
}
