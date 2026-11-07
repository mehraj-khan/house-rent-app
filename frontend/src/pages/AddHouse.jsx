/* eslint-disable */
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Image as ImageIcon, X, Calendar, Clock, Video } from 'lucide-react';

const AddHouse = () => {
  const { currentUser, lang } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
    videoUrl: '', // 👈 ویڈیو فائل کا ڈیٹا
    images: []
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. تصاویر لوڈ کرنا
  const handleMultipleImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const readers = files.map(file => {
        return new Promise(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });
      Promise.all(readers).then(imagesBase64 => {
        setHouseData(prev => ({ ...prev, images: [...prev.images, ...imagesBase64] }));
      });
    }
  };

  const removeImage = (indexToRemove) => {
    setHouseData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== indexToRemove) }));
  };

  // 2. 🎥 گیلری یا کمپیوٹر سے ویڈیو فائل لوڈ کرنے کا فنکشن
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // سائز چیک (فری سرور کے لیے فی الحال 15 MB سے چھوٹی ویڈیو)
      if (file.size > 15 * 1024 * 1024) {
        alert('Please select a short video clip under 15MB!');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setHouseData(prev => ({ ...prev, videoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
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

    setLoading(true);
    try {
      await axios.post('https://house-rent-app-ten.vercel.app/api/houses/add', {
        ...houseData,
        rentPrice: Number(houseData.rentPrice) || 0,
        pricePerDay: Number(houseData.pricePerDay) || 0,
        pricePerYear: Number(houseData.pricePerYear) || 0,
        bedrooms: Number(houseData.bedrooms),
        bathrooms: Number(houseData.bathrooms),
        images: houseData.images.length > 0 ? houseData.images : ['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600'],
        owner: currentUser?.id || currentUser?._id,
      });

      alert('Property published successfully with video tour! 🏠🎉');
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
        <h2 style={{ marginBottom: '15px' }}>List Property with Video Tour 🏠</h2>

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
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>Photos (Multiple Allowed):</label>
            <input type="file" accept="image/*" multiple onChange={handleMultipleImages}
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

          {/* 🎥 گیلری سے ویڈیو فائل اپلوڈ کرنے کا نیا باکس */}
          <div style={{ marginBottom: '18px', background: '#fef2f2', padding: '14px', borderRadius: '8px', border: '1.5px dashed #f87171' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Video size={18} color="#dc2626" />
              Upload Video Walkthrough from Gallery/Files (موبائل گیلری یا کمپیوٹر سے ویڈیو فائل منتخب کریں):
            </label>
            
            <input
              type="file"
              accept="video/*" // 👈 ڈائریکٹ ویڈیو فائلز
              onChange={handleVideoUpload}
              style={{ padding: '8px', background: '#ffffff', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
            />
            
            <p style={{ fontSize: '11px', color: '#7f1d1d', marginTop: '5px' }}>
              * اپنے موبائل کے کیمرے سے کمرے کی 10 سے 20 سیکنڈ کی ویڈیو فائل منتخب کریں۔
            </p>

            {/* ویڈیو منتخب ہونے پر لائیو پریویو */}
            {houseData.videoUrl && (
              <div style={{ marginTop: '10px', position: 'relative' }}>
                <video
                  src={houseData.videoUrl}
                  controls
                  style={{ width: '100%', maxHeight: '180px', borderRadius: '6px', background: '#000' }}
                />
                <button
                  type="button"
                  onClick={() => setHouseData({ ...houseData, videoUrl: '' })}
                  style={{ position: 'absolute', top: '6px', right: '6px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Remove Video
                </button>
              </div>
            )}
          </div>

          <textarea placeholder="Description..." rows="3" required value={houseData.description} onChange={(e) => setHouseData({ ...houseData, description: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #cbd5e1' }}></textarea>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '12px' }}>
            {loading ? 'Submitting...' : 'Publish Property'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddHouse;