/* eslint-disable */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Image as ImageIcon, X, Loader2, ArrowLeft, Video, Calendar, Users, MapPin, Tag, Building2
} from 'lucide-react';
import { uploadToCloudinary } from '../utils/uploadCloudinary';
import { getLiveLocation } from '../utils/getLiveLocation';

const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://house-rent-app-ten.vercel.app';

const formatPKR = (amount) => {
  const num = Number(amount) || 0;
  if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Crore`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)} Lac`;
  return num.toLocaleString();
};

const EditHouse = () => {
  const { id } = useParams();
  const { currentUser, lang } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [locating, setLocating] = useState(false);

  const [houseData, setHouseData] = useState({
    purpose: 'rent',
    propertyType: 'house',
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
    salePrice: '',
    areaSize: '',
    areaUnit: 'Marla',
    isNegotiable: true,
    possessionStatus: 'ready',
    installmentAvailable: false,
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
          purpose: house.purpose || 'rent',
          propertyType: house.propertyType || 'house',
          title: house.title || '',
          description: house.description || '',
          rentPrice: house.rentPrice || '',
          pricePerDay: house.pricePerDay || '',
          pricePerYear: house.pricePerYear || '',
          availableFor: house.availableFor?.length ? house.availableFor : ['monthly'],
          suitableFor: house.suitableFor || 'both',
          isShared: Boolean(house.isShared),
          totalBeds: house.totalBeds || 2,
          sharedGender: house.sharedGender || 'boys',
          availableFrom: house.availableFrom ? new Date(house.availableFrom).toISOString().split('T')[0] : '',
          availableTo: house.availableTo ? new Date(house.availableTo).toISOString().split('T')[0] : '',
          salePrice: house.salePrice || '',
          areaSize: house.areaSize || '',
          areaUnit: house.areaUnit || 'Marla',
          isNegotiable: house.isNegotiable !== undefined ? Boolean(house.isNegotiable) : true,
          possessionStatus: house.possessionStatus || 'ready',
          installmentAvailable: Boolean(house.installmentAvailable),
          city: house.city || '',
          address: house.address || '',
          bedrooms: house.bedrooms ?? '',
          bathrooms: house.bathrooms ?? '',
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

  const isSale = houseData.purpose === 'sale';
  const isPlotOrCommercial =
    houseData.propertyType === 'plot' || houseData.propertyType === 'commercial';

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
      alert('Video file is over 60MB! Please compress it via WhatsApp or select a smaller video.');
      return;
    }

    setUploadProgress(1);
    try {
      const videoUrl = await uploadToCloudinary(file, 'video', (percent) => {
        setUploadProgress(percent);
      });
      setHouseData((prev) => ({ ...prev, videoUrl }));
      alert('New video uploaded to Cloud successfully! 🎥✅');
    } catch (err) {
      alert('Video Upload Error: ' + err.message);
    } finally {
      setUploadProgress(null);
    }
  };

  const handleRemoveVideo = () => {
    if (window.confirm(lang === 'en' ? 'Are you sure you want to remove the video tour?' : 'کیا آپ واقعی ویڈیو ٹور ڈیلیٹ کرنا چاہتے ہیں؟')) {
      setHouseData((prev) => ({ ...prev, videoUrl: '' }));
    }
  };

  const toggleAvailableFor = (type) => {
    setHouseData((prev) => {
      const exists = prev.availableFor.includes(type);
      return {
        ...prev,
        availableFor: exists ? prev.availableFor.filter((t) => t !== type) : [...prev.availableFor, type],
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
    !isSale && houseData.isShared && Number(houseData.rentPrice) > 0 && Number(houseData.totalBeds) > 0
      ? Math.round(Number(houseData.rentPrice) / Number(houseData.totalBeds))
      : 0;

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (isSale && Number(houseData.salePrice) <= 0) {
      alert('Please enter a valid Sale Demand Price!');
      return;
    }
    setLoading(true);

    try {
      await axios.put(`${API_URL}/api/houses/${id}`, {
        ...houseData,
        rentPrice: isSale ? 0 : Number(houseData.rentPrice) || 0,
        pricePerDay: isSale ? 0 : Number(houseData.pricePerDay) || 0,
        pricePerYear: isSale ? 0 : Number(houseData.pricePerYear) || 0,
        availableFor: isSale ? [] : houseData.availableFor,
        salePrice: isSale ? Number(houseData.salePrice) || 0 : 0,
        bedrooms: isPlotOrCommercial ? Number(houseData.bedrooms) || 0 : Number(houseData.bedrooms) || 1,
        bathrooms: isPlotOrCommercial ? Number(houseData.bathrooms) || 0 : Number(houseData.bathrooms) || 1,
        totalBeds: !isSale && houseData.isShared ? Number(houseData.totalBeds) || 2 : 1,
        pricePerPerson: splitRentPerPerson,
        userId: currentUserId,
        videoUrl: houseData.videoUrl,
      });

      alert(lang === 'en' ? 'Property updated successfully! ✏️' : 'پراپرٹی کی تفصیلات کامیابی سے تبدیل ہو گئیں! ✏️');
      navigate(`/house/${id}`);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

  return (
    <div className="container" style={{ maxWidth: '650px', marginTop: '30px', marginBottom: '70px' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold', marginBottom: '15px' }}>
        <ArrowLeft size={18} /> {lang === 'en' ? 'Cancel & Go Back' : 'منسوخ کریں اور واپس جائیں'}
      </button>

      <div className="house-card" style={{ padding: '30px' }}>
        <h2 style={{ marginBottom: '15px' }}>
          {lang === 'en' ? 'Edit Property & Video ✏️' : 'پراپرٹی اور ویڈیو کی تفصیلات تبدیل کریں ✏️'}
        </h2>

        {/* Rent vs Sale Switcher */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button
            type="button"
            onClick={() => setHouseData((prev) => ({ ...prev, purpose: 'rent' }))}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              border: !isSale ? '2px solid #2563eb' : '1px solid #cbd5e1',
              background: !isSale ? '#eff6ff' : '#fff',
              color: !isSale ? '#1d4ed8' : '#475569',
            }}
          >
            <Building2 size={16} /> For Rent
          </button>
          <button
            type="button"
            onClick={() => setHouseData((prev) => ({ ...prev, purpose: 'sale', isShared: false }))}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              border: isSale ? '2px solid #047857' : '1px solid #cbd5e1',
              background: isSale ? '#ecfdf5' : '#fff',
              color: isSale ? '#047857' : '#475569',
            }}
          >
            <Tag size={16} /> For Sale
          </button>
        </div>

        {/* Property Type */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>
            Property Type:
          </label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { key: 'house', label: '🏡 House' },
              { key: 'flat', label: '🏢 Flat' },
              { key: 'portion', label: '🚪 Portion' },
              { key: 'plot', label: '📐 Plot' },
              { key: 'commercial', label: '🏪 Commercial' },
            ].map((pt) => {
              const active = houseData.propertyType === pt.key;
              return (
                <button
                  key={pt.key}
                  type="button"
                  onClick={() => setHouseData({ ...houseData, propertyType: pt.key })}
                  style={{
                    padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700',
                    border: active ? '2px solid #0f172a' : '1px solid #cbd5e1',
                    background: active ? '#0f172a' : '#fff',
                    color: active ? '#fff' : '#475569',
                  }}
                >
                  {pt.label}
                </button>
              );
            })}
          </div>
        </div>

        {uploadProgress !== null && (
          <div style={{ background: '#eff6ff', color: '#1e40af', padding: '12px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #bfdbfe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Loader2 className="spin" size={16} /> Fast Cloud Uploading...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#dbeafe', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#2563eb', transition: 'width 0.2s ease' }} />
            </div>
          </div>
        )}

        <form onSubmit={handleUpdate}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Title:</label>
          <input
            type="text" required value={houseData.title}
            onChange={(e) => setHouseData({ ...houseData, title: e.target.value })}
            style={{ width: '100%', padding: '10px', margin: '4px 0 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />

          {/* Area Size & Unit */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Area Size:</label>
              <input
                type="text" placeholder="e.g. 5, 10, 1" required={isSale}
                value={houseData.areaSize}
                onChange={(e) => setHouseData({ ...houseData, areaSize: e.target.value })}
                style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Unit:</label>
              <select
                value={houseData.areaUnit}
                onChange={(e) => setHouseData({ ...houseData, areaUnit: e.target.value })}
                style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}
              >
                <option value="Marla">Marla</option>
                <option value="Kanal">Kanal</option>
                <option value="Sq. Ft">Sq. Ft</option>
                <option value="Sq. Yds">Sq. Yds (Gaz)</option>
              </select>
            </div>
          </div>

          {isSale ? (
            /* SALE EDIT BOX */
            <div style={{ background: '#ecfdf5', padding: '15px', borderRadius: '10px', border: '1.5px solid #a7f3d0', marginBottom: '15px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#065f46', display: 'block', marginBottom: '8px' }}>
                🏷️ Sale Demand Price (PKR):
              </label>
              <input
                type="number" required min="10000" value={houseData.salePrice}
                onChange={(e) => setHouseData({ ...houseData, salePrice: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #6ee7b7', marginBottom: '6px' }}
              />
              {Number(houseData.salePrice) > 0 && (
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#047857', marginBottom: '10px' }}>
                  💡 Display Price: PKR {formatPKR(houseData.salePrice)}
                </div>
              )}

              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#065f46', display: 'block', marginBottom: '6px' }}>
                Possession Status:
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {[
                  { value: 'ready', label: '✅ Ready' },
                  { value: 'under_construction', label: '🏗️ Under Const.' },
                  { value: 'file', label: '📄 Plot File' },
                ].map((pos) => (
                  <button
                    key={pos.value} type="button"
                    onClick={() => setHouseData({ ...houseData, possessionStatus: pos.value })}
                    style={{
                      flex: 1, padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px',
                      border: houseData.possessionStatus === pos.value ? '2px solid #047857' : '1px solid #cbd5e1',
                      background: houseData.possessionStatus === pos.value ? '#d1fae5' : '#fff',
                      color: houseData.possessionStatus === pos.value ? '#065f46' : '#475569',
                    }}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#065f46', cursor: 'pointer' }}>
                  <input
                    type="checkbox" checked={houseData.isNegotiable}
                    onChange={(e) => setHouseData({ ...houseData, isNegotiable: e.target.checked })}
                  />
                  Price is Negotiable
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#065f46', cursor: 'pointer' }}>
                  <input
                    type="checkbox" checked={houseData.installmentAvailable}
                    onChange={(e) => setHouseData({ ...houseData, installmentAvailable: e.target.checked })}
                  />
                  Installments Available
                </label>
              </div>
            </div>
          ) : (
            /* RENT EDIT BOXES */
            <>
              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '8px' }}>
                  <Calendar size={15} style={{ verticalAlign: 'middle', marginInlineEnd: '4px' }} />
                  Rental Rates:
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {['daily', 'monthly', 'yearly'].map((type) => (
                    <button
                      key={type} type="button" onClick={() => toggleAvailableFor(type)}
                      style={{ padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', border: houseData.availableFor.includes(type) ? '2px solid #2563eb' : '1px solid #cbd5e1', background: houseData.availableFor.includes(type) ? '#eff6ff' : '#fff', color: houseData.availableFor.includes(type) ? '#2563eb' : '#64748b', textTransform: 'capitalize' }}
                    >
                      ✓ {type}
                    </button>
                  ))}
                </div>

                {houseData.availableFor.includes('daily') && (
                  <input
                    type="number" placeholder="Daily Rate (PKR/night)" required
                    value={houseData.pricePerDay} onChange={(e) => setHouseData({ ...houseData, pricePerDay: e.target.value })}
                    style={{ width: '100%', padding: '10px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                )}
                {houseData.availableFor.includes('monthly') && (
                  <input
                    type="number" placeholder="Monthly Rent (PKR/month)" required
                    value={houseData.rentPrice} onChange={(e) => setHouseData({ ...houseData, rentPrice: e.target.value })}
                    style={{ width: '100%', padding: '10px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                )}
                {houseData.availableFor.includes('yearly') && (
                  <input
                    type="number" placeholder="Yearly Total in PKR"
                    value={houseData.pricePerYear} onChange={(e) => setHouseData({ ...houseData, pricePerYear: e.target.value })}
                    style={{ width: '100%', padding: '10px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                {['family', 'bachelors', 'both'].map((s) => (
                  <button
                    key={s} type="button" onClick={() => setHouseData({ ...houseData, suitableFor: s })}
                    style={{ flex: 1, padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', border: houseData.suitableFor === s ? '2px solid #2563eb' : '1px solid #cbd5e1', background: houseData.suitableFor === s ? '#eff6ff' : '#fff', color: houseData.suitableFor === s ? '#2563eb' : '#64748b', textTransform: 'capitalize' }}
                  >
                    {s === 'family' ? '👨‍👩‍👧‍👦 Family' : s === 'bachelors' ? '👤 Bachelors' : '🤝 Both'}
                  </button>
                ))}
              </div>

              <div style={{ background: houseData.isShared ? '#f0fdf4' : '#f8fafc', padding: '15px', borderRadius: '10px', border: houseData.isShared ? '1.5px solid #22c55e' : '1px solid #cbd5e1', marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', color: '#0f172a' }}>
                  <input
                    type="checkbox" checked={houseData.isShared}
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
            </>
          )}

          <button
            type="button" onClick={handleLiveLocation} disabled={locating}
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
              <input
                type="text" required value={houseData.city}
                onChange={(e) => setHouseData({ ...houseData, city: e.target.value })}
                style={{ width: '100%', padding: '10px', margin: '4px 0 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Address:</label>
              <input
                type="text" required value={houseData.address}
                onChange={(e) => setHouseData({ ...houseData, address: e.target.value })}
                style={{ width: '100%', padding: '10px', margin: '4px 0 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          {!isPlotOrCommercial && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Bedrooms:</label>
                <input
                  type="number" required value={houseData.bedrooms}
                  onChange={(e) => setHouseData({ ...houseData, bedrooms: e.target.value })}
                  style={{ width: '100%', padding: '10px', margin: '4px 0 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Bathrooms:</label>
                <input
                  type="number" required value={houseData.bathrooms}
                  onChange={(e) => setHouseData({ ...houseData, bathrooms: e.target.value })}
                  style={{ width: '100%', padding: '10px', margin: '4px 0 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>
          )}

          <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', display: 'block', marginBottom: '10px' }}>
              ⚡ Utilities &amp; Facilities:
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
            <input
              type="file" accept="image/*" multiple onChange={handleMultipleImages} disabled={uploadProgress !== null}
              style={{ padding: '8px', border: '1.5px dashed #2563eb', background: '#eff6ff', width: '100%', borderRadius: '6px', cursor: 'pointer' }}
            />

            {houseData.images.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))', gap: '8px', marginTop: '10px' }}>
                {houseData.images.map((img, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img src={img} alt={`Preview ${index}`} style={{ width: '100%', height: '75px', objectFit: 'cover', borderRadius: '6px' }} />
                    <button
                      type="button" onClick={() => removeImage(index)}
                      style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(220, 38, 38, 0.85)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
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
                  style={{ width: '100%', marginTop: '10px', padding: '8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <X size={16} /> Remove / Delete Video (ویڈیو ڈیلیٹ کریں)
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="file" accept="video/*" onChange={handleVideoUpload} disabled={uploadProgress !== null}
                  style={{ padding: '8px', background: '#ffffff', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                />
                <p style={{ fontSize: '12px', color: '#475569', margin: '8px 0 4px', fontWeight: 'bold' }}>
                  OR Paste YouTube / Reels Video Link:
                </p>
                <input
                  type="text" placeholder="https://youtu.be/... or video link" value={houseData.videoUrl}
                  onChange={(e) => setHouseData({ ...houseData, videoUrl: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            )}
          </div>

          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Description:</label>
          <textarea
            rows="3" required value={houseData.description}
            onChange={(e) => setHouseData({ ...houseData, description: e.target.value })}
            style={{ width: '100%', padding: '10px', margin: '4px 0 15px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />

          <button
            type="submit" className="btn-primary" disabled={loading || uploadProgress !== null}
            style={{ width: '100%', padding: '12px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? <><Loader2 size={18} className="spin" /> Updating...</> : 'Save & Update Property'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditHouse;