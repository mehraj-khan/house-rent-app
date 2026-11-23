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

      setHouseData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
    } catch (err) {
      alert('Upload Error: ' + err.message);
    } finally {
      setUploadProgress(null);
    }
  };

  const removeImage = (indexToRemove) => {
    setHouseData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
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
      setHouseData((prev) => ({ ...prev, videoUrl }));
      alert('Video uploaded successfully to Cloud! 🎥✅');
    } catch (err) {
      alert('Video Upload Error: ' + err.message);
    } finally {
      setUploadProgress(null);
    }
  };

  const toggleAvailableFor = (type) => {
    setHouseData((prev) => {
      const exists = prev.availableFor.includes(type);
      return {
        ...prev,
        availableFor: exists
          ? prev.availableFor.filter((t) => t !== type)
          : [...prev.availableFor, type],
      };
    });
  };

  const toggleUtility = (key) => {
    setHouseData((prev) => ({
      ...prev,
      utilities: { ...prev.utilities, [key]: !prev.utilities[key] },
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
    <div className="ah-wrapper">
      <style>{`
        .ah-wrapper {
          width: 100%;
          max-width: 680px;
          margin: 24px auto 80px;
          padding: 0 16px;
          box-sizing: border-box;
        }
        .ah-wrapper *, .ah-wrapper *::before, .ah-wrapper *::after {
          box-sizing: border-box;
        }
        .ah-card {
          padding: 28px;
          border-radius: 14px;
        }
        .ah-title {
          margin: 0 0 18px;
          font-size: 22px;
          line-height: 1.3;
          color: #0f172a;
        }
        .ah-input {
          width: 100%;
          padding: 11px 12px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 16px;
          background: #ffffff;
          color: #0f172a;
          outline: none;
        }
        .ah-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }
        .ah-box {
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 14px;
        }
        .ah-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 12px;
        }
        .ah-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .ah-pill-btn {
          padding: 9px 10px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          font-size: 13px;
          min-height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          transition: all 0.15s ease;
        }
        .ah-utilities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 170px), 1fr));
          gap: 8px;
          margin-bottom: 12px;
        }
        .ah-images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
          gap: 8px;
          margin-top: 10px;
        }
        .ah-video-frame {
          width: 100%;
          aspect-ratio: 16 / 9;
          border: none;
          border-radius: 8px;
          background: #000;
          display: block;
        }
        .ah-desc-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 8px;
        }
        .ah-submit-btn {
          width: 100%;
          padding: 13px 16px;
          min-height: 48px;
          font-size: 16px;
          font-weight: 700;
          border-radius: 10px;
          cursor: pointer;
        }
        @keyframes ah-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .ah-wrapper .spin {
          animation: ah-spin 1s linear infinite;
        }

        @media (max-width: 520px) {
          .ah-wrapper {
            margin: 14px auto 76px;
            padding: 0 12px;
          }
          .ah-card {
            padding: 16px;
          }
          .ah-title {
            font-size: 18px;
            margin-bottom: 14px;
          }
          .ah-grid-2 {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .ah-grid-3 {
            grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
          }
          .ah-pill-btn {
            font-size: 12px;
            padding: 8px 6px;
          }
        }
      `}</style>

      <div className="house-card ah-card">
        <h2 className="ah-title">List Property with Video &amp; Cloud Storage 🏠</h2>

        {uploadProgress !== null && (
          <div
            style={{
              background: '#eff6ff',
              color: '#1e40af',
              padding: '12px 14px',
              borderRadius: '10px',
              marginBottom: '14px',
              border: '1px solid #bfdbfe',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px',
                fontWeight: 'bold',
                fontSize: '13px',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Loader2 className="spin" size={16} /> Fast Cloud Uploading...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div
              style={{
                width: '100%',
                height: '8px',
                background: '#dbeafe',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${uploadProgress}%`,
                  height: '100%',
                  background: '#2563eb',
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title (e.g. 2-Bed Luxury Suite / Shared Student Room)"
            required
            value={houseData.title}
            onChange={(e) => setHouseData({ ...houseData, title: e.target.value })}
            className="ah-input"
            style={{ marginBottom: '12px' }}
          />

          {/* Availability Dates */}
          <div
            className="ah-box"
            style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe' }}
          >
            <label
              style={{
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#1e40af',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '10px',
              }}
            >
              <Clock size={16} style={{ flexShrink: 0 }} /> When is this space available?
            </label>

            <div className="ah-grid-2" style={{ marginBottom: 0 }}>
              <div style={{ minWidth: 0 }}>
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#475569',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  AVAILABLE FROM:
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={houseData.availableFrom}
                  onChange={(e) =>
                    setHouseData({ ...houseData, availableFrom: e.target.value })
                  }
                  className="ah-input"
                  style={{ padding: '9px 10px' }}
                />
              </div>

              <div style={{ minWidth: 0 }}>
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#475569',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  AVAILABLE TO (Optional):
                </label>
                <input
                  type="date"
                  min={houseData.availableFrom || todayStr}
                  value={houseData.availableTo}
                  onChange={(e) =>
                    setHouseData({ ...houseData, availableTo: e.target.value })
                  }
                  className="ah-input"
                  style={{ padding: '9px 10px' }}
                />
              </div>
            </div>
          </div>

          {/* Rental Rates */}
          <div
            className="ah-box"
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
          >
            <label
              style={{
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '10px',
              }}
            >
              <Calendar size={15} /> Rental Rates:
            </label>

            <div className="ah-grid-3" style={{ marginBottom: '10px' }}>
              {['daily', 'monthly', 'yearly'].map((type) => {
                const selected = houseData.availableFor.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleAvailableFor(type)}
                    className="ah-pill-btn"
                    style={{
                      border: selected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: selected ? '#eff6ff' : '#fff',
                      color: selected ? '#2563eb' : '#64748b',
                      textTransform: 'capitalize',
                    }}
                  >
                    ✓ {type}
                  </button>
                );
              })}
            </div>

            {houseData.availableFor.includes('daily') && (
              <input
                type="number"
                placeholder="Daily Rate (PKR/night)"
                required
                value={houseData.pricePerDay}
                onChange={(e) =>
                  setHouseData({ ...houseData, pricePerDay: e.target.value })
                }
                className="ah-input"
                style={{ marginBottom: '8px' }}
              />
            )}
            {houseData.availableFor.includes('monthly') && (
              <input
                type="number"
                placeholder="Monthly Rent (PKR/month)"
                required
                value={houseData.rentPrice}
                onChange={(e) =>
                  setHouseData({ ...houseData, rentPrice: e.target.value })
                }
                className="ah-input"
                style={{ marginBottom: '8px' }}
              />
            )}
            {houseData.availableFor.includes('yearly') && (
              <input
                type="number"
                placeholder="Yearly Total in PKR (Optional)"
                value={houseData.pricePerYear}
                onChange={(e) =>
                  setHouseData({ ...houseData, pricePerYear: e.target.value })
                }
                className="ah-input"
              />
            )}
          </div>

          {/* Suitable For */}
          <div className="ah-grid-3" style={{ marginBottom: '14px' }}>
            {['family', 'bachelors', 'both'].map((s) => {
              const active = houseData.suitableFor === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setHouseData({ ...houseData, suitableFor: s })}
                  className="ah-pill-btn"
                  style={{
                    border: active ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: active ? '#eff6ff' : '#fff',
                    color: active ? '#2563eb' : '#64748b',
                  }}
                >
                  {s === 'family'
                    ? '👨‍👩‍👧‍👦 Family'
                    : s === 'bachelors'
                      ? '👤 Bachelors'
                      : '🤝 Both'}
                </button>
              );
            })}
          </div>

          {/* Shared Room / Hostel */}
          <div
            className="ah-box"
            style={{
              background: houseData.isShared ? '#f0fdf4' : '#f8fafc',
              border: houseData.isShared ? '1.5px solid #22c55e' : '1px solid #cbd5e1',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#0f172a',
                lineHeight: '1.4',
              }}
            >
              <input
                type="checkbox"
                checked={houseData.isShared}
                onChange={(e) =>
                  setHouseData((prev) => ({
                    ...prev,
                    isShared: e.target.checked,
                    suitableFor:
                      e.target.checked && prev.suitableFor === 'family'
                        ? 'bachelors'
                        : prev.suitableFor,
                  }))
                }
                style={{
                  width: '18px',
                  height: '18px',
                  marginTop: '2px',
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
              />
              <Users size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                {lang === 'en'
                  ? '🎓 Allow Shared Room / Hostel / Roommates (Split Rent)'
                  : '🎓 مشترکہ کمرہ / ہاسٹل / روم میٹ (Split Rent) کی اجازت دیں'}
              </span>
            </label>

            {houseData.isShared && (
              <div
                style={{
                  marginTop: '14px',
                  paddingTop: '12px',
                  borderTop: '1px solid #bbf7d0',
                }}
              >
                <label
                  style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#166534',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Sharing Preference:
                </label>
                <div className="ah-grid-3" style={{ marginBottom: '12px' }}>
                  {[
                    { value: 'boys', label: '👨 Boys / Male' },
                    { value: 'girls', label: '👩 Girls / Female' },
                    { value: 'any', label: '🤝 Anyone' },
                  ].map((g) => {
                    const active = houseData.sharedGender === g.value;
                    return (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() =>
                          setHouseData({ ...houseData, sharedGender: g.value })
                        }
                        className="ah-pill-btn"
                        style={{
                          border: active ? '2px solid #16a34a' : '1px solid #cbd5e1',
                          background: active ? '#dcfce7' : '#fff',
                          color: active ? '#15803d' : '#64748b',
                        }}
                      >
                        {g.label}
                      </button>
                    );
                  })}
                </div>

                <label
                  style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#166534',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Split Rent Between (Total Persons):
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={houseData.totalBeds}
                  onChange={(e) =>
                    setHouseData({ ...houseData, totalBeds: e.target.value })
                  }
                  className="ah-input"
                  style={{ borderColor: '#86efac' }}
                />

                {splitRentPerPerson > 0 && (
                  <div
                    style={{
                      marginTop: '10px',
                      background: '#dcfce7',
                      color: '#14532d',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      lineHeight: '1.4',
                    }}
                  >
                    💡 Auto Split Rent: PKR {splitRentPerPerson.toLocaleString()} / person
                    per month ({houseData.totalBeds} roommates)
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Live Location */}
          <button
            type="button"
            onClick={handleLiveLocation}
            disabled={locating}
            style={{
              width: '100%',
              padding: '11px 12px',
              marginBottom: '12px',
              borderRadius: '8px',
              border: '1.5px solid #2563eb',
              background: '#eff6ff',
              color: '#1d4ed8',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              minHeight: '42px',
              textAlign: 'center',
            }}
          >
            <MapPin size={16} style={{ flexShrink: 0 }} />
            <span>
              {locating
                ? 'Detecting Live Location...'
                : '📍 Use My Live Location (Auto-Fill City & Address)'}
            </span>
          </button>

          {/* City & Address */}
          <div className="ah-grid-2">
            <input
              type="text"
              placeholder="City"
              required
              value={houseData.city}
              onChange={(e) => setHouseData({ ...houseData, city: e.target.value })}
              className="ah-input"
            />
            <input
              type="text"
              placeholder="Address"
              required
              value={houseData.address}
              onChange={(e) => setHouseData({ ...houseData, address: e.target.value })}
              className="ah-input"
            />
          </div>

          {/* Bedrooms & Bathrooms */}
          <div className="ah-grid-2">
            <input
              type="number"
              placeholder="Bedrooms"
              required
              value={houseData.bedrooms}
              onChange={(e) => setHouseData({ ...houseData, bedrooms: e.target.value })}
              className="ah-input"
            />
            <input
              type="number"
              placeholder="Bathrooms"
              required
              value={houseData.bathrooms}
              onChange={(e) => setHouseData({ ...houseData, bathrooms: e.target.value })}
              className="ah-input"
            />
          </div>

          {/* Photos Upload */}
          <div style={{ marginBottom: '14px' }}>
            <label
              style={{
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#475569',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              Photos (Fast Cloud Upload):
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleMultipleImages}
              disabled={uploadProgress !== null}
              style={{
                padding: '10px',
                border: '1.5px dashed #2563eb',
                background: '#eff6ff',
                width: '100%',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            />

            {houseData.images.length > 0 && (
              <div className="ah-images-grid">
                {houseData.images.map((img, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img
                      src={img}
                      alt={`Preview ${index}`}
                      style={{
                        width: '100%',
                        height: '76px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        display: 'block',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      aria-label="Remove image"
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'rgba(220, 38, 38, 0.9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Utilities */}
          <div
            className="ah-box"
            style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}
          >
            <label
              style={{
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#0f172a',
                display: 'block',
                marginBottom: '10px',
                lineHeight: '1.4',
              }}
            >
              ⚡ Utilities &amp; Facilities (سچائی بتائیں — یوزرز کا اعتماد بڑھتا ہے):
            </label>

            <div className="ah-utilities-grid">
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
                    key={u.key}
                    type="button"
                    onClick={() => toggleUtility(u.key)}
                    style={{
                      padding: '10px 10px',
                      minHeight: '40px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      textAlign: 'left',
                      border: active ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: active ? '#eff6ff' : '#ffffff',
                      color: active ? '#1d4ed8' : '#475569',
                    }}
                  >
                    {active ? '✅ ' : ''}
                    {u.label}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              placeholder="📍 Nearby University / Metro / Landmark (e.g. 5 min from FAST)"
              value={houseData.nearLandmark}
              onChange={(e) =>
                setHouseData({ ...houseData, nearLandmark: e.target.value })
              }
              className="ah-input"
            />
          </div>

          {/* Video Walkthrough */}
          <div
            className="ah-box"
            style={{
              background: '#fef2f2',
              border: '1.5px dashed #f87171',
              marginBottom: '16px',
            }}
          >
            <label
              style={{
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#991b1b',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '10px',
                lineHeight: '1.4',
              }}
            >
              <Video size={18} color="#dc2626" style={{ flexShrink: 0 }} />
              <span>Property Video Walkthrough (Choose File OR Paste Video Link):</span>
            </label>

            {houseData.videoUrl ? (
              <div
                style={{
                  marginTop: '10px',
                  position: 'relative',
                  background: '#000',
                  borderRadius: '10px',
                  padding: '10px',
                }}
              >
                <p style={{ color: '#fff', fontSize: '12px', margin: '0 0 8px' }}>
                  Selected Video Preview:
                </p>

                {houseData.videoUrl.includes('youtu') ? (
                  <iframe
                    title="Property video preview"
                    allowFullScreen
                    src={
                      houseData.videoUrl.includes('youtu.be')
                        ? `https://www.youtube.com/embed/${houseData.videoUrl.split('/').pop().split('?')[0]}`
                        : houseData.videoUrl.includes('shorts')
                          ? `https://www.youtube.com/embed/${houseData.videoUrl.split('shorts/')[1]?.split('?')[0]}`
                          : `https://www.youtube.com/embed/${houseData.videoUrl.split('watch?v=')[1]?.split('&')[0]}`
                    }
                    className="ah-video-frame"
                  />
                ) : (
                  <video
                    src={houseData.videoUrl}
                    controls
                    className="ah-video-frame"
                  />
                )}

                <button
                  type="button"
                  onClick={() => setHouseData({ ...houseData, videoUrl: '' })}
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '10px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <X size={15} /> Remove Video (ویڈیو ہٹائیں)
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={uploadProgress !== null}
                  style={{
                    padding: '10px',
                    background: '#ffffff',
                    width: '100%',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                />

                <div
                  style={{
                    margin: '12px 0 8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ flex: 1, height: '1px', background: '#cbd5e1' }} />
                  <span>OR PASTE VIDEO LINK (YouTube / Shorts)</span>
                  <span style={{ flex: 1, height: '1px', background: '#cbd5e1' }} />
                </div>

                <input
                  type="text"
                  placeholder="https://youtu.be/... or ..."
                  value={houseData.videoUrl}
                  onChange={(e) =>
                    setHouseData({ ...houseData, videoUrl: e.target.value })
                  }
                  className="ah-input"
                />
              </div>
            )}
          </div>

          {/* Description + AI */}
          <div className="ah-desc-header">
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>
              Description:
            </label>
            <button
              type="button"
              onClick={handleAiDescription}
              disabled={aiGenerating}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                color: '#fff',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              {aiGenerating ? (
                <Loader2 size={14} className="spin" />
              ) : (
                <Sparkles size={14} />
              )}
              {aiGenerating ? 'Writing...' : '✨ Write Description with AI'}
            </button>
          </div>

          <textarea
            placeholder="Description..."
            rows="3"
            required
            value={houseData.description}
            onChange={(e) =>
              setHouseData({ ...houseData, description: e.target.value })
            }
            className="ah-input"
            style={{ marginBottom: '16px', resize: 'vertical' }}
          />

          <button
            type="submit"
            className="btn-primary ah-submit-btn"
            disabled={loading || uploadProgress !== null}
          >
            {loading ? 'Publishing...' : 'Publish Property to Cloud'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddHouse;