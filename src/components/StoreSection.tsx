import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { stores } from '../data/stores';
import { translations } from '../translations';
import { MapPin, Phone, Clock, Star, Navigation, Compass, Sparkles, Check } from 'lucide-react';
import { motion } from 'motion/react';

const storeLatLngs: Record<string, [number, number]> = {
  'st-1': [21.0287, 105.8490], // Hanoi Cathedral
  'st-2': [21.0315, 105.8524], // Hoan Kiem Lake View
  'st-3': [10.7950, 106.7219], // Vinhomes Central Park HCMC
  'st-4': [37.4979, 127.0276], // Seoul Gangnam
  'st-5': [37.7876, -122.4089] // SF Union Square
};

export const StoreSection: React.FC = () => {
  const {
    language,
    savedStores,
    toggleSaveStore,
    currentStoreId,
    setCurrentStoreId,
    simulateLocationNearStore,
    activePromo
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStoreOnMap, setSelectedStoreOnMap] = useState<string | null>('st-1');
  const [simulatedStoreId, setSimulatedStoreId] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<'real' | 'geofence'>('real');
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [userGeoCoords, setUserGeoCoords] = useState<[number, number] | null>(null);

  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const userMarkerRef = useRef<any>(null);

  // Calculate distance using Haversine formula
  const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Get user's real location via Geolocation API
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserGeoCoords([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn("Geolocation permission denied or failed:", error);
        }
      );
    }
  }, []);

  // Dynamically load Leaflet assets
  useEffect(() => {
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(cssLink);

    const jsScript = document.createElement('script');
    jsScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    jsScript.onload = () => {
      setLeafletLoaded(true);
    };
    document.head.appendChild(jsScript);
  }, []);

  // Initialize and update Leaflet Map Instance
  useEffect(() => {
    if (!leafletLoaded || mapMode !== 'geofence') {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = {};
        userMarkerRef.current = null;
      }
      return;
    }

    const L = (window as any).L;
    if (!L) return;

    const initialStoreId = selectedStoreOnMap || 'st-1';
    const coords = storeLatLngs[initialStoreId] || [21.0287, 105.8490];

    const map = L.map('leaflet-map', {
      center: coords,
      zoom: 15,
      zoomControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    mapRef.current = map;

    const coffeeIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-8 h-8 rounded-full bg-[#2D5A47] text-white flex items-center justify-center shadow-lg border-2 border-white"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-coffee"><path d="M10 2h4"/><path d="M17 35a5 5 0 0 1-5 5H6a5 5 0 0 1-5-5V10h16Z"/><path d="M17 10h1a4 4 0 0 1 0 8h-1"/><path d="M2 2v2"/><path d="M6 2v2"/><path d="M14 2v2"/><path d="M18 2v2"/></svg></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const activeCoffeeIcon = L.divIcon({
      className: 'custom-div-icon-active',
      html: `<div class="w-9 h-9 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-2xl border-2 border-white scale-110"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-coffee"><path d="M10 2h4"/><path d="M17 35a5 5 0 0 1-5 5H6a5 5 0 0 1-5-5V10h16Z"/><path d="M17 10h1a4 4 0 0 1 0 8h-1"/><path d="M2 2v2"/><path d="M6 2v2"/><path d="M14 2v2"/><path d="M18 2v2"/></svg></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    stores.forEach((st) => {
      const stCoords = storeLatLngs[st.id] || [21.0287, 105.8490];
      const isSelected = st.id === selectedStoreOnMap;
      const marker = L.marker(stCoords, {
        icon: isSelected ? activeCoffeeIcon : coffeeIcon
      }).addTo(map);

      marker.bindPopup(`<b>${st.name[language]}</b><br>${st.address[language]}`);
      
      marker.on('click', () => {
        setSelectedStoreOnMap(st.id);
      });

      markersRef.current[st.id] = marker;
    });

    if (simulatedStoreId) {
      const userCoords = storeLatLngs[simulatedStoreId] || [21.0287, 105.8490];
      const offsetCoords: [number, number] = [userCoords[0] + 0.001, userCoords[1] + 0.001];

      const userIcon = L.divIcon({
        className: 'custom-user-icon',
        html: `<div class="relative flex flex-col items-center"><span class="absolute -inset-2 rounded-full bg-blue-500/30 animate-ping"></span><div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-navigation"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg></div></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const userMarker = L.marker(offsetCoords, { icon: userIcon }).addTo(map);
      userMarker.bindPopup("<b>Vị trí của bạn</b><br>Giả lập gần cửa hàng");
      userMarkerRef.current = userMarker;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = {};
        userMarkerRef.current = null;
      }
    };
  }, [leafletLoaded, mapMode, simulatedStoreId]);

  // Focus map on selected store when changed
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const L = (window as any).L;
    if (!L) return;

    const coords = storeLatLngs[selectedStoreOnMap || 'st-1'];
    if (coords) {
      map.flyTo(coords, 15, {
        animate: true,
        duration: 1.2
      });
    }

    const coffeeIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-8 h-8 rounded-full bg-[#2D5A47] text-white flex items-center justify-center shadow-lg border-2 border-white"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-coffee"><path d="M10 2h4"/><path d="M17 35a5 5 0 0 1-5 5H6a5 5 0 0 1-5-5V10h16Z"/><path d="M17 10h1a4 4 0 0 1 0 8h-1"/><path d="M2 2v2"/><path d="M6 2v2"/><path d="M14 2v2"/><path d="M18 2v2"/></svg></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const activeCoffeeIcon = L.divIcon({
      className: 'custom-div-icon-active',
      html: `<div class="w-9 h-9 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-2xl border-2 border-white scale-110"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-coffee"><path d="M10 2h4"/><path d="M17 35a5 5 0 0 1-5 5H6a5 5 0 0 1-5-5V10h16Z"/><path d="M17 10h1a4 4 0 0 1 0 8h-1"/><path d="M2 2v2"/><path d="M6 2v2"/><path d="M14 2v2"/><path d="M18 2v2"/></svg></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    Object.keys(markersRef.current).forEach((key) => {
      const marker = markersRef.current[key];
      if (key === selectedStoreOnMap) {
        marker.setIcon(activeCoffeeIcon);
        marker.openPopup();
      } else {
        marker.setIcon(coffeeIcon);
      }
    });
  }, [selectedStoreOnMap]);

  const filteredStores = stores.filter(st => 
    st.name[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
    st.address[language].toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSimulateLocation = (storeId: string) => {
    setSimulatedStoreId(storeId);
    // Update state & trigger notification
    simulateLocationNearStore(storeId);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      
      {/* LEFT COLUMN: Store List & Search */}
      <div className="lg:col-span-5 flex flex-col h-full space-y-4">
        
        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-coffee-100 shadow-xs">
          <label className="block text-[11px] font-bold text-coffee-600 uppercase tracking-wider mb-2">
            {translations[language]['store.title']}
          </label>
          <div className="relative">
            <input
              type="text"
              id="store-search-query-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={translations[language]['store.search.placeholder']}
              className="w-full bg-coffee-50/60 border border-coffee-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-coffee-600"
            />
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
          </div>
        </div>

        {/* Location simulation notification card */}
        <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
            <Compass className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
            <span>{translations[language]['store.simulate.location']}</span>
          </div>
          <p className="text-[10.5px] text-coffee-600 leading-normal">
            {translations[language]['store.simulate.desc']}
          </p>
        </div>

        {/* Stores Scroll Container */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredStores.map((st) => {
            const isFavorite = savedStores.includes(st.id);
            const isCurrent = currentStoreId === st.id;
            const isSimulating = simulatedStoreId === st.id;
            const isHighlighted = selectedStoreOnMap === st.id;

            return (
              <div
                key={st.id}
                id={`store-card-${st.id}`}
                onClick={() => setSelectedStoreOnMap(st.id)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                  isHighlighted 
                    ? 'bg-white border-coffee-900 shadow-md ring-2 ring-coffee-900/10' 
                    : 'bg-white border-coffee-100 hover:border-coffee-200 shadow-xs'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-coffee-950 flex items-center space-x-1">
                      {isCurrent && <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1 flex-shrink-0"></span>}
                      <span>{st.name[language]}</span>
                    </h4>
                    <p className="text-[11px] text-coffee-500 mt-1 leading-relaxed">
                      {st.address[language]}
                    </p>
                  </div>

                  <span className="text-[10px] font-bold font-mono text-coffee-600 bg-coffee-50 px-2 py-0.5 rounded-md flex-shrink-0">
                    {isSimulating
                      ? '0.05 km'
                      : userGeoCoords
                        ? `${calculateHaversineDistance(userGeoCoords[0], userGeoCoords[1], storeLatLngs[st.id][0], storeLatLngs[st.id][1]).toFixed(1)} km`
                        : `${st.distance.toLocaleString()} km`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10px] text-coffee-600 border-t border-coffee-50 pt-3 mt-3">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-coffee-400" />
                    <span>{st.openHours}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-coffee-400" />
                    <span>{st.phone}</span>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4 pt-3 border-t border-coffee-50">
                  {/* Set Current Favorite Store Button */}
                  <button
                    id={`btn-set-favorite-store-${st.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentStoreId(st.id);
                    }}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                      isCurrent
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                        : 'bg-coffee-50 hover:bg-coffee-100 text-coffee-700'
                    }`}
                  >
                    {isCurrent ? <Check className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                    <span>{isCurrent ? translations[language]['store.my'] : translations[language]['store.set.favorite']}</span>
                  </button>

                  {/* Geofence Simulator Button */}
                  <button
                    id={`btn-simulate-location-${st.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSimulateLocation(st.id);
                    }}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                      isSimulating
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                    }`}
                  >
                    <Navigation className={`w-3 h-3 ${isSimulating ? 'animate-pulse' : ''}`} />
                    <span>{isSimulating ? 'SIMULATED' : 'SIMULATE'}</span>
                  </button>

                  {/* Favorite Store Button */}
                  <button
                    id={`btn-toggle-save-store-${st.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveStore(st.id);
                    }}
                    className="p-1.5 rounded-lg bg-coffee-50 hover:bg-coffee-100 text-coffee-600 cursor-pointer"
                  >
                    <Star className={`w-4 h-4 ${isFavorite ? 'text-amber-500 fill-amber-500' : 'text-coffee-400'}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* RIGHT COLUMN: Interactive Visual Map Coordinates Plots */}
      <div className="lg:col-span-7 bg-white rounded-3xl border border-coffee-100 shadow-md p-6 flex flex-col justify-between overflow-hidden min-h-[420px]">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h3 className="font-serif font-bold text-base text-coffee-900 flex items-center space-x-2">
            <Compass className="w-4 h-4 text-coffee-800" />
            <span>{translations[language]['store.map.view']}</span>
          </h3>
          
          {/* Map Mode Toggle Switch */}
          <div className="flex bg-[#F3F0ED] p-1 rounded-xl text-[10.5px] font-bold border border-coffee-100/30">
            <button
              onClick={() => setMapMode('real')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1 ${
                mapMode === 'real'
                  ? 'bg-[#2D5A47] text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <span>{translations[language]['map.satellite']}</span>
            </button>
            <button
              onClick={() => setMapMode('geofence')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1 ${
                mapMode === 'geofence'
                  ? 'bg-[#2D5A47] text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <span>{translations[language]['map.heatmap']}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Map Visual Container */}
        <div className="flex-1 bg-stone-100 rounded-2xl relative border border-coffee-100 overflow-hidden shadow-inner aspect-[1.5/1]">
          {mapMode === 'real' ? (
            /* Real Google Maps Active Embed iframe for selected store */
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                (stores.find(s => s.id === selectedStoreOnMap) || stores[0]).address[language]
              )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              width="100%"
              height="100%"
              title="Mellodi GPS Live Location Map"
              className="border-0 w-full h-full rounded-2xl"
              allowFullScreen
              loading="lazy"
            ></iframe>
          ) : (
            /* Leaflet Interactive Map Container */
            <div id="leaflet-map" className="w-full h-full rounded-2xl relative z-10">
              {!leafletLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-stone-50 z-20">
                  <div className="text-center space-y-2">
                    <Compass className="w-8 h-8 text-coffee-700 animate-spin mx-auto" />
                    <p className="text-xs text-stone-500 font-bold">Đang tải bản đồ tương tác...</p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Selected Store Quick View below map */}
        {selectedStoreOnMap && (
          <div className="mt-4 p-4 bg-coffee-50/50 rounded-2xl border border-coffee-100/50 flex justify-between items-center">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-coffee-400 font-bold">Selected Branch</span>
              <h4 className="font-serif font-bold text-sm text-coffee-950 mt-0.5">
                {stores.find(s => s.id === selectedStoreOnMap)?.name[language]}
              </h4>
              <p className="text-[10.5px] text-coffee-500 leading-tight mt-1">
                {stores.find(s => s.id === selectedStoreOnMap)?.address[language]}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-coffee-700 bg-white border border-coffee-100 px-2.5 py-1.5 rounded-xl inline-block shadow-2xs">
                {stores.find(s => s.id === selectedStoreOnMap)?.openHours}
              </span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
