/* eslint-disable */
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, Calendar, Clock, Video, Loader2, Users, MapPin, Sparkles } from 'lucide-react';
import { uploadToCloudinary } from '../utils/uploadCloudinary';
import { getLiveLocation } from '../utils/getLiveLocation';

const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://house-rent-app-ten.vercel.app';

const AddHouse = () => {
  const { currentUser, lang } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [locating, setLocating] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  const [houseData, setHouseData] = useState({
    title: '', 
    description: '', 
    city: '', 
    address: '', 
    bedrooms: '', 
    bathrooms: '',
    rentPrice: '', 
    pricePerDay: '', 
    pricePerYear: '',
    availableFor: ['monthly', 'daily'],
    suitableFor: 'both',
    isShared: false,
    totalBeds: 2,
    sharedGender: 'boys',
    availableFrom: '', 
    availableTo: '',
    videoUrl: '',
    images: [],
    nearLandmark: '',
    utilities: {
      separateMeter: false,
      solarOrUps: false,
      suiGas: false,
      water24x7: false,
      wifi: false,
      parking: false,
    },
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const handleAiDescription = async () => {
    setAiGenerating(true);
    try {
      const res = await axios.post(`${API_URL}/api/ai/generate-description`, houseData);
      if (res.data?.description) {
        setHouseData((prev) => ({ ...prev, description: res.data.description }));
      }
    } catch (err) {
      alert('AI Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setAiGenerating(false);
    }
  };

  const handleLiveLocation = async () => {
    setLocating(true);
    try {
      const { city, area } = await getLiveLocation();
      setHouseData((prev) => ({
        ...prev,
        city: city || prev.city,
        address: area || prev.address,
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setLocating(false);
    }
  };

  const handleMultipleImages = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadProgress(10);
    try {
      const uploadedUrls = [];
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
        const url = await uploadToCloudinary(files[i], 'image');
        uploadedUrls.push(url);
      }

      setHouseData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    } catch (err) {
      alert('Upload Error: ' + err.message);
    } finally {
      setUploadProgress(null);
    }
  };

  const removeImage = (indexToRemove) => {
    setHouseData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== indexToRemove) }));
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 60 * 1024 * 1024) {
      alert('Video file is over 60MB! Please paste a YouTube link instead or choose a smaller clip.');
      return;
    }

    setUploadProgress(1);
    try {
      const videoUrl = await uploadToCloudinary(file, 'video', (percent) => {
        setUploadProgress(percent);
      });
      setHouseData(prev => ({ ...prev, videoUrl }));
      alert('Video uploaded successfully to Cloud! 🎥✅');
    } catch (err) {
      alert('Video Upload Error: ' + err.message);
    } finally {
      setUploadProgress(null);
    }
  };

  const toggleAvailableFor = (type) => {
    setHouseData(prev => {
      const exists = prev.availableFor.includes(type);
      return { ...prev, availableFor: exists ? prev.availableFor.filter(t => t !== type) : [...prev.availableFor, type] };
    });
  };

  const toggleUtility = (key) => {
    setHouseData(prev => ({
      ...prev,
      utilities: { ...prev.utilities, [key]: !prev.utilities[key] }
    }));
  };

  const splitRentPerPerson =
    houseData.isShared && Number(houseData.rentPrice) > 0 && Number(houseData.totalBeds) > 0
      ? Math.round(Number(houseData.rentPrice) / Number(houseData.totalBeds))
      : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please log in first as a Landlord!');
      navigate('/login');
      return;
    }

    if (houseData.images.length === 0) {
      alert('Please upload at least one house photo!');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/houses/add`, {
        ...houseData,
        rentPrice: Number(houseData.rentPrice) || 0,
        pricePerDay: Number(houseData.pricePerDay) || 0,
        pricePerYear: Number(houseData.pricePerYear) || 0,
        bedrooms: Number(houseData.bedrooms),
        bathrooms: Number(houseData.bathrooms),
        totalBeds: houseData.isShared ? Number(houseData.totalBeds) || 2 : 1,
        pricePerPerson: splitRentPerPerson,
        owner: currentUser?.id || currentUser?._id,
      });

      alert('Property published successfully to Cloud! 🏠🎉');
      navigate('/');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '650px', marginTop: '30px' }}>
      <div className="house-card" style={{ padding: '30px' }}>
        <h2 style={{ marginBottom: '15px' }}>List Property with Video & Cloud Storage 🏠</h2>

        {uploadProgress !== null && (
          <div style={{ background: '#eff6ff', color: '#1e40af', padding: '12px 16px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #bfdbfe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Loader2 className="spin" size={16} /> Fast Cloud Uploading...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#dbeafe', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#2563eb', transition: 'width 0.2s ease' }}></div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Title (e.g. 2-Bed Luxury Suite / Shared Student Room)" required
            value={houseData.title} onChange={(e) => setHouseData({ ...houseData, title: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />

          <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '8px', border: '1.5px solid #bfdbfe', marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Clock size={16} /> When is this space available?
            </label>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '140px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  AVAILABLE FROM:
                </label>
                <input
                  type="date" min={todayStr} value={houseData.availableFrom}
                  onChange={(e) => setHouseData({ ...houseData, availableFrom: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>

              <div style={{ flex: 1, minWidth: '140px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  AVAILABLE TO (Optional):
                </label>
                <input
                  type="date" min={houseData.availableFrom || todayStr} value={houseData.availableTo}
                  onChange={(e) => setHouseData({ ...houseData, availableTo: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '8px' }}>
              <Calendar size={15} style={{ verticalAlign: 'middle', marginInlineEnd: '4px' }} />
              Rental Rates:
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              {['daily', 'monthly', 'yearly'].map(type => (
                <button key={type} type="button" onClick={() => toggleAvailableFor(type)}
                  style={{ padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', border: houseData.availableFor.includes(type) ? '2px solid #2563eb' : '1px solid #cbd5e1', background: houseData.availableFor.includes(type) ? '#eff6ff' : '#fff', color: houseData.availableFor.includes(type) ? '#2563eb' : '#64748b', textTransform: 'capitalize' }}>
                  ✓ {type}
                </button>
              ))}
            </div>

            {houseData.availableFor.includes('daily') && (
              <input type="number" placeholder="Daily Rate (PKR/night)" required
                value={houseData.pricePerDay} onChange={(e) => setHouseData({ ...houseData, pricePerDay: e.target.value })}
                style={{ width: '100%', padding: '10px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            )}
            {houseData.availableFor.includes('monthly') && (
              <input type="number" placeholder="Monthly Rent (PKR/month)" required
                value={houseData.rentPrice} onChange={(e) => setHouseData({ ...houseData, rentPrice: e.target.value })}
                style={{ width: '100%', padding: '10px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            )}
            {houseData.availableFor.includes('yearly') && (
              <input type="number" placeholder="Yearly Total in PKR (Optional)"
                value={houseData.pricePerYear} onChange={(e) => setHouseData({ ...houseData, pricePerYear: e.target.value })}
                style={{ width: '100%', padding: '10px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['family', 'bachelors', 'both'].map(s => (
              <button key={s} type="button" onClick={() => setHouseData({ ...houseData, suitableFor: s })}
                style={{ flex: 1, padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', border: houseData.suitableFor === s ? '2px solid #2563eb' : '1px solid #cbd5e1', background: houseData.suitableFor === s ? '#eff6ff' : '#fff', color: houseData.suitableFor === s ? '#2563eb' : '#64748b', textTransform: 'capitalize' }}>
                {s === 'family' ? '👨‍👩‍👧‍👦 Family' : s === 'bachelors' ? '👤 Bachelors' : '🤝 Both'}
              </button>
            ))}
          </div>

          <div style={{ background: houseData.isShared ? '#f0fdf4' : '#f8fafc', padding: '15px', borderRadius: '10px', border: houseData.isShared ? '1.5px solid #22c55e' : '1px solid #cbd5e1', marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', color: '#0f172a' }}>
              <input
                type="checkbox"
                checked={houseData.isShared}
                onChange={(e) =>
                  setHouseData((prev) => ({
                    ...prev,
                    isShared: e.target.checked,
                    suitableFor: e.target.checked && prev.suitableFor === 'family' ? 'bachelors' : prev.suitableFor,
                  }))
                }
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <Users size={18} color="#16a34a" />
              <span>
                {lang === 'en'
                  ? '🎓 Allow Shared Room / Hostel / Roommates (Split Rent)'
                  : '🎓 مشترکہ کمرہ / ہاسٹل / روم میٹ (Split Rent) کی اجازت دیں'}
              </span>
            </label>

            {houseData.isShared && (
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #bbf7d0' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#166534', display: 'block', marginBottom: '6px' }}>
                  Sharing Preference:
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  {[
                    { value: 'boys', label: '👨 Boys / Male' },
                    { value: 'girls', label: '👩 Girls / Female' },
                    { value: 'any', label: '🤝 Anyone' },
                  ].map((g) => (
                    <button
                      key={g.value} type="button" onClick={() => setHouseData({ ...houseData, sharedGender: g.value })}
                      style={{
                        flex: 1, padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px',
                        border: houseData.sharedGender === g.value ? '2px solid #16a34a' : '1px solid #cbd5e1',
                        background: houseData.sharedGender === g.value ? '#dcfce7' : '#fff',
                        color: houseData.sharedGender === g.value ? '#15803d' : '#64748b',
                      }}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>

                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#166534', display: 'block', marginBottom: '6px' }}>
                  Split Rent Between (Total Persons):
                </label>
                <input
                  type="number" min="2" max="10" value={houseData.totalBeds}
                  onChange={(e) => setHouseData({ ...houseData, totalBeds: e.target.value })}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #86efac', fontSize: '14px' }}
                />

                {splitRentPerPerson > 0 && (
                  <div style={{ marginTop: '10px', background: '#dcfce7', color: '#14532d', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                    💡 Auto Split Rent: PKR {splitRentPerPerson.toLocaleString()} / person per month ({houseData.totalBeds} roommates)
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleLiveLocation}
            disabled={locating}
            style={{
              width: '100%', padding: '9px 12px', marginBottom: '10px', borderRadius: '8px',
              border: '1.5px solid #2563eb', background: '#eff6ff', color: '#1d4ed8',
              fontWeight: 'bold', fontSize: '13px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
          >
            <MapPin size={16} />
            {locating ? 'Detecting Live Location...' : '📍 Use My Live Location (Auto-Fill City & Address)'}
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" placeholder="City" required value={houseData.city} onChange={(e) => setHouseData({ ...houseData, city: e.target.value })}
              style={{ flex: 1, padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            <input type="text" placeholder="Address" required value={houseData.address} onChange={(e) => setHouseData({ ...houseData, address: e.target.value })}
              style={{ flex: 1, padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="number" placeholder="Bedrooms" required value={houseData.bedrooms} onChange={(e) => setHouseData({ ...houseData, bedrooms: e.target.value })}
              style={{ flex: 1, padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            <input type="number" placeholder="Bathrooms" required value={houseData.bathrooms} onChange={(e) => setHouseData({ ...houseData, bathrooms: e.target.value })}
              style={{ flex: 1, padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>
              Photos (Fast Cloud Upload):
            </label>
            <input type="file" accept="image/*" multiple onChange={handleMultipleImages} disabled={uploadProgress !== null}
              style={{ padding: '8px', border: '1.5px dashed #2563eb', background: '#eff6ff', width: '100%', borderRadius: '6px', cursor: 'pointer' }} />
            
            {houseData.images.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px', marginTop: '10px' }}>
                {houseData.images.map((img, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img src={img} alt={`Preview ${index}`} style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '6px' }} />
                    <button type="button" onClick={() => removeImage(index)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(220, 38, 38, 0.85)', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', display: 'block', marginBottom: '10px' }}>
              ⚡ Utilities & Facilities (سچائی بتائیں — یوزرز کا اعتماد بڑھتا ہے):
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', marginBottom: '12px' }}>
              {[
                { key: 'separateMeter', label: '⚡ Separate Bijli Meter' },
                { key: 'solarOrUps', label: '☀️ Solar / UPS Backup' },
                { key: 'suiGas', label: '🔥 Sui Gas Available' },
                { key: 'water24x7', label: '💧 24/7 Water / Boring' },
                { key: 'wifi', label: '📶 Fiber WiFi' },
                { key: 'parking', label: '🚗 Bike/Car Parking' },
              ].map((u) => {
                const active = houseData.utilities[u.key];
                return (
                  <button
                    key={u.key} type="button" onClick={() => toggleUtility(u.key)}
                    style={{
                      padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', textAlign: 'left',
                      border: active ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: active ? '#eff6ff' : '#ffffff',
                      color: active ? '#1d4ed8' : '#475569',
                    }}
                  >
                    {active ? '✅ ' : ''}{u.label}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              placeholder="📍 Nearby University / Metro / Landmark (e.g. 5 min from FAST / Metro Station)"
              value={houseData.nearLandmark}
              onChange={(e) => setHouseData({ ...houseData, nearLandmark: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>

          <div style={{ marginBottom: '18px', background: '#fef2f2', padding: '16px', borderRadius: '10px', border: '1.5px dashed #f87171' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Video size={18} color="#dc2626" />
              Property Video Walkthrough (Choose File OR Paste Video Link):
            </label>

            {houseData.videoUrl ? (
              <div style={{ marginTop: '10px', position: 'relative', background: '#000', borderRadius: '8px', padding: '10px' }}>
                <p style={{ color: '#fff', fontSize: '12px', margin: '0 0 6px' }}>Selected Video Preview:</p>

                {houseData.videoUrl.includes('youtu') ? (
                  <iframe
                    src={
                      houseData.videoUrl.includes('youtu.be')
                        ? `https://www.youtube.com/embed/${houseData.videoUrl.split('/').pop().split('?')[0]}`
                        : houseData.videoUrl.includes('shorts')
                        ? `https://www.youtube.com/embed/${houseData.videoUrl.split('shorts/')[1]?.split('?')[0]}`
                        : `https://www.youtube.com/embed/${houseData.videoUrl.split('watch?v=')[1]?.split('&')[0]}`
                    }
                    style={{ width: '100%', height: '180px', border: 'none', borderRadius: '6px' }}
                  />
                ) : (
                  <video src={houseData.videoUrl} controls style={{ width: '100%', maxHeight: '180px', borderRadius: '6px', background: '#000' }} />
                )}

                <button
                  type="button" onClick={() => setHouseData({ ...houseData, videoUrl: '' })}
                  style={{
                    width: '100%', marginTop: '8px', padding: '8px', background: '#dc2626', color: 'white',
                    border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <X size={15} /> Remove Video (ویڈیو ہٹائیں)
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="file" accept="video/*" onChange={handleVideoUpload} disabled={uploadProgress !== null}
                  style={{ padding: '8px', background: '#ffffff', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                />
                
                <div style={{ margin: '10px 0 6px', fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ flex: 1, height: '1px', background: '#cbd5e1' }}></span>
                  <span>OR PASTE VIDEO LINK (YouTube / Shorts / Reels)</span>
                  <span style={{ flex: 1, height: '1px', background: '#cbd5e1' }}></span>
                </div>

                <input
                  type="text" placeholder="https://youtu.be/... or ..." value={houseData.videoUrl}
                  onChange={(e) => setHouseData({ ...houseData, videoUrl: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Description:</label>
            <button
              type="button"
              onClick={handleAiDescription}
              disabled={aiGenerating}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                color: '#fff', border: 'none', padding: '6px 12px',
                borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              {aiGenerating ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
              {aiGenerating ? 'Writing...' : '✨ Write Description with AI'}
            </button>
          </div>

          <textarea placeholder="Description..." rows="3" required value={houseData.description} onChange={(e) => setHouseData({ ...houseData, description: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #cbd5e1' }}></textarea>

          <button type="submit" className="btn-primary" disabled={loading || uploadProgress !== null} style={{ width: '100%', padding: '12px' }}>
            {loading ? 'Publishing...' : 'Publish Property to Cloud'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddHouse;