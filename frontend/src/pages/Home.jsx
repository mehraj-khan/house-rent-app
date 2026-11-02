/* eslint-disable */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, SlidersHorizontal, RotateCcw, Building2, Hotel, Home as HomeIcon, Map, List } from 'lucide-react';
import HouseCard from '../components/HouseCard.jsx';
import MapView from '../components/MapView.jsx'; // 👈 نیا نقشہ کمپوننٹ
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [houses, setHouses] = useState([]);
  const { lang } = useAuth();

  // ویو موڈ: 'grid' (لسٹ) یا 'map' (نقشہ)
  const [viewMode, setViewMode] = useState('grid');

  // فلٹرز
  const [citySearch, setCitySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maxPrice, setMaxPrice] = useState(150000);
  const [bedrooms, setBedrooms] = useState('all');
  const [suitableFor, setSuitableFor] = useState('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const fetchHouses = async () => {
    try {
      let url = `https://house-rent-app-ten.vercel.app/api/houses?city=${citySearch}&rentType=${selectedCategory}&maxPrice=${maxPrice}`;
      if (bedrooms !== 'all') url += `&bedrooms=${bedrooms}`;
      if (suitableFor !== 'all') url += `&suitableFor=${suitableFor}`;

      const res = await axios.get(url);
      setHouses(res.data.houses || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, [citySearch, selectedCategory, maxPrice, bedrooms, suitableFor]);

  const resetFilters = () => {
    setCitySearch('');
    setSelectedCategory('all');
    setMaxPrice(150000);
    setBedrooms('all');
    setSuitableFor('all');
  };

  return (
    <div>
      {/* ہیرو سیکشن */}
      <div className="hero" style={{ padding: '40px 20px', background: 'linear-gradient(135deg, #0f172a, #1e3a8a)' }}>
        <h1>{lang === 'en' ? 'Find Stays Across Pakistan' : 'پاکستان بھر میں من پسند رہائش حاصل کریں'}</h1>
        <p>{lang === 'en' ? 'Explore verified stays with interactive map view.' : 'نقشے پر قیمتوں کے ساتھ لائیو مکانات تلاش کریں۔'}</p>

        <div style={{ display: 'flex', gap: '10px', maxWidth: '750px', margin: '20px auto 0', alignItems: 'center' }}>
          <div className="search-box" style={{ flex: 1, margin: 0 }}>
            <Search color="#64748b" style={{ marginTop: '10px' }} />
            <input
              type="text"
              placeholder={lang === 'en' ? 'Search by city (e.g. Lahore, Karachi, Islamabad, Murree)...' : 'شہر کا نام سرچ کریں...'}
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
            />
          </div>

          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            style={{
              background: showFilterPanel ? '#2563eb' : '#fff',
              color: showFilterPanel ? '#fff' : '#0f172a',
              border: 'none', padding: '14px 18px', borderRadius: '12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold'
            }}
          >
            <SlidersHorizontal size={18} /> Filters
          </button>
        </div>
      </div>

      {/* کیٹیگری ٹیبز */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '15px 5%' }}>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['all', 'daily', 'monthly', 'yearly'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 18px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px',
                border: selectedCategory === cat ? '2px solid #0f172a' : '1px solid #e2e8f0',
                background: selectedCategory === cat ? '#0f172a' : '#fff',
                color: selectedCategory === cat ? '#fff' : '#475569', textTransform: 'capitalize'
              }}
            >
              {cat === 'all' ? '🌟 All Homes' : cat === 'daily' ? '🏨 Daily Stays' : cat === 'monthly' ? '🏢 Monthly' : '🏡 Yearly'}
            </button>
          ))}
        </div>

        {/* فلٹر پینل */}
        {showFilterPanel && (
          <div style={{ maxWidth: '800px', margin: '20px auto 0', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                  Max Budget: <b style={{ color: '#2563eb' }}>PKR {maxPrice.toLocaleString()}</b>
                </label>
                <input
                  type="range" min="2000" max="300000" step="2000"
                  value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '6px' }}>Bedrooms:</label>
                <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="all">Any Bedrooms</option>
                  <option value="1">1+ Bedroom</option>
                  <option value="2">2+ Bedrooms</option>
                  <option value="3">3+ Bedrooms</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '6px' }}>Preference:</label>
                <select value={suitableFor} onChange={(e) => setSuitableFor(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="all">Show All</option>
                  <option value="family">👨‍👩‍👧‍👦 Families Only</option>
                  <option value="bachelors">👤 Bachelors Allowed</option>
                </select>
              </div>
            </div>

            <div style={{ textAlign: 'end', marginTop: '12px' }}>
              <button onClick={resetFilters} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <RotateCcw size={14} /> Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* کنٹینر: گرڈ یا نقشہ */}
      <div className="container" style={{ position: 'relative', minHeight: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2>{viewMode === 'grid' ? `Available Listings (${houses.length})` : 'Interactive Map of Pakistan 🇵🇰'}</h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Verified locations</span>
        </div>

        {/* اگر گرڈ ویو سلیکٹ ہو */}
        {viewMode === 'grid' ? (
          houses.length === 0 ? (
            <div className="house-card" style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: '#64748b' }}>No properties found. Try resetting filters.</p>
              <button className="btn-secondary" onClick={resetFilters} style={{ marginTop: '10px' }}>Reset</button>
            </div>
          ) : (
            <div className="houses-grid">
              {houses.map((house) => (
                <HouseCard key={house._id} house={house} />
              ))}
            </div>
          )
        ) : (
          /* اگر نقشہ ویو سلیکٹ ہو */
          <MapView houses={houses} />
        )}

        {/* 🌟 نیچے فلوٹنگ بٹن (نقشہ اور لسٹ کے درمیان سوئچ کرنے والا) */}
        <button
          className="btn-floating-map"
          onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
        >
          {viewMode === 'grid' ? (
            <>
              <Map size={18} />
              {lang === 'en' ? 'Show Map' : 'نقشہ دیکھیں'}
            </>
          ) : (
            <>
              <List size={18} />
              {lang === 'en' ? 'Show List' : 'لسٹ دیکھیں'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Home;