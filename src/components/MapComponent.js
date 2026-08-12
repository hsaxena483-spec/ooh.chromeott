'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Image as ImageIcon } from 'lucide-react';

// Custom colored SVG pin markers: Crimson Red teardrop for Dalmia, Sleek Silver Dot for competitors
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

const getBrandLogoSVG = (brandName, size = 16) => {
  if (!brandName) return null;
  const normalized = String(brandName).toLowerCase().trim();
  
  if (normalized.includes('dalmia')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={size} height={size} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <g transform="translate(50, 50)">
          <path d="M 0 0 C 0 -15, -15 -35, 0 -45 C 15 -35, 25 -15, 0 0 Z" fill="#1e40af" transform="rotate(0)" />
          <path d="M 0 0 C 0 -15, -15 -35, 0 -45 C 15 -35, 25 -15, 0 0 Z" fill="#f97316" transform="rotate(120)" />
          <path d="M 0 0 C 0 -15, -15 -35, 0 -45 C 15 -35, 25 -15, 0 0 Z" fill="#10b981" transform="rotate(240)" />
          <circle cx="0" cy="0" r="5" fill="#ffffff" />
        </g>
      </svg>
    );
  }
  if (normalized.includes('ultratech')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={size} height={size} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <path d="M 15 20 L 85 20 L 70 80 L 30 80 Z" fill="#f59e0b" />
        <path d="M 35 35 L 75 35 L 65 65 L 45 65 Z" fill="#151724" />
      </svg>
    );
  }
  if (normalized.includes('ambuja')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={size} height={size} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <path d="M 50 10 L 90 45 L 75 90 L 25 90 L 10 45 Z" fill="#10b981" />
        <path d="M 50 25 L 75 50 L 65 80 L 35 80 L 25 50 Z" fill="#ffffff" />
      </svg>
    );
  }
  if (normalized.includes('jsw')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={size} height={size} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <path d="M 10 80 C 30 50, 70 50, 90 20 C 70 50, 30 50, 10 80 Z" fill="#a855f7" />
        <path d="M 10 60 C 30 30, 70 30, 90 10 L 90 20 C 70 40, 30 40, 10 60 Z" fill="#c084fc" />
      </svg>
    );
  }
  if (normalized.includes('acc')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={size} height={size} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <rect x="15" y="15" width="70" height="70" rx="10" fill="#06b6d4" />
        <path d="M 30 70 L 50 30 L 70 70 Z" fill="#ffffff" />
      </svg>
    );
  }
  if (normalized.includes('jk')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={size} height={size} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <circle cx="50" cy="50" r="35" fill="none" stroke="#f97316" strokeWidth="8" />
        <circle cx="50" cy="50" r="15" fill="#f97316" />
      </svg>
    );
  }
  // Generic fallback
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={size} height={size} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <circle cx="50" cy="50" r="40" fill="#64748b" />
      <path d="M 35 50 L 45 60 L 65 40" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
};

// Custom colored SVG pin markers: Beautiful teardrop colored by brand
const getMarkerIcon = (brand) => {
  const brandLower = String(brand).toLowerCase();
  const isDalmia = brandLower.includes('dalmia');
  const color = getBrandColor(brand);
  
  const size = isDalmia ? 34 : 28;
  const svgTemplate = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" style="--brand-color-glow: ${color}e6;">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}"/>
    <circle cx="12" cy="9" r="4" fill="#ffffff"/>
    <circle cx="12" cy="9" r="1.5" fill="${color}"/>
  </svg>`;
  
  return L.divIcon({
    html: svgTemplate,
    className: `custom-leaflet-marker ${isDalmia ? 'dalmia-marker' : 'competitor-marker'}`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

// Helper component to center and animate map pan
function ChangeMapView({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.stop(); // Cancel any running animations to prevent race conditions
      map.setView(coords, 14, { animate: true, duration: 1.2 });
    }
  }, [coords, map]);
  return null;
}

// Helper component to automatically fit bounds to show all markers on load
function FitMapBounds({ campaigns }) {
  const map = useMap();
  useEffect(() => {
    console.log("FitMapBounds hook running. campaigns count:", campaigns?.length);
    if (campaigns && campaigns.length > 0) {
      const validPoints = campaigns
        .filter(c => c.latitude && c.longitude)
        .map(c => [c.latitude, c.longitude]);
      
      console.log("FitMapBounds validPoints:", validPoints);
      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        console.log("Fitting bounds to:", bounds);
        
        // Wrap in a short timeout to let CSS layouts stabilize before fitting bounds
        const timer = setTimeout(() => {
          map.invalidateSize();
          map.stop(); // Stop any pending setView animations immediately
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13, animate: false });
        }, 100);
        
        return () => clearTimeout(timer);
      }
    }
  }, [campaigns, map]);
  return null;
}

export default function MapComponent({ campaigns, selectedCampaign, onSelectCampaign, selectedBrand, onSelectBrand }) {
  console.log("MapComponent render. campaigns count:", campaigns?.length, "selectedBrand:", selectedBrand);
  const defaultCenter = [22.5726, 88.3639]; // Kolkata Center
  const defaultZoom = 11;

  const validCampaigns = campaigns.filter(c => c.latitude && c.longitude);
  console.log("MapComponent validCampaigns count:", validCampaigns?.length);


  return (
    <div className="map-container">
      <MapContainer 
        id="kolkata-campaigns-map"
        center={defaultCenter} 
        zoom={defaultZoom} 
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', borderRadius: '12px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="dark-leaflet-tiles"
        />
        
        {validCampaigns.map((c) => {
          const brandLower = String(c.brand).toLowerCase();
          const isDalmia = brandLower.includes('dalmia');
          
          return (
            <Marker 
              key={c.id} 
              position={[c.latitude, c.longitude]} 
              icon={getMarkerIcon(c.brand)}
              eventHandlers={{
                click: () => onSelectCampaign(c)
              }}
            >
              <Tooltip direction="top" offset={[0, -30]} opacity={0.95}>
                <div className="map-tooltip">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 700 }}>{c.campaign_id}</span>
                    {getBrandLogoSVG(c.brand, 18)}
                  </div>
                  <span className={isDalmia ? 'tooltip-brand-dalmia' : 'tooltip-brand-other'} style={{ marginTop: '2px' }}>
                    {isDalmia ? '★ Dalmia Spot' : 'Competitor Spot'}
                  </span>
                  <span style={{ fontWeight: 600, color: '#f8fafc', marginTop: '4px', fontSize: '12px' }}>
                    {c.brand || 'No Brand'}
                  </span>
                  {c.photo_url && (
                    <div style={{ 
                      marginTop: '8px', 
                      borderRadius: '6px', 
                      overflow: 'hidden',
                      width: '140px',
                      height: '90px',
                      border: '1px solid rgba(255, 255, 255, 0.12)'
                    }}>
                      <img 
                        src={c.photo_url} 
                        alt="Spot Preview" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          display: 'block' 
                        }} 
                      />
                    </div>
                  )}
                </div>
              </Tooltip>
              <Popup>
              <div className="popup-details">
                <div className="popup-header">
                  <span className="popup-id">{c.campaign_id}</span>
                  <span className="popup-media-badge">{c.media_type}</span>
                </div>
                
                <div className="popup-row">
                  <span className="popup-label">Brands</span>
                  <div className="popup-brands">
                    {c.brands && c.brands.length > 0 ? (
                      c.brands
                        .filter(b => !selectedBrand || selectedBrand === 'All' || b === selectedBrand)
                        .map((b, i) => (
                          <span 
                            key={i} 
                            className="brand-tag"
                            onClick={() => onSelectBrand && onSelectBrand(b)}
                            style={{ 
                              cursor: onSelectBrand ? 'pointer' : 'default',
                              background: `${getBrandColor(b)}24`,
                              borderColor: `${getBrandColor(b)}4d`,
                              color: getBrandColor(b)
                            }}
                          >{b}</span>
                        ))
                    ) : (
                      <span 
                        className="brand-tag"
                        style={{
                          background: `${getBrandColor(c.brand)}24`,
                          borderColor: `${getBrandColor(c.brand)}4d`,
                          color: getBrandColor(c.brand)
                        }}
                      >{c.brand || 'No Brand'}</span>
                    )}
                  </div>
                </div>
                
                <div className="popup-row">
                  <span className="popup-label">Location</span>
                  <span className="popup-value">{c.location}</span>
                </div>
                
                {c.road_name && c.road_name !== '-' && (
                  <div className="popup-row">
                    <span className="popup-label">Road Name</span>
                    <span className="popup-value">{c.road_name}</span>
                  </div>
                )}
                
                <div className="popup-image-mockup">
                  <span>
                    <ImageIcon size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> 
                    Branding Spot Photo
                  </span>
                </div>

                {c.photo_url && (
                  <a 
                    href={c.photo_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="popup-action-btn"
                  >
                    View Photo on Google Maps
                  </a>
                )}
              </div>
            </Popup>
            </Marker>
          );
        })}

        {selectedCampaign && selectedCampaign.latitude && selectedCampaign.longitude && (
          <ChangeMapView coords={[selectedCampaign.latitude, selectedCampaign.longitude]} />
        )}
        <FitMapBounds campaigns={campaigns} />
      </MapContainer>
    </div>
  );
}
