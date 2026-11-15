/* eslint-disable */
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Image as ImageIcon, X, Calendar, Clock, Video, Loader2 } from 'lucide-react';
import { uploadToCloudinary } from '../utils/uploadCloudinary';

const AddHouse = () => {
  const { currentUser, lang } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

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
    availableFrom: '', 
    availableTo: '',
    videoUrl: '', // 👈 ویڈیو فائل یا یوٹیوب لنک
    images: []
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. تصاویر اپلوڈ کرنا (Cloudinary)
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

  // 2. ویڈیو فائل اپلوڈ کرنا (Cloudinary)
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
      await axios.post('https://house-rent-app-ten.vercel.app/api/houses/add', {
        ...houseData,
        rentPrice: Number(houseData.rentPrice) || 0,
        pricePerDay: Number(houseData.pricePerDay) || 0,
        pricePerYear: Number(houseData.pricePerYear) || 0,
        bedrooms: Number(houseData.bedrooms),
        bathrooms: Number(houseData.bathrooms),
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

        {/* اپلوڈنگ پروگریس بار */}
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
          <input type="text" placeholder="Title (e.g. 2-Bed Luxury Suite / Room)" required
            value={houseData.title} onChange={(e) => setHouseData({ ...houseData, title: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />

          {/* دستیابی کی تاریخیں */}
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

          {/* کرائے کے ریٹس */}
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

          {/* فیملی / بیچلر */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['family', 'bachelors', 'both'].map(s => (
              <button key={s} type="button" onClick={() => setHouseData({ ...houseData, suitableFor: s })}
                style={{ flex: 1, padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', border: houseData.suitableFor === s ? '2px solid #2563eb' : '1px solid #cbd5e1', background: houseData.suitableFor === s ? '#eff6ff' : '#fff', color: houseData.suitableFor === s ? '#2563eb' : '#64748b', textTransform: 'capitalize' }}>
                {s === 'family' ? '👨‍👩‍👧‍👦 Family' : s === 'bachelors' ? '👤 Bachelors' : '🤝 Both'}
              </button>
            ))}
          </div>

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

          {/* تصاویر کا باکس */}
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

          {/* ========================================================
             🎥 ویڈیو واک تھرو (فائل اپلوڈ اور یوٹیوب لنک دونوں آپشنز)
             ======================================================== */}
          <div style={{ marginBottom: '18px', background: '#fef2f2', padding: '16px', borderRadius: '10px', border: '1.5px dashed #f87171' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Video size={18} color="#dc2626" />
              Property Video Walkthrough (Choose File OR Paste Video Link):
            </label>

            {/* اگر ویڈیو پہلے سے شامل ہو تو پلیئر اور ریمو بٹن */}
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
                  type="button"
                  onClick={() => setHouseData({ ...houseData, videoUrl: '' })}
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
              /* اگر ویڈیو شامل نہ ہو تو فائل اور لنک دونوں آپشنز */
              <div>
                {/* آپشن 1: گیلری سے فائل چنیں */}
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={uploadProgress !== null}
                  style={{ padding: '8px', background: '#ffffff', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                />
                
                {/* آپشن 2: یا یوٹیوب کا لنک لگائیں */}
                <div style={{ margin: '10px 0 6px', fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ flex: 1, height: '1px', background: '#cbd5e1' }}></span>
                  <span>OR PASTE VIDEO LINK (YouTube / Shorts / Reels)</span>
                  <span style={{ flex: 1, height: '1px', background: '#cbd5e1' }}></span>
                </div>

                <input
                  type="text"
                  placeholder="https://youtu.be/... or https://youtube.com/shorts/..."
                  value={houseData.videoUrl}
                  onChange={(e) => setHouseData({ ...houseData, videoUrl: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
                <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  * بڑی ویڈیوز کے لیے یوٹیوب شارٹس کا لنک لگانا سب سے تیز اور بہترین طریقہ ہے (0 سیکنڈ لوڈنگ)!
                </p>
              </div>
            )}
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