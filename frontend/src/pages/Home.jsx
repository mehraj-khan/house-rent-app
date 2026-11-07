/* eslint-disable */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, SlidersHorizontal, RotateCcw, Building2, Hotel, Home as HomeIcon, 
  Map, List, Mic, MicOff, Volume2 
} from 'lucide-react';
import HouseCard from '../components/HouseCard.jsx';
import MapView from '../components/MapView.jsx';
import { useAuth } from '../context/AuthContext';

// عام اردو الفاظ کو انگریزی میں درست رکھنے کے لیے
const commonUrduWords = {
  'لاہور': 'Lahore',
  'کراچی': 'Karachi',
  'اسلام آباد': 'Islamabad',
  'اسلام اباد': 'Islamabad',
  'راولپنڈی': 'Rawalpindi',
  'پنڈی': 'Rawalpindi',
  'مری': 'Murree',
  'پشاور': 'Peshawar',
  'ملتان': 'Multan',
  'فیصل آباد': 'Faisalabad',
  'کوئٹہ': 'Quetta',
  'سوات': 'Swat',
  'ہنزہ': 'Hunza',
  'گلبرگ': 'Gulberg',
  'بحریہ': 'Bahria',
  'ڈی ایچ اے': 'DHA',
};

const Home = () => {
  const [houses, setHouses] = useState([]);
  const { lang } = useAuth();

  const [viewMode, setViewMode] = useState('grid');
  const [citySearch, setCitySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maxPrice, setMaxPrice] = useState(150000);
  const [bedrooms, setBedrooms] = useState('all');
  const [suitableFor, setSuitableFor] = useState('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState('');

  // 🔴 یہاں لائیو Vercel بیک اینڈ کا لنک لگایا گیا ہے
  const fetchHouses = async () => {
    try {
      let url = `https://house-rent-app-ten.vercel.app/api/houses?search=${citySearch}&rentType=${selectedCategory}&maxPrice=${maxPrice}`;
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

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'ur' ? 'ur-PK' : 'en-PK';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceNotice(lang === 'en' ? 'Listening... Speak any city or area name!' : 'سن رہے ہیں... کسی بھی شہر یا علاقے کا نام بولیں!');
    };

    recognition.onresult = (event) => {
      let spokenText = event.results[0][0].transcript.trim();

      let cleaned = spokenText
        .replace(/(میں|کا|کے|کو|چاہیے|فلیٹ|مکان|گھر|کمرہ|in|for|rent|house|flat|room)/gi, '')
        .trim();

      let finalKeyword = commonUrduWords[cleaned] || commonUrduWords[spokenText] || cleaned || spokenText;

      setCitySearch(finalKeyword);
      setVoiceNotice(`Searching for: "${finalKeyword}"`);
      setTimeout(() => setVoiceNotice(''), 3000);
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      setIsListening(false);
      setVoiceNotice('');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const resetFilters = () => {
    setCitySearch('');
    setSelectedCategory('all');
    setMaxPrice(150000);
    setBedrooms('all');
    setSuitableFor('all');
  };

  return (
    <div>
      <div className="hero">
        <h1 className="hero-heading">
          {lang === 'en' ? 'Find Stays Across Pakistan' : 'پاکستان بھر میں من پسند رہائش حاصل کریں'}
        </h1>
        <p className="hero-subtitle">
          {lang === 'en' ? 'Speak any city, society, or area name to find stays.' : 'کسی بھی شہر، سوسائٹی یا علاقے کا نام بول کر فوری تلاش کریں۔'}
        </p>

        <div className="unified-search-container">
          <div className="unified-input-group">
            <Search color="#64748b" size={20} />
            <input
              type="text"
              placeholder={lang === 'en' ? 'Search any city, area, DHA, Bahria, Gulberg...' : 'کوئی بھی شہر، سوسائٹی، DHA، بحریہ، یا علاقہ سرچ کریں...'}
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
            />
          </div>

          <button
            type="button"
            className={`btn-mic ${isListening ? 'listening' : ''}`}
            onClick={handleVoiceSearch}
            title="Click to Speak any Area/City"
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <div className="unified-divider"></div>

          <button
            className={`unified-filter-btn ${showFilterPanel ? 'active' : ''}`}
            onClick={() => setShowFilterPanel(!showFilterPanel)}
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </button>
        </div>

        {voiceNotice && (
          <div className="listening-banner">
            <Volume2 size={16} />
            <span>{voiceNotice}</span>
          </div>
        )}
      </div>

      <div className="category-scroll-container">
        <div className="category-scroll-list">
          <button
            className="category-pill"
            onClick={() => setSelectedCategory('all')}
            style={{
              border: selectedCategory === 'all' ? '2px solid #0f172a' : '1px solid #e2e8f0',
              background: selectedCategory === 'all' ? '#0f172a' : '#ffffff',
              color: selectedCategory === 'all' ? '#ffffff' : '#475569',
            }}
          >
            🌟 All Homes
          </button>

          <button
            className="category-pill"
            onClick={() => setSelectedCategory('daily')}
            style={{
              border: selectedCategory === 'daily' ? '2px solid #2563eb' : '1px solid #e2e8f0',
              background: selectedCategory === 'daily' ? '#eff6ff' : '#ffffff',
              color: selectedCategory === 'daily' ? '#2563eb' : '#475569',
            }}
          >
            <Hotel size={16} /> 🏨 Daily Stays
          </button>

          <button
            className="category-pill"
            onClick={() => setSelectedCategory('monthly')}
            style={{
              border: selectedCategory === 'monthly' ? '2px solid #2563eb' : '1px solid #e2e8f0',
              background: selectedCategory === 'monthly' ? '#eff6ff' : '#ffffff',
              color: selectedCategory === 'monthly' ? '#2563eb' : '#475569',
            }}
          >
            <Building2 size={16} /> 🏢 Monthly Rentals
          </button>

          <button
            className="category-pill"
            onClick={() => setSelectedCategory('yearly')}
            style={{
              border: selectedCategory === 'yearly' ? '2px solid #2563eb' : '1px solid #e2e8f0',
              background: selectedCategory === 'yearly' ? '#eff6ff' : '#ffffff',
              color: selectedCategory === 'yearly' ? '#2563eb' : '#475569',
            }}
          >
            <HomeIcon size={16} /> 🏡 Yearly Leases
          </button>
        </div>

        {showFilterPanel && (
          <div style={{ maxWidth: '700px', margin: '15px auto 0', padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 8px 25px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                  Max Budget: <b style={{ color: '#2563eb' }}>PKR {maxPrice.toLocaleString()}</b>
                </label>
                <input
                  type="range" min="2000" max="300000" step="2000"
                  value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '6px' }}>Bedrooms:</label>
                <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                  <option value="all">Any Bedrooms</option>
                  <option value="1">1+ Bedroom</option>
                  <option value="2">2+ Bedrooms</option>
                  <option value="3">3+ Bedrooms</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '6px' }}>Preference:</label>
                <select value={suitableFor} onChange={(e) => setSuitableFor(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                  <option value="all">Show All</option>
                  <option value="family">👨‍👩‍👧‍👦 Families Only</option>
                  <option value="bachelors">👤 Bachelors Allowed</option>
                </select>
              </div>
            </div>

            <div style={{ textAlign: 'end', marginTop: '15px' }}>
              <button onClick={resetFilters} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <RotateCcw size={14} /> Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="container" style={{ position: 'relative', minHeight: '500px', marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ fontSize: '20px' }}>{viewMode === 'grid' ? `Listings (${houses.length})` : 'Interactive Map of Pakistan 🇵🇰'}</h2>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Live verified stays</span>
        </div>

        {viewMode === 'grid' ? (
          houses.length === 0 ? (
            <div className="house-card" style={{ padding: '35px', textAlign: 'center' }}>
              <p style={{ color: '#64748b' }}>No properties found. Try resetting filters.</p>
              <button className="btn-secondary" onClick={resetFilters} style={{ marginTop: '10px' }}>Reset All Filters</button>
            </div>
          ) : (
            <div className="houses-grid">
              {houses.map((house) => (
                <HouseCard key={house._id} house={house} />
              ))}
            </div>
          )
        ) : (
          <MapView houses={houses} />
        )}

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