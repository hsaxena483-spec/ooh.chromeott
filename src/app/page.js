'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  ChevronRight,
  X,
  ExternalLink,
  Maximize2,
  LogOut
} from 'lucide-react';
import ChartsComponent from '../components/ChartsComponent';
import SkeletonLoader from '../components/SkeletonLoader';
import MultiSelect from '../components/MultiSelect';

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

export default function DashboardPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [logoutHover, setLogoutHover] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Filter and Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedBrands, setSelectedBrands] = useState([]); // Empty array means 'All'
  const [selectedMediaType, setSelectedMediaType] = useState('All');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);

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
    if (!localStorage.getItem('token')) {
      router.push('/login');
    } else {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      fetchData();
    }
  }, [router]);


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
    const matchesBrand = selectedBrands.length === 0 || 
      (item.brands && item.brands.some(b => selectedBrands.includes(b))) || 
      (!item.brands && selectedBrands.includes(item.brand));
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
            {/* Premium Chrome OOH Logo and Brand Text */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              background: 'rgba(255, 255, 255, 0.03)', 
              padding: '8px 14px', 
              borderRadius: '12px', 
              border: '1px solid rgba(255, 255, 255, 0.06)',
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.05)'
            }}>
              <img 
                src="/logo.png" 
                alt="Chrome OOH Logo" 
                style={{ 
                  height: '34px', 
                  width: '34px', 
                  objectFit: 'contain' 
                }} 
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.8px', lineHeight: 1.1, textTransform: 'uppercase' }}>
                  Chromedm
                </span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#e21b5a', letterSpacing: '1.5px', textTransform: 'uppercase', lineHeight: 1 }}>
                  cott
                </span>
              </div>
            </div>
            
            <div className="header-title-section">
              <h1>Brand & OOH Campaign Dashboard</h1>
              <p>Real-time campaign monitoring, OOH locations mapping, and brand presence analytics for Kolkata City</p>
            </div>
          </div>

          {/* User Profile and Logout */}
          {user && (() => {
            const displayName = user.name.includes('(') 
              ? user.name.match(/\(([^)]+)\)/)[1] 
              : user.name;
            return (
              <div style={{ position: 'relative' }}>
                {/* Profile Trigger Card */}
                <div 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    background: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(12px)',
                    padding: '5px 14px 5px 6px', 
                    borderRadius: '24px', 
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.85)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.65)';
                  }}
                >
                  {user.picture && !imgError ? (
                    <img 
                      src={user.picture} 
                      alt="User Profile" 
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                      style={{ 
                        width: '26px', 
                        height: '26px', 
                        borderRadius: '50%', 
                        objectFit: 'cover',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 0 6px rgba(255, 255, 255, 0.1)'
                      }} 
                    />
                  ) : (
                    <div style={{ 
                      width: '26px', 
                      height: '26px', 
                      borderRadius: '50%', 
                      backgroundColor: '#e21b5a', 
                      color: '#ffffff', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '11px', 
                      fontWeight: 'bold',
                      boxShadow: '0 0 6px rgba(226, 27, 90, 0.3)'
                    }}>
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span style={{ 
                    fontSize: '13px', 
                    color: '#f8fafc', 
                    fontWeight: 600,
                    letterSpacing: '0.1px'
                  }}>
                    {displayName}
                  </span>
                  <span style={{ 
                    fontSize: '9px', 
                    color: '#94a3b8', 
                    transition: 'transform 0.2s ease',
                    transform: profileDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    marginLeft: '2px'
                  }}>
                    ▼
                  </span>
                </div>

                {/* Click backdrop to close */}
                {profileDropdownOpen && (
                  <div 
                    onClick={() => setProfileDropdownOpen(false)}
                    style={{ 
                      position: 'fixed', 
                      top: 0, 
                      left: 0, 
                      right: 0, 
                      bottom: 0, 
                      zIndex: 99,
                      background: 'transparent'
                    }} 
                  />
                )}

                {/* Floating Dropdown Card */}
                {profileDropdownOpen && (
                  <div style={{ 
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '220px',
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    zIndex: 100
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 4px' }}>
                      <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Logged in as
                      </span>
                      <span style={{ fontSize: '12px', color: '#cbd5e1', wordBreak: 'break-all', fontWeight: 500 }}>
                        {user.email}
                      </span>
                    </div>

                    <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)', margin: '2px 0' }} />

                    <button
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        router.push('/login');
                      }}
                      onMouseEnter={() => setLogoutHover(true)}
                      onMouseLeave={() => setLogoutHover(false)}
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: logoutHover ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                        border: 'none',
                        color: logoutHover ? '#ef4444' : '#94a3b8',
                        padding: '8px 10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        width: '100%',
                        textAlign: 'left'
                      }}
                    >
                      <LogOut size={13} />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
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
          <div style={{ minWidth: '180px' }}>
            <MultiSelect 
              options={stats?.brands || []}
              selectedValues={selectedBrands}
              onChange={(vals) => { setSelectedBrands(vals); setCurrentPage(1); }}
            />
          </div>

          {/* Media Type Filter */}
          <select 
            className="filter-select"
            value={selectedMediaType}
            onChange={(e) => { setSelectedMediaType(e.target.value); setCurrentPage(1); }}
            style={{ padding: '8px 12px' }}
          >
            <option value="All">All Media Types</option>
            {stats && Object.keys(stats.media_type_counts)
              .filter(mtype => mtype && mtype.trim() !== '-' && mtype.trim() !== '')
              .sort()
              .map((mtype) => (
                <option key={mtype} value={mtype}>{mtype}</option>
              ))
            }
          </select>
          
          {/* Reset Filters button */}
          {(selectedArea !== 'All' || selectedBrands.length > 0 || selectedMediaType !== 'All' || searchQuery !== '') && (
            <button 
              className="pagination-btn"
              onClick={() => {
                setSelectedArea('All');
                setSelectedBrands([]);
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
              selectedBrand={selectedBrands.length === 1 ? selectedBrands[0] : 'All'}
              onSelectBrand={(b) => {
                if (b === 'All') {
                  setSelectedBrands([]);
                } else {
                  setSelectedBrands([b]);
                }
              }}
            />
          </div>
        </div>

        {/* Right Side: Active Spots List */}
        <div className="section-card">
          <div className="section-card-title">
            <h2><MapPin size={18} /> Active Spot List</h2>
            {selectedBrands.length > 0 && (
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
            
            <div style={{ flex: 1, minWidth: '150px' }}>
              <MultiSelect 
                options={stats?.brands || []}
                selectedValues={selectedBrands}
                onChange={(vals) => { setSelectedBrands(vals); setCurrentPage(1); }}
              />
            </div>
          </div>

          {selectedBrands.length === 0 ? (
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
                        .filter(b => selectedBrands.length === 0 || selectedBrands.includes(b))
                        .map((b, i) => (
                          <span 
                            key={i} 
                            className="brand-tag" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBrands([b]);
                            }}
                            style={{
                              fontSize: '9px',
                              padding: '1px 4px',
                              background: `${getBrandColor(b)}24`,
                              borderColor: `${getBrandColor(b)}4d`,
                              color: getBrandColor(b),
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
      {stats && <ChartsComponent stats={stats} campaigns={campaigns} />}

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(5, 6, 12, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px'
        }} onClick={() => setSelectedCampaign(null)}>
          <div style={{
            background: '#0f111a',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Campaign Spot Details
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', margin: '2px 0 0 0' }}>
                  {selectedCampaign.campaign_id}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedCampaign(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#94a3b8',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '0' }}>
              {/* Left Side: Photo */}
              <div style={{
                flex: '1 1 350px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRight: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                {selectedCampaign.photo_url ? (
                  <div 
                    style={{
                      position: 'relative',
                      width: '100%',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
                      cursor: 'zoom-in'
                    }}
                    onClick={() => setFullscreenImage(selectedCampaign.photo_url)}
                  >
                    <img 
                      src={selectedCampaign.photo_url} 
                      alt="Campaign Spot Close View" 
                      style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '400px', objectFit: 'contain' }}
                    />
                    {/* Floating Full View button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFullscreenImage(selectedCampaign.photo_url);
                      }}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(15, 17, 26, 0.75)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        color: '#f8fafc',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        outline: 'none',
                        zIndex: 10
                      }}
                    >
                      <Maximize2 size={12} /> Full View
                    </button>
                  </div>
                ) : (
                  <div style={{
                    width: '100%',
                    height: '240px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px dashed rgba(255, 255, 255, 0.1)',
                    color: '#64748b'
                  }}>
                    <MapPin size={32} style={{ marginBottom: '8px' }} />
                    <span style={{ fontSize: '13px' }}>No photo available for this spot</span>
                  </div>
                )}
              </div>

              {/* Right Side: Details Info */}
              <div style={{
                flex: '1 1 300px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Brands</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {selectedCampaign.brands && selectedCampaign.brands.length > 0 ? (
                      selectedCampaign.brands.map((b, i) => {
                        const color = getBrandColor(b);
                        const isDalmiaBrand = b.toLowerCase().includes('dalmia');
                        return (
                          <span 
                            key={i} 
                            style={{ 
                              fontSize: '11px', 
                              fontWeight: 700, 
                              color: color, 
                              background: `rgba(${isDalmiaBrand ? '30, 64, 175' : '100, 116, 139'}, 0.1)`, 
                              border: `1px solid ${color}`, 
                              padding: '3px 8px', 
                              borderRadius: '6px' 
                            }}
                          >
                            {b}
                          </span>
                        );
                      })
                    ) : (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#e2e8f0', background: 'rgba(255, 255, 255, 0.05)', padding: '3px 8px', borderRadius: '6px' }}>
                        {selectedCampaign.brand || 'No Brand'}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>City / Hub</label>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0', margin: '4px 0 0 0' }}>
                      {selectedCampaign.city || 'Kolkata City'}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Area / Locality</label>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0', margin: '4px 0 0 0' }}>
                      {selectedCampaign.area || 'Unknown'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Format / Media Type</label>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0', margin: '4px 0 0 0' }}>
                      {selectedCampaign.media_type || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Road Name</label>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0', margin: '4px 0 0 0' }}>
                      {selectedCampaign.road_name && selectedCampaign.road_name !== '-' ? selectedCampaign.road_name : 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Exact Address / Location</label>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#cbd5e1', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                    {selectedCampaign.location || 'No address location provided'}
                  </p>
                </div>

                {selectedCampaign.latitude && selectedCampaign.longitude && (
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Coordinates</label>
                    <p style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8', margin: '4px 0 0 0' }}>
                      {selectedCampaign.latitude}, {selectedCampaign.longitude}
                    </p>
                  </div>
                )}

                {selectedCampaign.map_link && (
                  <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                    <a 
                      href={selectedCampaign.map_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#3b82f6',
                        color: 'white',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '13px',
                        textDecoration: 'none',
                        transition: 'background 0.2s'
                      }}
                    >
                      <ExternalLink size={14} /> Open in Google Maps
                    </a>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Fullscreen Image Lightbox Modal */}
      {fullscreenImage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(2, 3, 6, 0.95)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          cursor: 'zoom-out'
        }} onClick={() => setFullscreenImage(null)}>
          
          {/* Close button */}
          <button 
            onClick={() => setFullscreenImage(null)}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              zIndex: 10001,
              outline: 'none'
            }}
          >
            <X size={20} />
          </button>
          
          {/* Main Fullscreen Image */}
          <div style={{
            maxWidth: '95%',
            maxHeight: '95%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'default'
          }} onClick={(e) => e.stopPropagation()}>
            <img 
              src={fullscreenImage} 
              alt="Fullscreen Campaign View" 
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
