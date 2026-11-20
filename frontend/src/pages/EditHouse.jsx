/* eslint-disable */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Image as ImageIcon, X, Loader2, ArrowLeft, Video, Calendar, Users, MapPin 
} from 'lucide-react';
import { uploadToCloudinary } from '../utils/uploadCloudinary';
import { getLiveLocation } from '../utils/getLiveLocation';

const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://house-rent-app-ten.vercel.app';

const EditHouse = () => {
  const { id } = useParams();
  const { currentUser, lang } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [locating, setLocating] = useState(false);

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
    images: [],
    videoUrl: '',
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

  const currentUserId = currentUser?.id || currentUser?._id;

  // پہلے سے موجود گھر کا ڈیٹا لوڈ کریں
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/houses/${id}`);
        const house = res.data;

        const houseOwnerId = house.owner?._id || house.owner;
        if (houseOwnerId && currentUserId && String(houseOwnerId) !== String(currentUserId)) {
          alert(lang === 'en' ? 'You are not allowed to edit this property!' : 'آپ اس گھر کو تبدیل نہیں کر سکتے!');
          navigate('/');
          return;
        }

        setHouseData({
          title: house.title || '',
          description: house.description || '',
          rentPrice: house.rentPrice || '',
          pricePerDay: house.pricePerDay || '',
          pricePerYear: house.pricePerYear || '',
          availableFor: house.availableFor || ['monthly'],
          suitableFor: house.suitableFor || 'both',
          isShared: Boolean(house.isShared),
          totalBeds: house.totalBeds || 2,
          sharedGender: house.sharedGender || 'boys',
          availableFrom: house.availableFrom ? new Date(house.availableFrom).toISOString().split('T')[0] : '',
          availableTo: house.availableTo ? new Date(house.availableTo).toISOString().split('T')[0] : '',
          city: house.city || '',
          address: house.address || '',
          bedrooms: house.bedrooms || '',
          bathrooms: house.bathrooms || '',
          images: house.images || [],
          videoUrl: house.videoUrl || '',
          nearLandmark: house.nearLandmark || '',
          utilities: {
            separateMeter: Boolean(house.utilities?.separateMeter),
            solarOrUps: Boolean(house.utilities?.solarOrUps),
            suiGas: Boolean(house.utilities?.suiGas),
            water24x7: Boolean(house.utilities?.water24x7),
            wifi: Boolean(house.utilities?.wifi),
            parking: Boolean(house.utilities?.parking),
          },
        });
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchExistingData();
  }, [id, currentUserId]);

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
    setHouseData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 60 * 1024 * 1024) {
      alert('Video file is over 60MB! Please compress it via WhatsApp or select a smaller video.');
      return;
    }

    setUploadProgress(1);
    try {
      const videoUrl = await uploadToCloudinary(file, 'video', (percent) => {
        setUploadProgress(percent);
      });
      setHouseData(prev => ({ ...prev, videoUrl }));
      alert('New video uploaded to Cloud successfully! 🎥✅');
    } catch (err) {
      alert('Video Upload Error: ' + err.message);
    } finally {
      setUploadProgress(null);
    }
  };

  const handleRemoveVideo = () => {
    if (window.confirm(lang === 'en' ? 'Are you sure you want to remove the video tour?' : 'کیا آپ واقعی ویڈیو ٹور ڈیلیٹ کرنا چاہتے ہیں؟')) {
      setHouseData(prev => ({ ...prev, videoUrl: '' }));
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      await axios.put(`${API_URL}/api/houses/${id}`, {
        ...houseData,
        rentPrice: Number(houseData.rentPrice) || 0,
        pricePerDay: Number(houseData.pricePerDay) || 0,
        pricePerYear: Number(houseData.pricePerYear) || 0,
        bedrooms: Number(houseData.bedrooms),
        bathrooms: Number(houseData.bathrooms),
        totalBeds: houseData.isShared ? Number(houseData.totalBeds) || 2 : 1,
        pricePerPerson: splitRentPerPerson,
        userId: currentUserId,
        videoUrl: houseData.videoUrl,
      });

      alert(lang === 'en' ? 'Property updated successfully! ✏️' : 'گھر کی تفصیلات اور ویڈیو کامیابی سے تبدیل ہو گئیں! ✏️');
      navigate(`/house/${id}`);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

  return (
    <div className="container" style={{ maxWidth: '650px', marginTop: '30px' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold', marginBottom: '15px' }}>
        <ArrowLeft size={18} /> {lang === 'en' ? 'Cancel & Go Back' : 'منسوخ کریں اور واپس جائیں'}
      </button>

      <div className="house-card" style={{ padding: '30px' }}>
        <h2 style={{ marginBottom: '15px' }}>{lang === 'en' ? 'Edit Property & Video ✏️' : 'گھر اور ویڈیو کی تفصیلات تبدیل کریں ✏️'}</h2>

        {uploadProgress !== null && (
          <div style={{ background: '#eff6ff', color: '#1e40af', padding: '12px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #bfdbfe' }}>
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

        <form onSubmit={handleUpdate}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Title:</label>
          <input type="text" required value={houseData.title}
            onChange={(e) => setHouseData({ ...houseData, title: e.target.value })}
            style={{ width: '100%', padding: '10px', margin: '4px 0 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />

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
              <input type="number" placeholder="Yearly Total in PKR"
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
                onChange={(e) => setHouseData({ ...houseData, isShared: e.target.checked })}
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
                    💡 Auto Split Rent: PKR {splitRentPerPerson.toLocaleString()} / person per month
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 📍 Live Location Auto-Fill بٹن */}
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
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>City:</label>
              <input type="text" required value={houseData.city}
                onChange={(e) => setHouseData({ ...houseData, city: e.target.value })}
                style={{ width: '100%', padding: '10px', margin: '4px 0 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Address:</label>
              <input type="text" required value={houseData.address}
                onChange={(e) => setHouseData({ ...houseData, address: e.target.value })}
                style={{ width: '100%', padding: '10px', margin: '4px 0 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Bedrooms:</label>
              <input type="number" required value={houseData.bedrooms}
                onChange={(e) => setHouseData({ ...houseData, bedrooms: e.target.value })}
                style={{ width: '100%', padding: '10px', margin: '4px 0 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Bathrooms:</label>
              <input type="number" required value={houseData.bathrooms}
                onChange={(e) => setHouseData({ ...houseData, bathrooms: e.target.value })}
                style={{ width: '100%', padding: '10px', margin: '4px 0 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', display: 'block', marginBottom: '10px' }}>
              ⚡ Utilities & Facilities:
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
              type="text" placeholder="📍 Nearby University / Metro / Landmark" value={houseData.nearLandmark}
              onChange={(e) => setHouseData({ ...houseData, nearLandmark: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>

          <div style={{ margin: '10px 0 15px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>
              <ImageIcon size={16} style={{ verticalAlign: 'middle', marginInlineEnd: '4px' }} />
              Photos (Add / Delete):
            </label>
            <input type="file" accept="image/*" multiple onChange={handleMultipleImages} disabled={uploadProgress !== null}
              style={{ padding: '8px', border: '1.5px dashed #2563eb', background: '#eff6ff', width: '100%', borderRadius: '6px', cursor: 'pointer' }} />

            {houseData.images.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))', gap: '8px', marginTop: '10px' }}>
                {houseData.images.map((img, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img src={img} alt={`Preview ${index}`} style={{ width: '100%', height: '75px', objectFit: 'cover', borderRadius: '6px' }} />
                    <button type="button" onClick={() => removeImage(index)}
                      style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(220, 38, 38, 0.85)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ margin: '15px 0 20px', background: '#fef2f2', padding: '16px', borderRadius: '10px', border: '1.5px dashed #f87171' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Video size={18} color="#dc2626" />
              Property Video Walkthrough (ویڈیو تبدیل یا ڈیلیٹ کریں):
            </label>

            {houseData.videoUrl ? (
              <div style={{ marginTop: '10px', position: 'relative', background: '#000', borderRadius: '8px', padding: '10px' }}>
                <p style={{ color: '#fff', fontSize: '12px', margin: '0 0 6px' }}>Current Video Tour:</p>
                
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
                  <video src={houseData.videoUrl} controls style={{ width: '100%', maxHeight: '200px', borderRadius: '6px' }} />
                )}

                <button
                  type="button" onClick={handleRemoveVideo}
                  style={{
                    width: '100%', marginTop: '10px', padding: '8px', background: '#dc2626', color: 'white',
                    border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <X size={16} /> Remove / Delete Video (ویڈیو ڈیلیٹ کریں)
                </button>
              </div>
            ) : (
              <div>
                <input type="file" accept="video/*" onChange={handleVideoUpload} disabled={uploadProgress !== null}
                  style={{ padding: '8px', background: '#ffffff', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }} />
                
                <p style={{ fontSize: '12px', color: '#475569', margin: '8px 0 4px', fontWeight: 'bold' }}>
                  OR Paste YouTube / Reels Video Link:
                </p>
                <input type="text" placeholder="https://youtu.be/... or video link" value={houseData.videoUrl}
                  onChange={(e) => setHouseData({ ...houseData, videoUrl: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
            )}
          </div>

          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Description:</label>
          <textarea rows="3" required value={houseData.description}
            onChange={(e) => setHouseData({ ...houseData, description: e.target.value })}
            style={{ width: '100%', padding: '10px', margin: '4px 0 15px', borderRadius: '6px', border: '1px solid #cbd5e1' }}></textarea>

          <button type="submit" className="btn-primary" disabled={loading || uploadProgress !== null}
            style={{ width: '100%', padding: '12px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {loading ? <><Loader2 size={18} className="spin" /> Updating...</> : 'Save & Update Property'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditHouse;