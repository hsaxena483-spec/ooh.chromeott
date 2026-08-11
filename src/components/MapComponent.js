'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Image as ImageIcon } from 'lucide-react';

// Custom colored SVG pin markers: Crimson Red teardrop for Dalmia, Sleek Silver Dot for competitors
const getMarkerIcon = (brand) => {
  const brandLower = String(brand).toLowerCase();
  const isDalmia = brandLower.includes('dalmia');
  
  if (isDalmia) {
    // Premium Crimson Red teardrop pin with a solid white inner core and red center dot
    const svgTemplate = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="34" height="34">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#dc2626"/>
      <circle cx="12" cy="9" r="4" fill="#ffffff"/>
      <circle cx="12" cy="9" r="1.5" fill="#dc2626"/>
    </svg>`;
    
    return L.divIcon({
      html: svgTemplate,
      className: 'custom-leaflet-marker dalmia-marker',
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34],
    });
  } else {
    // Clean, visible silver dot with a white outline for competitors
    const svgTemplate = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
      <circle cx="12" cy="12" r="8" fill="#475569" stroke="#ffffff" stroke-width="2" />
      <circle cx="12" cy="12" r="3.5" fill="#cbd5e1" />
    </svg>`;
    
    return L.divIcon({
      html: svgTemplate,
      className: 'custom-leaflet-marker competitor-marker',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
      popupAnchor: [0, -9],
    });
  }
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

  // Clean up any stale Leaflet map references on the container during HMR hot reloads
  if (typeof window !== 'undefined') {
    const container = document.getElementById('kolkata-campaigns-map');
    if (container) {
      container._leaflet_id = null;
    }
  }

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
                  <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 700 }}>{c.campaign_id}</span>
                  <span className={isDalmia ? 'tooltip-brand-dalmia' : 'tooltip-brand-other'}>
                    {isDalmia ? '★ Dalmia Spot' : 'Competitor Spot'}
                  </span>
                  <span style={{ fontWeight: 500, color: '#f8fafc', marginTop: '2px' }}>
                    {c.brand || 'No Brand'}
                  </span>
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
                            style={{ cursor: onSelectBrand ? 'pointer' : 'default' }}
                          >{b}</span>
                        ))
                    ) : (
                      <span className="brand-tag">{c.brand || 'No Brand'}</span>
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
