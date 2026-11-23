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
import { useNavigate } from 'react-router-dom';



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

  const navigate = useNavigate();

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
    <div style={{ overflowX: 'hidden' }}>
      <div className="hero" style={{ padding: 'clamp(28px, 5vw, 52px) 14px' }}>
        <h1 className="hero-heading" style={{ fontSize: 'clamp(22px, 4.5vw, 38px)', lineHeight: '1.25', margin: '0 0 10px' }}>
          {lang === 'en' ? 'Find Stays Across Pakistan' : 'پاکستان بھر میں من پسند رہائش حاصل کریں'}
        </h1>
        <p className="hero-subtitle" style={{ fontSize: 'clamp(13px, 2.5vw, 16px)', maxWidth: '640px', margin: '0 auto 20px', padding: '0 8px' }}>
          {lang === 'en'
            ? 'Try AI Search: e.g. "Lahore 25k solar boys room" or speak any area!'
            : 'AI سرچ آزمائیں: جیسے "Lahore mein 25k tak solar wala boys room"'}
        </p>

        {/* 📱💻 ریسپانسیو سرچ بار (ہر اسکرین پر فٹ بیٹھے گی) */}
        <div
          className="unified-search-container"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            width: '100%',
            maxWidth: '780px',
            margin: '0 auto',
            padding: '10px 12px',
            borderRadius: '18px',
            boxSizing: 'border-box',
          }}
        >
          <div
            className="unified-input-group"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flex: '1 1 230px',
              minWidth: 0,
            }}
          >
            <Search color="#64748b" size={19} style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder={lang === 'en' ? 'Try: "Lahore 25k solar room" or city...' : 'لکھیں: "Lahore 25k solar room" یا شہر...'}
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              style={{ width: '100%', minWidth: 0, border: 'none', outline: 'none', fontSize: '14px', background: 'transparent' }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              flexWrap: 'wrap',
              flex: '0 1 auto',
            }}
          >
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
              style={{ flexShrink: 0 }}
            >
              {isListening ? <MicOff size={19} /> : <Mic size={19} />}
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

            <button
              className={`unified-filter-btn ${showFilterPanel ? 'active' : ''}`}
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              <SlidersHorizontal size={16} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {aiBanner && (
          <div
            style={{
              maxWidth: '720px',
              width: '92%',
              margin: '12px auto 0',
              background: 'rgba(124, 58, 237, 0.16)',
              border: '1px solid rgba(167, 139, 250, 0.5)',
              color: '#ffffff',
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              boxSizing: 'border-box',
            }}
          >
            <Sparkles size={15} color="#fde047" style={{ flexShrink: 0 }} />
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

      {/* کیٹیگری پلز (موبائل پر سموتھ اسکرول) */}
      <div className="category-scroll-container" style={{ padding: '12px 12px 4px', boxSizing: 'border-box' }}>
        <div
          className="category-scroll-list"
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: '6px',
          }}
        >
          <button
            className="category-pill"
            onClick={() => { setSelectedCategory('all'); setOnlyShared(false); }}
            style={{
              flexShrink: 0,
              whiteSpace: 'nowrap',
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
              flexShrink: 0,
              whiteSpace: 'nowrap',
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
              flexShrink: 0,
              whiteSpace: 'nowrap',
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
              flexShrink: 0,
              whiteSpace: 'nowrap',
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
              flexShrink: 0,
              whiteSpace: 'nowrap',
              border: selectedCategory === 'yearly' ? '2px solid #2563eb' : '1px solid #e2e8f0',
              background: selectedCategory === 'yearly' ? '#eff6ff' : '#ffffff',
              color: selectedCategory === 'yearly' ? '#2563eb' : '#475569',
            }}
          >
            <HomeIcon size={16} /> 🏡 Yearly Leases
          </button>
        </div>

        {showFilterPanel && (
          <div style={{ maxWidth: '780px', width: '100%', margin: '12px auto 0', padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 8px 25px rgba(0,0,0,0.06)', boxSizing: 'border-box' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '12px' }}>
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
                <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}>
                  <option value="all">Any Bedrooms</option>
                  <option value="1">1+ Bedroom</option>
                  <option value="2">2+ Bedrooms</option>
                  <option value="3">3+ Bedrooms</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '6px' }}>Preference:</label>
                <select value={suitableFor} onChange={(e) => setSuitableFor(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}>
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
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #86efac', fontSize: '13px', boxSizing: 'border-box' }}
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

      {/* 📢 ریورس رینٹل اسمارٹ بینر (ہوم پیج پر نمایاں بٹن) */}
      <div style={{ maxWidth: '1200px', margin: '20px auto 0', padding: '0 20px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
          color: 'white', padding: '16px 24px', borderRadius: '14px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '14px', boxShadow: '0 6px 20px rgba(30, 27, 75, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div>
            <span style={{ fontSize: '11px', background: '#eab308', color: '#000', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
              🌟 REVERSE RENTAL
            </span>
            <h3 style={{ margin: '6px 0 2px', fontSize: '18px' }}>
              {lang === 'en' ? "Can't find your ideal home? Post what you need!" : 'من پسند گھر نہیں مل رہا؟ اپنی ڈیمانڈ پوسٹ کریں!'}
            </h3>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.85 }}>
              {lang === 'en'
                ? 'Post your area and budget. Verified landlords will send offers directly to you!'
                : 'اپنا بجٹ اور علاقہ لکھیں، مالکان ڈیلرز کے بغیر خود آپ سے رابطہ کر کے گھر پیش کریں گے۔'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/post-request')}
              style={{
                background: '#eab308', color: '#0f172a', border: 'none',
                padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold',
                fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(234, 179, 8, 0.3)'
              }}
            >
              ✍️ {lang === 'en' ? 'Post Demand' : 'مجھے گھر چاہیے'}
            </button>

            <button
              onClick={() => navigate('/wanted')}
              style={{
                background: 'rgba(255, 255, 255, 0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
                padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold',
                fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap'
              }}
            >
              👀 {lang === 'en' ? 'View All Demands' : 'تمام ڈیمانڈز دیکھیں'}
            </button>
          </div>
        </div>
      </div>


      <div className="container" style={{ position: 'relative', minHeight: '500px', marginTop: '16px', paddingBottom: '100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
          <h2 style={{ fontSize: 'clamp(17px, 3.5vw, 21px)', margin: 0 }}>
            {viewMode === 'grid' ? `Listings (${houses.length})` : 'Interactive Map of Pakistan 🇵🇰'}
          </h2>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Live verified stays</span>
        </div>

        {viewMode === 'grid' ? (
          houses.length === 0 ? (
            <div className="house-card" style={{ padding: '35px 20px', textAlign: 'center' }}>
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
          style={{ bottom: '80px' }}
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