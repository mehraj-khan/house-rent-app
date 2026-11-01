/* eslint-disable */
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// پاکستانی شہروں کے بنیادی کوآرڈینیٹس
const cityCoordinates = {
  lahore: [31.5204, 74.3587],
  karachi: [24.8607, 67.0011],
  islamabad: [33.6844, 73.0479],
  rawalpindi: [33.5651, 73.0169],
  murree: [33.9070, 73.3943],
  peshawar: [34.0151, 71.5249],
  multan: [30.1575, 71.5249],
  faisalabad: [31.4504, 73.1350],
  quetta: [30.1798, 66.9750],
  swat: [35.2227, 72.4258],
  nathia: [34.0667, 73.3833],
};

const MapView = ({ houses }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // پہلے سے موجود نقشہ صاف کریں تاکہ اوورلیپ نہ ہو
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // پاکستان پر سینٹرڈ نقشہ شروع کریں
    const map = L.map(mapContainerRef.current).setView([31.5204, 74.3587], 6);
    mapInstanceRef.current = map;

    // 100% مفت OpenStreetMap ٹائلز
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // ہر گھر کے لیے Airbnb اسٹائل پرائس ٹیگ بنائیں
    houses.forEach((house, index) => {
      const cityKey = house.city ? house.city.toLowerCase().trim() : 'lahore';
      const baseCoords = cityCoordinates[cityKey] || [31.5204, 74.3587];

      // ایک ہی شہر کے مکانات ایک دوسرے پر نہ چڑھیں (ہلکا سا فاصلہ)
      const lat = baseCoords[0] + ((index % 5) - 2) * 0.02;
      const lng = baseCoords[1] + ((index % 4) - 2) * 0.02;

      // قیمت کا شارٹ فارمیٹ (مثلاً 35,000 -> 35k)
      const priceText = house.pricePerDay > 0
        ? `PKR ${Math.round(house.pricePerDay / 1000)}k`
        : `PKR ${Math.round(house.rentPrice / 1000)}k`;

      // اپنی مرضی کا گول پرائس پِن
      const customIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `<div class="airbnb-price-pin">${priceText}</div>`,
        iconSize: [80, 30],
        iconAnchor: [40, 15]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // پاپ اپ باکس
      const popupContent = document.createElement('div');
      popupContent.className = 'map-popup-card';
      popupContent.innerHTML = `
        <img src="${house.images?.[0] || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600'}" />
        <div style="padding: 8px 0 0;">
          <h4 style="font-size: 14px; margin: 0 0 4px; color: #0f172a;">${house.title}</h4>
          <p style="font-size: 12px; color: #64748b; margin: 0 0 6px;">${house.address}, ${house.city}</p>
          <div style="font-weight: bold; font-size: 14px; color: #16a34a;">
            PKR ${house.rentPrice?.toLocaleString()} / mo
          </div>
          <button id="view-btn-${house._id}" style="width: 100%; margin-top: 6px; padding: 6px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;">
            View Details
          </button>
        </div>
      `;

      popupContent.querySelector(`#view-btn-${house._id}`)?.addEventListener('click', () => {
        navigate(`/house/${house._id}`);
      });

      marker.bindPopup(popupContent);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [houses]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 200px)', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MapView;