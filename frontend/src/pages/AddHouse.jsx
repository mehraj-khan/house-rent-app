/* eslint-disable */
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Image as ImageIcon, X, Calendar, Users2, Clock } from 'lucide-react';

const AddHouse = () => {
  const { currentUser, lang } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [houseData, setHouseData] = useState({
    title: '', description: '', city: '', address: '', bedrooms: '', bathrooms: '',
    rentPrice: '', pricePerDay: '', pricePerYear: '',
    availableFor: ['monthly', 'daily'],
    suitableFor: 'both',
    availableFrom: '', // شروع کی تاریخ
    availableTo: '',   // ختم ہونے کی تاریخ (اختیاری)
    images: []
  });

  const todayStr = new Date().toISOString().split('T')[0];

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

  const toggleAvailableFor = (type) => {
    setHouseData(prev => {
      const exists = prev.availableFor.includes(type);
      return { ...prev, availableFor: exists ? prev.availableFor.filter(t => t !== type) : [...prev.availableFor, type] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert(lang === 'en' ? 'Log in first as a Landlord!' : 'پہلے لاگ ان کریں!');
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

      alert(lang === 'en' ? 'Property published with specific availability dates! 🏠🎉' : 'گھر مخصوص دستیابی کی تاریخوں کے ساتھ لسٹ ہو گیا! 🏠🎉');
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
        <h2 style={{ marginBottom: '15px' }}>{lang === 'en' ? 'List Property with Custom Available Dates 🏠' : 'مخصوص تاریخوں کے ساتھ کمرہ یا مکان لسٹ کریں 🏠'}</h2>

        <form onSubmit={handleSubmit}>
          <input type="text" placeholder={lang === 'en' ? 'Title (e.g. Guest Room / Luxury Suite)' : 'عنوان (مثلاً گیسٹ روم یا ولا)'} required
            value={houseData.title} onChange={(e) => setHouseData({ ...houseData, title: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />

          {/* 📅 مالک کی دستیابی کی تاریخیں (Host Custom Calendar Window) */}
          <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '8px', border: '1.5px solid #bfdbfe', marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Clock size={16} />
              {lang === 'en' ? 'When is this space available? (Host Availability Range):' : 'یہ جگہ کب سے کب تک دستیاب ہے؟'}
            </label>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '140px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  AVAILABLE FROM (کس تاریخ سے):
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={houseData.availableFrom}
                  onChange={(e) => setHouseData({ ...houseData, availableFrom: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>

              <div style={{ flex: 1, minWidth: '140px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  AVAILABLE TO (کس تاریخ تک - اختیاری):
                </label>
                <input
                  type="date"
                  min={houseData.availableFrom || todayStr}
                  value={houseData.availableTo}
                  onChange={(e) => setHouseData({ ...houseData, availableTo: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
            </div>
            <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
              * اگر آپ اسے مستقل دینا چاہتے ہیں تو "Available To" کو خالی چھوڑ دیں۔
            </p>
          </div>

          {/* کرائے کی مدت */}
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

          {/* تصاویر */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>Photos:</label>
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