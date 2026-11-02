/* eslint-disable */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Image as ImageIcon, X, Loader2, ArrowLeft } from 'lucide-react';

const EditHouse = () => {
  const { id } = useParams();
  const { currentUser, lang } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [houseData, setHouseData] = useState({
    title: '', description: '', rentPrice: '', city: '', address: '', bedrooms: '', bathrooms: '',
    images: []
  });

  const currentUserId = currentUser?.id || currentUser?._id;

  // پہلے سے موجود گھر کا ڈیٹا لوڈ کریں
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const res = await axios.get(`https://house-rent-app-ten.vercel.app/api/houses/${id}`);
        const house = res.data;

        // سیکیورٹی چیک: اگر کوئی غیر متعلقہ شخص یو آر ایل کھول لے تو واپس بھیج دیں
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
          city: house.city || '',
          address: house.address || '',
          bedrooms: house.bedrooms || '',
          bathrooms: house.bathrooms || '',
          images: house.images || []
        });
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchExistingData();
  }, [id, currentUserId]);

  // نئی تصاویر کا اضافہ
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
        setHouseData(prev => ({
          ...prev,
          images: [...prev.images, ...imagesBase64]
        }));
      });
    }
  };

  // کسی تصویر کو ہٹانا
  const removeImage = (indexToRemove) => {
    setHouseData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // اپڈیٹ فارم سبمٹ کرنا
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      await axios.put(`https://house-rent-app-ten.vercel.app/api/houses/${id}`, {
        ...houseData,
        rentPrice: Number(houseData.rentPrice),
        bedrooms: Number(houseData.bedrooms),
        bathrooms: Number(houseData.bathrooms),
        userId: currentUserId
      });

      alert(lang === 'en' ? 'Property updated successfully! ✏️' : 'گھر کی تفصیلات کامیابی سے تبدیل ہو گئیں! ✏️');
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
        <h2 style={{ marginBottom: '20px' }}>{lang === 'en' ? 'Edit Property Details ✏️' : 'گھر کی تفصیلات تبدیل کریں ✏️'}</h2>
        
        <form onSubmit={handleUpdate}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>{lang === 'en' ? 'Title:' : 'عنوان:'}</label>
          <input type="text" required value={houseData.title}
            onChange={(e) => setHouseData({ ...houseData, title: e.target.value })}
            style={{ width: '100%', padding: '10px', margin: '4px 0 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>{lang === 'en' ? 'Monthly Rent (PKR):' : 'ماہانہ کرایہ (روپے):'}</label>
          <input type="number" required value={houseData.rentPrice}
            onChange={(e) => setHouseData({ ...houseData, rentPrice: e.target.value })}
            style={{ width: '100%', padding: '10px', margin: '4px 0 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>{lang === 'en' ? 'City:' : 'شہر:'}</label>
              <input type="text" required value={houseData.city}
                onChange={(e) => setHouseData({ ...houseData, city: e.target.value })}
                style={{ width: '100%', padding: '10px', margin: '4px 0 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>{lang === 'en' ? 'Address:' : 'مکمل پتہ:'}</label>
              <input type="text" required value={houseData.address}
                onChange={(e) => setHouseData({ ...houseData, address: e.target.value })}
                style={{ width: '100%', padding: '10px', margin: '4px 0 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>{lang === 'en' ? 'Bedrooms:' : 'کمرے:'}</label>
              <input type="number" required value={houseData.bedrooms}
                onChange={(e) => setHouseData({ ...houseData, bedrooms: e.target.value })}
                style={{ width: '100%', padding: '10px', margin: '4px 0 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>{lang === 'en' ? 'Bathrooms:' : 'باتھ روم:'}</label>
              <input type="number" required value={houseData.bathrooms}
                onChange={(e) => setHouseData({ ...houseData, bathrooms: e.target.value })}
                style={{ width: '100%', padding: '10px', margin: '4px 0 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>

          {/* تصاویر کا سیکشن */}
          <div style={{ margin: '10px 0 15px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>
              <ImageIcon size={16} style={{ verticalAlign: 'middle', marginInlineEnd: '4px' }} />
              {lang === 'en' ? 'Add More Photos / Remove Photos:' : 'تصاویر شامل کریں یا پرانی تصویر ڈیلیٹ کریں:'}
            </label>
            
            <input type="file" accept="image/*" multiple onChange={handleMultipleImages}
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

          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>{lang === 'en' ? 'Description:' : 'تفصیلات:'}</label>
          <textarea rows="3" required value={houseData.description}
            onChange={(e) => setHouseData({ ...houseData, description: e.target.value })}
            style={{ width: '100%', padding: '10px', margin: '4px 0 15px', borderRadius: '6px', border: '1px solid #cbd5e1' }}></textarea>

          <button type="submit" className="btn-primary" disabled={loading}
            style={{ width: '100%', padding: '12px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {loading ? <><Loader2 size={18} className="spin" /> Updating...</> : (lang === 'en' ? 'Save & Update Property' : 'تبدیلیاں محفوظ کریں')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditHouse;