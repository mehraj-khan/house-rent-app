/* eslint-disable */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Megaphone,
  ShieldCheck,
  Eye,
  MousePointerClick,
  Sparkles,
  ArrowLeft,
  Loader2,
  ExternalLink,
  Rocket,
  Home,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { uploadToCloudinary } from '../utils/uploadCloudinary';

const API_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://house-rent-app-ten.vercel.app';

const BANNER_PRICES = {
  home_top: { 7: 1500, 15: 2800, 30: 5000 },
  in_feed: { 7: 1000, 15: 1800, 30: 3200 },
};

const BOOST_PRICES = { 7: 500, 15: 900, 30: 1500 };

const formatPKR = (amount) => {
  const num = Number(amount) || 0;
  if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Crore`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)} Lac`;
  return num.toLocaleString();
};

const Advertise = () => {
  const { currentUser, lang } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialMode = searchParams.get('mode') === 'boost' ? 'house_boost' : 'banner';
  const preselectedHouseId = searchParams.get('houseId') || '';

  const [tab, setTab] = useState('book'); // 'book' | 'my-ads'
  const [adMode, setAdMode] = useState(initialMode); // 'house_boost' | 'banner'
  const [myAds, setMyAds] = useState([]);
  const [myHouses, setMyHouses] = useState([]);
  const [selectedHouseId, setSelectedHouseId] = useState(preselectedHouseId);

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    advertiserName: currentUser?.name || '',
    advertiserPhone: currentUser?.phone || '',
    businessName: '',
    title: '',
    subtitle: '',
    imageUrl: '',
    targetUrl: '',
    placement: 'home_top',
    city: 'all',
    packageDays: 7,
    paymentMethod: 'JazzCash',
    transactionId: '',
  });

  const currentUserId = currentUser?.id || currentUser?._id;

  const adminPaymentDetails = {
    JazzCash: { number: '03001234567', title: 'Muhammad Mehraj' },
    EasyPaisa: { number: '03119876543', title: 'Muhammad Mehraj' },
  };

  useEffect(() => {
    if (searchParams.get('mode') === 'boost') setAdMode('house_boost');
    if (searchParams.get('houseId')) setSelectedHouseId(searchParams.get('houseId'));
  }, [searchParams]);

  const selectedPrice =
    adMode === 'house_boost'
      ? BOOST_PRICES[form.packageDays] || 500
      : BANNER_PRICES[form.placement][form.packageDays] || 1000;

  const fetchUserAdvertiseData = async () => {
    if (!currentUserId) return;
    try {
      const [adsRes, housesRes] = await Promise.all([
        axios.get(`${API_URL}/api/ads/user/${currentUserId}`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/houses/owner/${currentUserId}`).catch(() => ({ data: [] })),
      ]);
      setMyAds(adsRes.data || []);
      setMyHouses(housesRes.data || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (currentUser) {
      setForm((prev) => ({
        ...prev,
        advertiserName: prev.advertiserName || currentUser.name || '',
        advertiserPhone: prev.advertiserPhone || currentUser.phone || '',
      }));
      fetchUserAdvertiseData();
    }
  }, [currentUserId]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'image');
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      alert('Image Upload Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(adminPaymentDetails[form.paymentMethod].number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (adMode === 'house_boost') {
      if (!currentUserId) {
        alert('Please log in first to boost your property!');
        navigate('/login');
        return;
      }
      if (!selectedHouseId) {
        alert('Please select one of your properties to boost!');
        return;
      }

      const chosenHouse = myHouses.find((h) => h._id === selectedHouseId);
      setSubmitting(true);
      try {
        await axios.post(`${API_URL}/api/ads/create`, {
          adType: 'house_boost',
          houseId: selectedHouseId,
          userId: currentUserId,
          advertiserName: form.advertiserName,
          advertiserPhone: form.advertiserPhone,
          title: chosenHouse?.title || 'Property Boost',
          city: chosenHouse?.city || 'all',
          packageDays: form.packageDays,
          paymentMethod: form.paymentMethod,
          transactionId: form.transactionId,
        });

        alert(
          lang === 'en'
            ? 'Property Boost submitted! After TID verification, it will appear at the TOP with ⚡ FEATURED badge 🚀'
            : 'آپ کی پراپرٹی بوسٹ کی درخواست موصول ہو گئی! تصدیق کے بعد یہ سب سے اوپر ⚡ FEATURED بیج کے ساتھ نظر آئے گی 🚀'
        );
        setForm((prev) => ({ ...prev, transactionId: '' }));
        fetchUserAdvertiseData();
        setTab('my-ads');
      } catch (err) {
        alert('Error: ' + (err.response?.data?.message || err.message));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Business Banner Ad Submit
    if (!form.imageUrl) {
      alert('Please upload a Banner Image or paste an Image URL!');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/ads/create`, {
        adType: 'banner',
        userId: currentUserId || null,
        ...form,
      });

      alert(
        lang === 'en'
          ? 'Ad submitted! Admin will verify your TID and publish it shortly 🚀'
          : 'آپ کا اشتہار موصول ہو گیا ہے! تصدیق کے بعد لائیو کر دیا جائے گا 🚀'
      );
      setForm((prev) => ({
        ...prev,
        businessName: '',
        title: '',
        subtitle: '',
        imageUrl: '',
        targetUrl: '',
        transactionId: '',
      }));
      if (currentUserId) {
        fetchUserAdvertiseData();
        setTab('my-ads');
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const chosenHouseObj = myHouses.find((h) => h._id === selectedHouseId);

  return (
    <div style={{ maxWidth: '880px', margin: '26px auto 80px', padding: '0 16px', boxSizing: 'border-box' }}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="btn-outline"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* ہیڈر بینر */}
      <div
        className="house-card"
        style={{
          padding: '24px',
          background:
            adMode === 'house_boost'
              ? 'linear-gradient(135deg, #78350f, #b45309)'
              : 'linear-gradient(135deg, #0f172a, #1e3a8a)',
          color: '#fff',
          borderRadius: '14px',
          marginBottom: '20px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            background: '#fde047',
            color: '#0f172a',
            padding: '3px 10px',
            borderRadius: '999px',
            fontWeight: 'bold',
          }}
        >
          {adMode === 'house_boost' ? '⚡ OLX-STYLE FEATURED LISTING' : '📢 SPONSORED BANNER ADS'}
        </span>
        <h2 style={{ margin: '10px 0 4px', fontSize: 'clamp(20px, 3.5vw, 26px)' }}>
          {adMode === 'house_boost'
            ? lang === 'en'
              ? 'Boost Your Property to #1 on Top'
              : 'اپنا گھر یا پراپرٹی سب سے اوپر (Top #1) پر لگوائیں'
            : lang === 'en'
            ? 'Advertise Your Business on HouseRent PK'
            : 'ہماری ویب سائٹ پر اپنا کاروباری اشتہار لگائیں'}
        </h2>
        <p style={{ margin: 0, fontSize: '13.5px', opacity: 0.9 }}>
          {adMode === 'house_boost'
            ? 'Get 5x more views & faster Rent / Sale deals with a golden ⚡ FEATURED badge!'
            : 'Reach thousands of house buyers, tenants & property owners across Pakistan every day!'}
        </p>
      </div>

      {/* Book vs My Ads ٹیبز */}
      {currentUser && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
          <button
            type="button"
            onClick={() => setTab('book')}
            style={{
              flex: 1,
              padding: '11px',
              borderRadius: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: tab === 'book' ? '2px solid #2563eb' : '1px solid #cbd5e1',
              background: tab === 'book' ? '#eff6ff' : '#fff',
              color: tab === 'book' ? '#1d4ed8' : '#475569',
            }}
          >
            ✍️ Create Promotion / Ad
          </button>
          <button
            type="button"
            onClick={() => setTab('my-ads')}
            style={{
              flex: 1,
              padding: '11px',
              borderRadius: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: tab === 'my-ads' ? '2px solid #2563eb' : '1px solid #cbd5e1',
              background: tab === 'my-ads' ? '#eff6ff' : '#fff',
              color: tab === 'my-ads' ? '#1d4ed8' : '#475569',
            }}
          >
            📊 My Ads &amp; Boosts ({myAds.length})
          </button>
        </div>
      )}

      {tab === 'book' ? (
        <div className="house-card" style={{ padding: '24px' }}>
          {/* دو بڑے آپشن: Boost My House بمقابلہ Business Banner Ad */}
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', display: 'block', marginBottom: '8px' }}>
            What would you like to advertise? (آپ کس چیز کا اشتہار لگانا چاہتے ہیں؟)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => setAdMode('house_boost')}
              style={{
                padding: '14px',
                borderRadius: '12px',
                textAlign: 'left',
                cursor: 'pointer',
                border: adMode === 'house_boost' ? '2px solid #d97706' : '1px solid #cbd5e1',
                background: adMode === 'house_boost' ? '#fffbeb' : '#ffffff',
              }}
            >
              <div style={{ fontWeight: '800', fontSize: '15px', color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Rocket size={17} /> Boost My House Ad
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                Pin your own Rent/Sale house to the top with ⚡ FEATURED badge
              </div>
              <div style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#b45309', marginTop: '6px' }}>
                Starts at PKR 500 / 7 Days
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAdMode('banner')}
              style={{
                padding: '14px',
                borderRadius: '12px',
                textAlign: 'left',
                cursor: 'pointer',
                border: adMode === 'banner' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                background: adMode === 'banner' ? '#eff6ff' : '#ffffff',
              }}
            >
              <div style={{ fontWeight: '800', fontSize: '15px', color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Megaphone size={17} /> Business Banner Ad
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                Promote your Agency, Society, Solar, Furniture or Brand Banner
              </div>
              <div style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#2563eb', marginTop: '6px' }}>
                Starts at PKR 1,000 / 7 Days
              </div>
            </button>
          </div>

          {/* اگر Boost My House منتخب ہو اور یوزر لاگ ان نہ ہو */}
          {adMode === 'house_boost' && !currentUser ? (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
              <Home size={34} color="#d97706" />
              <h3 style={{ margin: '10px 0 6px', color: '#92400e' }}>Log In to Boost Your Property</h3>
              <p style={{ fontSize: '13px', color: '#78350f', marginBottom: '14px' }}>
                First list your house or log in to select one of your properties and pin it to the top!
              </p>
              <button type="button" className="btn-primary" onClick={() => navigate('/login')}>
                Go to Login
              </button>
            </div>
          ) : adMode === 'house_boost' && myHouses.length === 0 ? (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
              <Home size={34} color="#64748b" />
              <h3 style={{ margin: '10px 0 6px' }}>No Properties Listed Yet</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
                List your house for Rent or Sale first, then you can boost it to #1!
              </p>
              <button type="button" className="btn-primary" onClick={() => navigate('/add-house')}>
                + List Your Property Now
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* ================= HOUSE BOOST FIELDS ================= */}
              {adMode === 'house_boost' ? (
                <>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                      1. Select Property to Boost (اپنا گھر منتخب کریں):
                    </label>
                    <select
                      required
                      value={selectedHouseId}
                      onChange={(e) => setSelectedHouseId(e.target.value)}
                      style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1.5px solid #f59e0b', fontSize: '14px', background: '#fff' }}
                    >
                      <option value="">-- Choose your property --</option>
                      {myHouses.map((h) => {
                        const isSale = h.purpose === 'sale';
                        const priceText = isSale
                          ? `PKR ${formatPKR(h.salePrice)}`
                          : `PKR ${(h.rentPrice || 0).toLocaleString()}/mo`;
                        return (
                          <option key={h._id} value={h._id}>
                            {isSale ? '🏷️ [Sale]' : '🏢 [Rent]'} {h.title} ({h.city} • {priceText})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {chosenHouseObj && (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#fffbeb', padding: '12px', borderRadius: '10px', border: '1px solid #fde68a' }}>
                      <img
                        src={chosenHouseObj.images?.[0] || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=200'}
                        alt=""
                        style={{ width: '78px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                      <div>
                        <b style={{ fontSize: '14px', color: '#0f172a' }}>{chosenHouseObj.title}</b>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          📍 {chosenHouseObj.address}, {chosenHouseObj.city}
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#b45309' }}>
                          Will get ⚡ FEATURED badge &amp; #1 Top Rank!
                        </span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* ================= BANNER AD FIELDS ================= */
                <>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                      1. Choose Banner Placement:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, placement: 'home_top' })}
                        style={{
                          padding: '14px',
                          borderRadius: '10px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          border: form.placement === 'home_top' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          background: form.placement === 'home_top' ? '#eff6ff' : '#fff',
                        }}
                      >
                        <div style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>
                          🏆 Home Top Hero Banner
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                          Highest visibility right above all listings
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#2563eb', marginTop: '6px' }}>
                          From PKR 1,500 / 7 days
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setForm({ ...form, placement: 'in_feed' })}
                        style={{
                          padding: '14px',
                          borderRadius: '10px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          border: form.placement === 'in_feed' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          background: form.placement === 'in_feed' ? '#eff6ff' : '#fff',
                        }}
                      >
                        <div style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>
                          📌 In-Feed Sponsored Card
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                          Blends naturally inside property search results
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#2563eb', marginTop: '6px' }}>
                          From PKR 1,000 / 7 days
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Duration Packages (دونوں کے لیے) */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                  2. Select Package Duration:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[7, 15, 30].map((d) => {
                    const p =
                      adMode === 'house_boost'
                        ? BOOST_PRICES[d]
                        : BANNER_PRICES[form.placement][d];
                    const active = form.packageDays === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setForm({ ...form, packageDays: d })}
                        style={{
                          padding: '10px 8px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          border: active ? '2px solid #047857' : '1px solid #cbd5e1',
                          background: active ? '#ecfdf5' : '#fff',
                          color: active ? '#047857' : '#334155',
                        }}
                      >
                        <div style={{ fontSize: '14px' }}>{d} Days</div>
                        <div style={{ fontSize: '12px' }}>PKR {p.toLocaleString()}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                <input
                  type="text"
                  required
                  placeholder="Your Full Name"
                  value={form.advertiserName}
                  onChange={(e) => setForm({ ...form, advertiserName: e.target.value })}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
                <input
                  type="text"
                  required
                  placeholder="Phone / WhatsApp (e.g. 03001234567)"
                  value={form.advertiserPhone}
                  onChange={(e) => setForm({ ...form, advertiserPhone: e.target.value })}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              {adMode === 'banner' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Business / Agency Name (Optional)"
                      value={form.businessName}
                      onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                      style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                    <input
                      type="text"
                      placeholder="Target City (e.g. Lahore or 'all')"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Ad Headline (e.g. Al-Rehman Solar — 5KW Package on Easy Installments)"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />

                  <input
                    type="text"
                    placeholder="Short Subtitle / Offer (e.g. 20% Off for HouseRent PK Users)"
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />

                  <input
                    type="text"
                    placeholder="Click Link (Website URL or https://wa.me/923001234567)"
                    value={form.targetUrl}
                    onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />

                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px dashed #2563eb' }}>
                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e40af', display: 'block', marginBottom: '8px' }}>
                      Upload Banner Image (یا نیچے لنک پیسٹ کریں):
                    </label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                    {uploading && (
                      <div style={{ fontSize: '12px', color: '#2563eb', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Loader2 size={14} className="spin" /> Uploading banner...
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder="Or paste Image URL..."
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '8px', boxSizing: 'border-box' }}
                    />
                    {form.imageUrl && (
                      <img
                        src={form.imageUrl}
                        alt="Ad Preview"
                        style={{ width: '100%', maxHeight: '170px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px' }}
                      />
                    )}
                  </div>
                </>
              )}

              {/* Payment Box */}
              <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '12px', border: '1.5px solid #93c5fd' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                  <b style={{ color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={18} /> Pay PKR {selectedPrice.toLocaleString()} ({form.packageDays} Days)
                  </b>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['JazzCash', 'EasyPaisa'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setForm({ ...form, paymentMethod: m })}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          border: form.paymentMethod === m ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          background: form.paymentMethod === m ? '#ffffff' : '#e2e8f0',
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '10px 12px', borderRadius: '8px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{form.paymentMethod} Account</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e3a8a' }}>
                      {adminPaymentDetails[form.paymentMethod].number}
                    </div>
                    <div style={{ fontSize: '12px', color: '#334155' }}>
                      Title: <b>{adminPaymentDetails[form.paymentMethod].title}</b>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    style={{ background: copied ? '#16a34a' : '#2563eb', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <input
                  type="text"
                  required
                  placeholder="Enter JazzCash / EasyPaisa Transaction ID (TID)"
                  value={form.transactionId}
                  onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting || uploading}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '13px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  background: adMode === 'house_boost' ? '#d97706' : undefined,
                  borderColor: adMode === 'house_boost' ? '#d97706' : undefined,
                }}
              >
                <Sparkles size={16} style={{ verticalAlign: 'middle', marginInlineEnd: '6px' }} />
                {submitting
                  ? 'Submitting...'
                  : adMode === 'house_boost'
                  ? `Boost Property to Top (PKR ${selectedPrice.toLocaleString()}) 🚀`
                  : `Submit Sponsored Ad (PKR ${selectedPrice.toLocaleString()})`}
              </button>
            </form>
          )}
        </div>
      ) : (
        /* My Ads & Boosts Tab */
        <div style={{ display: 'grid', gap: '14px' }}>
          {myAds.length === 0 ? (
            <div className="house-card" style={{ padding: '35px', textAlign: 'center', color: '#64748b' }}>
              <Megaphone size={36} color="#cbd5e1" />
              <p>You haven&apos;t submitted any ads or property boosts yet.</p>
            </div>
          ) : (
            myAds.map((ad) => (
              <div key={ad._id} className="house-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: '1 1 280px' }}>
                  {(ad.imageUrl || ad.house?.images?.[0]) && (
                    <img
                      src={ad.imageUrl || ad.house?.images?.[0]}
                      alt=""
                      style={{ width: '76px', height: '58px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '2px 7px', borderRadius: '6px', background: ad.adType === 'house_boost' ? '#fef3c7' : '#eff6ff', color: ad.adType === 'house_boost' ? '#b45309' : '#1d4ed8' }}>
                        {ad.adType === 'house_boost' ? '🚀 HOUSE BOOST' : `📢 ${ad.placement.toUpperCase()}`}
                      </span>
                      <b style={{ fontSize: '15px', color: '#0f172a' }}>{ad.title}</b>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      PKR {ad.price?.toLocaleString()} • {ad.packageDays} Days • TID: <b>{ad.transactionId}</b>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#334155', marginTop: '5px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Eye size={13} /> {ad.views || 0} Views
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <MousePointerClick size={13} /> {ad.clicks || 0} Clicks
                      </span>
                      {ad.expiresAt && (
                        <span>Expires: {new Date(ad.expiresAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      textTransform: 'uppercase',
                      background: ad.status === 'approved' ? '#dcfce7' : ad.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                      color: ad.status === 'approved' ? '#15803d' : ad.status === 'rejected' ? '#b91c1c' : '#b45309',
                    }}
                  >
                    {ad.status}
                  </span>
                  {ad.targetUrl && (
                    <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Advertise;