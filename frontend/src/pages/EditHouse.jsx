/* eslint-disable */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Image as ImageIcon, X, Loader2, ArrowLeft, Video, Calendar, Clock, Users2 
} from 'lucide-react';
import { uploadToCloudinary } from '../utils/uploadCloudinary';

const EditHouse = () => {
  const { id } = useParams();
  const { currentUser, lang } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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
    images: [],
    videoUrl: '' // 🎥 ویڈیو کا ڈیٹا
  });

  const currentUserId = currentUser?.id || currentUser?._id;

  // پہلے سے موجود گھر کا ڈیٹا لوڈ کریں
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const res = await axios.get(`https://house-rent-app-ten.vercel.app/api/houses/${id}`);
        const house = res.data;

        // سیکیورٹی چیک: صرف اصل مالک ہی ایڈٹ کر سکتا ہے
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
          availableFrom: house.availableFrom ? new Date(house.availableFrom).toISOString().split('T')[0] : '',
          availableTo: house.availableTo ? new Date(house.availableTo).toISOString().split('T')[0] : '',
          city: house.city || '',
          address: house.address || '',
          bedrooms: house.bedrooms || '',
          bathrooms: house.bathrooms || '',
          images: house.images || [],
          videoUrl: house.videoUrl || '' // پرانی ویڈیو سیٹ کی
        });
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchExistingData();
  }, [id, currentUserId]);

  // نئی تصاویر اپلوڈ کرنا (Cloudinary)
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

  // 🎥 نئی ویڈیو اپلوڈ کرنا
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

  // ❌ ویڈیو ڈیلیٹ / ریمو کرنے کا فنکشن
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

  // اپڈیٹ فارم سبمٹ کرنا
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      await axios.put(`https://house-rent-app-ten.vercel.app/api/houses/${id}`, {
        ...houseData,
        rentPrice: Number(houseData.rentPrice) || 0,
        pricePerDay: Number(houseData.pricePerDay) || 0,
        pricePerYear: Number(houseData.pricePerYear) || 0,
        bedrooms: Number(houseData.bedrooms),
        bathrooms: Number(houseData.bathrooms),
        userId: currentUserId,
        videoUrl: houseData.videoUrl // اپڈیٹ شدہ ویڈیو (یا خالی سٹرنگ اگر ڈیلیٹ کی ہو)
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

        {/* اپلوڈنگ پروگریس بار */}
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
              <input type="number" placeholder="Yearly Total in PKR"
                value={houseData.pricePerYear} onChange={(e) => setHouseData({ ...houseData, pricePerYear: e.target.value })}
                style={{ width: '100%', padding: '10px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            )}
          </div>

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

          {/* تصاویر کا سیکشن */}
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

          {/* ========================================================
             🎥 ویڈیو واک تھرو سیکشن (دیکھنا، نئی لگانا یا ڈیلیٹ کرنا)
             ======================================================== */}
          <div style={{ margin: '15px 0 20px', background: '#fef2f2', padding: '16px', borderRadius: '10px', border: '1.5px dashed #f87171' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Video size={18} color="#dc2626" />
              Property Video Walkthrough (ویڈیو تبدیل یا ڈیلیٹ کریں):
            </label>

            {/* اگر ویڈیو پہلے سے موجود ہو تو ویڈیو پلے ہوگی اور ڈیلیٹ بٹن آئے گا */}
            {houseData.videoUrl ? (
              <div style={{ marginTop: '10px', position: 'relative', background: '#000', borderRadius: '8px', padding: '10px' }}>
                <p style={{ color: '#fff', fontSize: '12px', margin: '0 0 6px' }}>Current Video Tour:</p>
                
                {houseData.videoUrl.startsWith('http') && !houseData.videoUrl.includes('youtu') ? (
                  <video src={houseData.videoUrl} controls style={{ width: '100%', maxHeight: '200px', borderRadius: '6px' }} />
                ) : (
                  <iframe src={houseData.videoUrl} style={{ width: '100%', height: '180px', border: 'none', borderRadius: '6px' }} />
                )}

                {/* ❌ ویڈیو ڈیلیٹ کرنے کا سرخ بٹن */}
                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  style={{
                    width: '100%',
                    marginTop: '10px',
                    padding: '8px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <X size={16} /> Remove / Delete Video (ویڈیو ڈیلیٹ کریں)
                </button>
              </div>
            ) : (
              /* اگر ویڈیو نہ ہو (یا ڈیلیٹ کر دی ہو) تو نئی ویڈیو اپلوڈ کرنے کا آپشن */
              <div>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={uploadProgress !== null}
                  style={{ padding: '8px', background: '#ffffff', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                />
                
                <p style={{ fontSize: '12px', color: '#475569', margin: '8px 0 4px', fontWeight: 'bold' }}>
                  OR Paste YouTube / Reels Video Link:
                </p>
                <input
                  type="text"
                  placeholder="https://youtu.be/... or video link"
                  value={houseData.videoUrl}
                  onChange={(e) => setHouseData({ ...houseData, videoUrl: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
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