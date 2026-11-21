/* eslint-disable */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, SlidersHorizontal, RotateCcw, Building2, Hotel, Home as HomeIcon, 
  Map, List, Mic, MicOff, Volume2, GraduationCap, MapPin, Sparkles, Loader2 
} from 'lucide-react';
import HouseCard from '../components/HouseCard.jsx';
import MapView from '../components/MapView.jsx';
import { useAuth } from '../context/AuthContext';
import { getLiveLocation } from '../utils/getLiveLocation';

const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://house-rent-app-ten.vercel.app';

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
  const [onlyShared, setOnlyShared] = useState(false);
  const [sharedGender, setSharedGender] = useState('all');
  const [maxPrice, setMaxPrice] = useState(150000);
  const [bedrooms, setBedrooms] = useState('all');
  const [suitableFor, setSuitableFor] = useState('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const [utilityFilters, setUtilityFilters] = useState({
    separateMeter: false,
    solarOrUps: false,
    suiGas: false,
    wifi: false,
  });

  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState('');
  const [locating, setLocating] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiBanner, setAiBanner] = useState('');

  const fetchHouses = async () => {
    try {
      let url = `${API_URL}/api/houses?search=${citySearch}&rentType=${selectedCategory}&maxPrice=${maxPrice}`;
      if (bedrooms !== 'all') url += `&bedrooms=${bedrooms}`;
      if (suitableFor !== 'all') url += `&suitableFor=${suitableFor}`;
      if (onlyShared) url += `&isShared=true`;
      if (sharedGender !== 'all') url += `&sharedGender=${sharedGender}`;

      if (utilityFilters.separateMeter) url += `&separateMeter=true`;
      if (utilityFilters.solarOrUps) url += `&solarOrUps=true`;
      if (utilityFilters.suiGas) url += `&suiGas=true`;
      if (utilityFilters.wifi) url += `&wifi=true`;

      const res = await axios.get(url);
      setHouses(res.data.houses || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, [citySearch, selectedCategory, onlyShared, sharedGender, maxPrice, bedrooms, suitableFor, utilityFilters]);

  // 🤖 AI اسمارٹ سرچ (رومن اردو یا انگلش میں کچھ بھی لکھیں)
  const handleAiSearch = async () => {
    if (!citySearch.trim()) {
      alert(lang === 'en' ? 'Write something first, e.g. "Lahore 25k solar boys room"' : 'پہلے کچھ لکھیں، جیسے "Lahore mein 25k tak solar room"');
      return;
    }

    setAiLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/ai/smart-search`, { query: citySearch });
      const { filters, summary } = res.data;

      setCitySearch(filters.search || '');
      setMaxPrice(Number(filters.maxPrice) || 150000);
      setBedrooms(filters.bedrooms || 'all');
      setSelectedCategory(filters.rentType || 'all');
      setSuitableFor(filters.suitableFor || 'all');
      setOnlyShared(Boolean(filters.isShared));
      setSharedGender(filters.sharedGender || 'all');
      setUtilityFilters({
        separateMeter: Boolean(filters.utilities?.separateMeter),
        solarOrUps: Boolean(filters.utilities?.solarOrUps),
        suiGas: Boolean(filters.utilities?.suiGas),
        wifi: Boolean(filters.utilities?.wifi),
      });

      setAiBanner(summary);
    } catch (err) {
      alert('AI Search Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setAiLoading(false);
    }
  };

  const handleNearMe = async () => {
    setLocating(true);
    try {
      const { city } = await getLiveLocation();
      if (city) setCitySearch(city);
    } catch (err) {
      alert(err.message);
    } finally {
      setLocating(false);
    }
  };

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
    setOnlyShared(false);
    setSharedGender('all');
    setMaxPrice(150000);
    setBedrooms('all');
    setSuitableFor('all');
    setAiBanner('');
    setUtilityFilters({
      separateMeter: false,
      solarOrUps: false,
      suiGas: false,
      wifi: false,
    });
  };

  return (
    <div>
      <div className="hero">
        <h1 className="hero-heading">
          {lang === 'en' ? 'Find Stays Across Pakistan' : 'پاکستان بھر میں من پسند رہائش حاصل کریں'}
        </h1>
        <p className="hero-subtitle">
          {lang === 'en'
            ? 'Try AI Search: e.g. "Lahore 25k solar boys room" or speak any area!'
            : 'AI سرچ آزمائیں: جیسے "Lahore mein 25k tak solar wala boys room"'}
        </p>

        <div className="unified-search-container">
          <div className="unified-input-group">
            <Search color="#64748b" size={20} />
            <input
              type="text"
              placeholder={lang === 'en' ? 'Try: "Lahore 25k solar room" or search city...' : 'لکھیں: "Lahore mein 25k solar room" یا شہر سرچ کریں...'}
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={handleAiSearch}
            disabled={aiLoading}
            title="Smart AI Search (Roman Urdu / English)"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
              color: '#ffffff',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '999px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '12px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
            }}
          >
            {aiLoading ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
            <span>AI Search</span>
          </button>

          <button
            type="button"
            className={`btn-mic ${isListening ? 'listening' : ''}`}
            onClick={handleVoiceSearch}
            title="Click to Speak any Area/City"
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button
            type="button"
            onClick={handleNearMe}
            disabled={locating}
            title="Find Stays Near My Live Location"
            style={{
              background: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              padding: '8px 10px',
              borderRadius: '999px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
            }}
          >
            <MapPin size={15} /> {locating ? '...' : 'Near Me'}
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

        {aiBanner && (
          <div
            style={{
              maxWidth: '720px',
              margin: '12px auto 0',
              background: 'rgba(124, 58, 237, 0.14)',
              border: '1px solid rgba(167, 139, 250, 0.5)',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Sparkles size={15} color="#fde047" />
            <span><b>AI Applied:</b> {aiBanner}</span>
            <button
              type="button"
              onClick={resetFilters}
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: '6px', padding: '2px 8px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
            >
              Clear
            </button>
          </div>
        )}

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
            onClick={() => { setSelectedCategory('all'); setOnlyShared(false); }}
            style={{
              border: selectedCategory === 'all' && !onlyShared ? '2px solid #0f172a' : '1px solid #e2e8f0',
              background: selectedCategory === 'all' && !onlyShared ? '#0f172a' : '#ffffff',
              color: selectedCategory === 'all' && !onlyShared ? '#ffffff' : '#475569',
            }}
          >
            🌟 All Homes
          </button>

          <button
            className="category-pill"
            onClick={() => setOnlyShared(!onlyShared)}
            style={{
              border: onlyShared ? '2px solid #16a34a' : '1px solid #e2e8f0',
              background: onlyShared ? '#dcfce7' : '#ffffff',
              color: onlyShared ? '#15803d' : '#475569',
            }}
          >
            <GraduationCap size={16} /> 🎓 Shared / Roommates
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
          <div style={{ maxWidth: '750px', margin: '15px auto 0', padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 8px 25px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
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

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#166534', display: 'block', marginBottom: '6px' }}>🎓 Roommate Gender:</label>
                <select
                  value={sharedGender}
                  onChange={(e) => {
                    setSharedGender(e.target.value);
                    if (e.target.value !== 'all') setOnlyShared(true);
                  }}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #86efac', fontSize: '13px' }}
                >
                  <option value="all">Any</option>
                  <option value="boys">👨 Boys / Male</option>
                  <option value="girls">👩 Girls / Female</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
              {[
                { key: 'separateMeter', label: '⚡ Separate Meter' },
                { key: 'solarOrUps', label: '☀️ Solar / UPS' },
                { key: 'suiGas', label: '🔥 Sui Gas' },
                { key: 'wifi', label: '📶 WiFi' },
              ].map((u) => (
                <button
                  key={u.key}
                  type="button"
                  onClick={() => setUtilityFilters(prev => ({ ...prev, [u.key]: !prev[u.key] }))}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    border: utilityFilters[u.key] ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: utilityFilters[u.key] ? '#eff6ff' : '#ffffff',
                    color: utilityFilters[u.key] ? '#1d4ed8' : '#475569',
                  }}
                >
                  {utilityFilters[u.key] ? '✅ ' : ''}{u.label}
                </button>
              ))}
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