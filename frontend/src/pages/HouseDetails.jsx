/* eslint-disable */
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  MapPin, Bed, Bath, ArrowLeft, MessageCircle,
  ShieldCheck, Sparkles, Clock, Star, Send,
  FileText, Video, X, Handshake, Target, Layers, Eye, Rocket, Calendar, Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RentAgreementModal from '../components/RentAgreementModal.jsx';
import ChatModal from '../components/ChatModal.jsx';
import HouseCard from '../components/HouseCard.jsx';

const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://house-rent-app-ten.vercel.app';

// 🔒 ابھی اعتماد بنانے کے لیے آن لائن پیمنٹ بند ہے (جب بعد میں آن کرنی ہو تو true کر دیں)
const ENABLE_ONLINE_PAYMENT = false;

const formatPKR = (amount) => {
  const num = Number(amount) || 0;
  if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Crore`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)} Lac`;
  return num.toLocaleString();
};

const HouseDetails = () => {
  const { id } = useParams();
  const [house, setHouse] = useState(null);
  const [similarHouses, setSimilarHouses] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const { currentUser, lang } = useAuth();
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [bookedDates, setBookedDates] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState('monthly');
  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(tomorrowStr);
  const [durationCount, setDurationCount] = useState(1);
  const [dateError, setDateError] = useState('');

  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offeredRent, setOfferedRent] = useState('');
  const [offerNote, setOfferNote] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);

  const [matchingTenants, setMatchingTenants] = useState([]);

  const [paymentMethod, setPaymentMethod] = useState('JazzCash');
  const [transactionId, setTransactionId] = useState('');
  const [submittingToken, setSubmittingToken] = useState(false);
  const [copied, setCopied] = useState(false);

  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitName, setVisitName] = useState('');
  const [visitPhone, setVisitPhone] = useState('');
  const [visitDate, setVisitDate] = useState(tomorrowStr);
  const [visitTime, setVisitTime] = useState('Morning (10 AM - 1 PM)');
  const [visitNote, setVisitNote] = useState('');
  const [submittingVisit, setSubmittingVisit] = useState(false);

  const handleVisitSubmit = async (e) => {
    e.preventDefault();
    setSubmittingVisit(true);
    try {
      const res = await axios.post(`${API_URL}/api/houses/${id}/request-visit`, {
        name: visitName,
        phone: visitPhone,
        visitDate,
        visitTime,
        note: visitNote,
      });
      alert(res.data?.message || 'Visit request sent! The owner will call you shortly. 📅✅');
      setShowVisitModal(false);
      setVisitNote('');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingVisit(false);
    }
  };

  const adminPaymentDetails = {
    JazzCash: { number: '03001234567', title: 'Muhammad Mehraj' },
    EasyPaisa: { number: '03119876543', title: 'Muhammad Mehraj' }
  };

  const fetchHouseAndReviews = async () => {
    try {
      const [houseRes, bookedRes, reviewsRes, similarRes] = await Promise.all([
        axios.get(`${API_URL}/api/houses/${id}`),
        axios.get(`${API_URL}/api/bookings/booked-dates/${id}`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/reviews/${id}`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/houses/${id}/similar`).catch(() => ({ data: [] })),
      ]);
      setHouse(houseRes.data);
      setActiveImage(houseRes.data.images?.[0] || '');
      if (houseRes.data.availableFor?.length > 0) {
        setSelectedDuration(houseRes.data.availableFor[0]);
      }
      setBookedDates(bookedRes.data || []);
      setReviews(reviewsRes.data || []);
      setSimilarHouses(similarRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHouseAndReviews();
    window.scrollTo(0, 0);
  }, [id]);

  const isSale = house?.purpose === 'sale';
  const isFeatured = Boolean(
    house?.isFeaturedActive ||
      (house?.isFeatured &&
        house?.featuredUntil &&
        new Date(house.featuredUntil).getTime() > Date.now())
  );
  const currentUserId = currentUser?.id || currentUser?._id;
  const houseOwnerId = house?.owner?._id || house?.owner;
  const isActualOwner = Boolean(currentUserId && houseOwnerId && String(currentUserId) === String(houseOwnerId));

  useEffect(() => {
    if (isActualOwner && id) {
      axios
        .get(`${API_URL}/api/matches/for-house/${id}`)
        .then((res) => setMatchingTenants(res.data || []))
        .catch(() => {});
    }
  }, [isActualOwner, id]);

  useEffect(() => {
    if (isSale) {
      setDateError('');
      return;
    }
    setDateError('');
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

      if (selectedDuration === 'daily') setDurationCount(diffDays);
      else if (selectedDuration === 'monthly') setDurationCount(Math.ceil(diffDays / 30) || 1);
      else if (selectedDuration === 'yearly') setDurationCount(Math.ceil(diffDays / 365) || 1);

      if (house?.availableFrom && start < new Date(house.availableFrom)) {
        setDateError(`Room available starting from ${new Date(house.availableFrom).toLocaleDateString()}!`);
        return;
      }
      if (house?.availableTo && end > new Date(house.availableTo)) {
        setDateError(`Room available only until ${new Date(house.availableTo).toLocaleDateString()}!`);
        return;
      }

      const hasConflict = bookedDates.some(b => {
        const bStart = new Date(b.checkIn);
        const bEnd = new Date(b.checkOut);
        return start < bEnd && end > bStart;
      });

      if (hasConflict) {
        setDateError('These dates are already booked! Please pick other dates.');
      }
    }
  }, [checkIn, checkOut, selectedDuration, bookedDates, house, isSale]);

  const calculateBill = () => {
    if (isSale) {
      const salePrice = Number(house?.salePrice) || 0;
      const bayanaToken = Math.min(Math.max(Math.round(salePrice * 0.01), 25000), 100000);
      const platformFee = Math.round(bayanaToken * 0.05) || 1000;
      return {
        totalRent: bayanaToken,
        platformFee,
        totalAmount: bayanaToken + platformFee,
        landlordAmount: bayanaToken,
      };
    }

    let baseRate = 0;
    if (selectedDuration === 'daily') baseRate = house?.pricePerDay || 2000;
    if (selectedDuration === 'monthly') baseRate = house?.rentPrice || 35000;
    if (selectedDuration === 'yearly') baseRate = house?.pricePerYear || ((house?.rentPrice || 0) * 12) || 400000;

    const totalRent = baseRate * durationCount;
    const platformFee = Math.round(totalRent * 0.1) || 500;
    const totalAmount = totalRent + platformFee;
    const landlordAmount = totalRent;

    return { totalRent, platformFee, totalAmount, landlordAmount };
  };

  const bill = calculateBill();

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(adminPaymentDetails[paymentMethod].number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenBookingModal = () => {
    if (!isSale && dateError) {
      alert(dateError);
      return;
    }
    setShowTokenModal(true);
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please log in first to make an offer!');
      navigate('/login');
      return;
    }
    if (!isSale && dateError) {
      alert(dateError);
      return;
    }

    setSubmittingOffer(true);
    try {
      await axios.post(`${API_URL}/api/offers/create`, {
        houseId: id,
        tenantId: currentUserId,
        landlordId: houseOwnerId,
        rentType: isSale ? 'sale' : selectedDuration,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        durationCount: isSale ? 1 : durationCount,
        originalRent: isSale ? (house.salePrice || 0) : bill.totalRent,
        offeredRent: Number(offeredRent),
        note: offerNote,
      });

      alert(
        isSale
          ? 'Purchase Offer sent to Seller! Track responses in the Offers page 🤝🎉'
          : 'Offer sent to Host! Track responses in the Offers page 🤝🎉'
      );
      setShowOfferModal(false);
      setOfferedRent('');
      setOfferNote('');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please log in first!');
      navigate('/login');
      return;
    }

    setSubmittingToken(true);
    try {
      await axios.post(`${API_URL}/api/bookings/create`, {
        houseId: id,
        tenantId: currentUserId,
        landlordId: houseOwnerId,
        rentType: isSale ? 'sale' : selectedDuration,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        durationCount: isSale ? 1 : durationCount,
        totalAmount: bill.totalAmount,
        platformFee: bill.platformFee,
        landlordAmount: bill.landlordAmount,
        paymentMethod,
        transactionId,
      });

      alert(
        isSale
          ? 'Bayana / Token submitted to Escrow! Property hold request sent 🎉'
          : 'Reservation submitted to Escrow! Dates are locked 🎉'
      );
      setShowTokenModal(false);
      setTransactionId('');
      window.location.reload();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingToken(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please log in to submit a review!');
      navigate('/login');
      return;
    }

    setSubmittingReview(true);
    try {
      await axios.post(`${API_URL}/api/reviews/add`, {
        houseId: id,
        userId: currentUserId,
        rating: userRating,
        comment: userComment,
      });

      alert('Review posted successfully! ⭐🎉');
      setUserComment('');
      fetchHouseAndReviews();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatWhatsAppNumber = (phone) => {
    if (!phone) return '';
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) cleaned = '92' + cleaned.substring(1);
    return cleaned;
  };

  if (!house) return <div className="container" style={{ textAlign: 'center', marginTop: '60px' }}>Loading property details...</div>;

  const whatsappText = isSale
    ? `Assalam-o-Alaikum! I saw your property "${house.title}" (${house.areaSize || ''} ${house.areaUnit || ''}) for PKR ${formatPKR(house.salePrice)} on HouseRent PK. Is it still available?`
    : `Assalam-o-Alaikum! I saw your property "${house.title}" on HouseRent PK. Is it available to visit?`;

  const whatsappUrl = `https://wa.me/${formatWhatsAppNumber(house.owner?.phone)}?text=${encodeURIComponent(whatsappText)}`;

  return (
    <div className="container" style={{ maxWidth: '1050px', marginTop: '30px', paddingBottom: '70px' }}>
      <Link to={isSale ? '/buy' : '/'} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563eb', textDecoration: 'none', fontWeight: 'bold', marginBottom: '15px' }}>
        <ArrowLeft size={18} /> {isSale ? 'Back to Buy Listings' : 'Back to Listings'}
      </Link>

      {/* مالک کے لیے Boost Bar صرف تب دکھے گا جب Online Payment آن ہو */}
      {ENABLE_ONLINE_PAYMENT && isActualOwner && !isFeatured && (
        <div
          style={{
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            border: '1.5px solid #f59e0b',
            padding: '14px 18px',
            borderRadius: '12px',
            marginBottom: '18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <b style={{ fontSize: '15px', color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Rocket size={17} /> Get 5x More Views &amp; Calls!
            </b>
            <span style={{ fontSize: '12.5px', color: '#78350f' }}>
              Feature this property at the #1 Top Spot for just PKR 500 (7 Days).
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/advertise?mode=boost&houseId=${house._id}`)}
            style={{
              background: '#d97706',
              color: '#fff',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            <Rocket size={15} /> Boost This Ad 🚀
          </button>
        </div>
      )}

      {/* Auto-Match Radar */}
      {isActualOwner && matchingTenants.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', color: '#fff', padding: '18px 20px', borderRadius: '14px', marginBottom: '22px', boxShadow: '0 8px 25px rgba(30,58,138,0.2)' }}>
          <h3 style={{ margin: '0 0 10px', fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={20} color="#4ade80" />
            Smart Auto-Match Radar: {matchingTenants.length} People Looking in {house.city}!
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {matchingTenants.slice(0, 4).map((t) => {
              const tWa = `https://wa.me/${formatWhatsAppNumber(t.phone)}?text=${encodeURIComponent(
                `Assalam-o-Alaikum ${t.user?.name || ''}! I saw your requirement "${t.title}". My property "${house.title}" in ${house.city} matches your budget!`
              )}`;
              return (
                <div key={t._id} style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <b style={{ fontSize: '13px' }}>{t.user?.name || 'Client'}</b>
                    <span style={{ background: '#22c55e', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 7px', borderRadius: '999px' }}>
                      {t.matchPercent}% Match
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '8px' }}>
                    {t.area} • Budget: PKR {t.maxBudget?.toLocaleString()}
                  </div>
                  <a href={tWa} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#22c55e', color: '#fff', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', textDecoration: 'none' }}>
                    <MessageCircle size={12} /> Send My Property
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* بایاں حصہ */}
        <div style={{ flex: '1 1 600px' }}>
          <div className="house-card" style={{ padding: '20px', marginBottom: '20px' }}>
            <img
              src={activeImage || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600'}
              alt={house.title}
              style={{ width: '100%', height: '380px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px' }}
            />

            {house.images && house.images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '15px' }}>
                {house.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Thumb ${index}`}
                    onClick={() => setActiveImage(img)}
                    style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: activeImage === img ? '2.5px solid #2563eb' : '1px solid #cbd5e1' }}
                  />
                ))}
              </div>
            )}

            {house.videoUrl && (
              <div style={{ margin: '10px 0 15px' }}>
                <button
                  type="button"
                  onClick={() => setShowVideoModal(true)}
                  style={{
                    width: '100%', padding: '12px',
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    color: 'white', border: 'none', borderRadius: '8px',
                    fontSize: '15px', fontWeight: 'bold', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                  }}
                >
                  <Video size={18} /> Watch Video Walkthrough Tour (مکان کا ویڈیو ٹور دیکھیں)
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '8px' }}>
              {isFeatured && (
                <span style={{ fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '999px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}>
                  ⚡ FEATURED
                </span>
              )}
              {house.owner?.isVerified && (
                <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '999px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                  ✅ Verified Owner
                </span>
              )}
              <span
                style={{
                  fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '999px',
                  background: isSale ? '#ecfdf5' : '#eff6ff',
                  color: isSale ? '#047857' : '#1d4ed8',
                  border: isSale ? '1px solid #a7f3d0' : '1px solid #bfdbfe',
                }}
              >
                {isSale ? '🏷️ FOR SALE' : '🏢 FOR RENT'}
              </span>
              {house.propertyType && (
                <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '999px', background: '#f1f5f9', color: '#334155', textTransform: 'capitalize' }}>
                  {house.propertyType}
                </span>
              )}
              {isSale && house.possessionStatus && (
                <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '999px', background: '#fef3c7', color: '#b45309' }}>
                  {house.possessionStatus === 'ready' ? '✅ Ready for Possession' : house.possessionStatus === 'file' ? '📄 Plot File' : '🏗️ Under Construction'}
                </span>
              )}
              <span style={{ fontSize: '12px', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                <Eye size={14} /> {house.views || 1} views
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <h1 style={{ fontSize: '24px', margin: 0 }}>{house.title}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#fefce8', border: '1px solid #fef08a', padding: '6px 12px', borderRadius: '20px', color: '#854d0e', fontWeight: 'bold' }}>
                <Star size={16} fill="#eab308" color="#eab308" />
                <span>{house.averageRating > 0 ? `${house.averageRating} (${house.totalReviews} Reviews)` : 'No Reviews Yet (New)'}</span>
              </div>
            </div>

            <p style={{ color: '#64748b', fontSize: '15px', margin: '8px 0 15px' }}>
              <MapPin size={16} style={{ verticalAlign: 'middle', marginInlineEnd: '4px' }} />
              {house.address}, {house.city}
            </p>

            {!isSale && (house.availableFrom || house.availableTo) && (
              <div style={{ background: '#eff6ff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock color="#2563eb" size={18} />
                <span style={{ fontSize: '13px', color: '#1e40af' }}>
                  <b>Host Availability Window:</b> Available {house.availableFrom ? `from ${new Date(house.availableFrom).toLocaleDateString()}` : 'anytime'} {house.availableTo ? `until ${new Date(house.availableTo).toLocaleDateString()}` : 'onwards'}.
                </span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', padding: '12px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', marginBottom: '15px' }}>
              {house.areaSize && (
                <span><Layers size={18} /> <b>{house.areaSize}</b> {house.areaUnit || 'Marla'}</span>
              )}
              {house.bedrooms > 0 && (
                <span><Bed size={18} /> <b>{house.bedrooms}</b> Bedrooms</span>
              )}
              {house.bathrooms > 0 && (
                <span><Bath size={18} /> <b>{house.bathrooms}</b> Bathrooms</span>
              )}
            </div>

            {house.nearLandmark && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px 14px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', fontWeight: '600' }}>
                📍 Nearby Landmark: {house.nearLandmark}
              </div>
            )}

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '15px', color: '#0f172a' }}>
                🔍 {lang === 'en' ? 'Utility Truth Check (No Surprises)' : 'سہولیات کی سچائی (کوئی پوشیدہ مسئلہ نہیں)'}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px' }}>
                {[
                  { key: 'separateMeter', label: '⚡ Separate Bijli Meter' },
                  { key: 'solarOrUps', label: '☀️ Solar / UPS Backup' },
                  { key: 'suiGas', label: '🔥 Sui Gas' },
                  { key: 'water24x7', label: '💧 24/7 Water / Boring' },
                  { key: 'wifi', label: '📶 Fiber WiFi' },
                  { key: 'parking', label: '🚗 Bike/Car Parking' },
                ].map((item) => {
                  const hasIt = Boolean(house.utilities?.[item.key]);
                  return (
                    <div
                      key={item.key}
                      style={{
                        padding: '8px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: hasIt ? '#ecfdf5' : '#f1f5f9',
                        color: hasIt ? '#065f46' : '#64748b',
                        border: hasIt ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                      }}
                    >
                      <span>{item.label}</span>
                      <span>{hasIt ? '✅ Yes' : '— No'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {!isSale && house.marketStats && house.marketStats.sampleCount > 0 && (
              <div
                style={{
                  padding: '16px', borderRadius: '12px', marginBottom: '18px',
                  border: house.marketStats.verdict === 'great_deal' ? '1.5px solid #22c55e' : house.marketStats.verdict === 'above_average' ? '1.5px solid #f59e0b' : '1.5px solid #3b82f6',
                  background: house.marketStats.verdict === 'great_deal' ? '#f0fdf4' : house.marketStats.verdict === 'above_average' ? '#fffbeb' : '#eff6ff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                  <b style={{ fontSize: '14px', color: '#0f172a' }}>📊 Live Fair Rent Meter ({house.city})</b>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '999px', background: '#ffffff', color: house.marketStats.verdict === 'great_deal' ? '#15803d' : house.marketStats.verdict === 'above_average' ? '#b45309' : '#1d4ed8' }}>
                    {house.marketStats.verdict === 'great_deal'
                      ? `💚 Great Deal (${Math.abs(house.marketStats.percentDiff)}% Cheaper)`
                      : house.marketStats.verdict === 'above_average'
                      ? `⚠️ ${house.marketStats.percentDiff}% Above Avg`
                      : '⚖️ Fair Market Price'}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#334155' }}>
                  This property: <b>PKR {(house.rentPrice || 0).toLocaleString()}/mo</b> vs {house.city} Average:{' '}
                  <b>PKR {house.marketStats.avgRent?.toLocaleString()}/mo</b> (compared with {house.marketStats.sampleCount} similar listings).
                </p>
              </div>
            )}

            <h3>About this property</h3>
            <p style={{ lineHeight: '1.6', color: '#334155', margin: '8px 0 20px', whiteSpace: 'pre-line' }}>{house.description}</p>

            {/* Contact, Live Chat & Agreement */}
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
              <p style={{ fontSize: '14px', marginBottom: '6px' }}>
                {isSale ? 'Owner / Seller:' : 'Host:'} <b>{house.owner?.name || 'Property Owner'}</b> ({house.owner?.phone || 'N/A'})
                {house.owner?.isVerified && (
                  <span style={{ marginLeft: '6px', fontSize: '11px', fontWeight: 'bold', background: '#dbeafe', color: '#1d4ed8', padding: '2px 7px', borderRadius: '999px' }}>
                    ✅ Verified
                  </span>
                )}
              </p>

              {house.owner?.phone && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp" style={{ marginTop: '8px' }}>
                  <MessageCircle size={18} /> {isSale ? 'Message Seller on WhatsApp' : 'Message Host on WhatsApp'}
                </a>
              )}

              {house.owner && !isActualOwner && (
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser) {
                      alert('Please log in first to chat!');
                      navigate('/login');
                      return;
                    }
                    setShowChatModal(true);
                  }}
                  style={{
                    width: '100%', padding: '12px', background: '#0f172a', color: '#ffffff',
                    border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '8px', marginTop: '8px'
                  }}
                >
                  <MessageCircle size={18} color="#60a5fa" />
                  {isSale ? 'Live Chat with Seller (فروخت کنندہ سے چیٹ)' : 'Live Chat with Host (براہِ راست چیٹ کریں)'}
                </button>
              )}

              {!isSale && (
                <button
                  type="button"
                  onClick={() => setShowAgreementModal(true)}
                  style={{
                    width: '100%', padding: '12px', background: '#ffffff', color: '#15803d',
                    border: '2px solid #15803d', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '8px', marginTop: '10px'
                  }}
                >
                  <FileText size={18} color="#15803d" />
                  Download Legal Rent Agreement PDF (قانونی کرایہ نامہ)
                </button>
              )}
            </div>

            {/* Reviews Section */}
            <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '25px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <Star size={20} fill="#eab308" color="#eab308" />
                Reviews &amp; Feedback ({reviews.length})
              </h3>

              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
                <h4 style={{ fontSize: '15px', marginBottom: '10px' }}>Leave a Review:</h4>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Your Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setUserRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                    >
                      <Star size={22} fill={star <= userRating ? '#eab308' : '#cbd5e1'} color={star <= userRating ? '#eab308' : '#cbd5e1'} />
                    </button>
                  ))}
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#854d0e', marginLeft: '6px' }}>({userRating} Stars)</span>
                </div>

                <form onSubmit={handleReviewSubmit}>
                  <textarea
                    rows="3"
                    required
                    placeholder="Write your review..."
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '10px', fontSize: '13px' }}
                  />
                  <button type="submit" disabled={submittingReview} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Send size={15} /> {submittingReview ? 'Posting Review...' : 'Post Review'}
                  </button>
                </form>
              </div>

              {reviews.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '14px' }}>No reviews yet. Be the first to leave a review!</p>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {reviews.map((rev) => (
                    <div key={rev._id} style={{ background: '#ffffff', padding: '15px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '32px', height: '32px', background: '#eff6ff', color: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {rev.user?.name ? rev.user.name[0].toUpperCase() : 'G'}
                          </div>
                          <div>
                            <h5 style={{ fontSize: '14px', margin: 0 }}>{rev.user?.name || 'Verified User'}</h5>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={14} fill={s <= rev.rating ? '#eab308' : '#e2e8f0'} color={s <= rev.rating ? '#eab308' : '#e2e8f0'} />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', marginTop: '6px' }}>{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* دایاں اسٹکی کارڈ: 100% Free Direct Contact & Visit (کوئی آن لائن پیسے نہیں) */}
        <div style={{ flex: '1 1 350px', position: 'sticky', top: '80px' }}>
          <div className="house-card" style={{ padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.09)', border: isSale ? '1.5px solid #a7f3d0' : '1.5px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: isSale ? '#047857' : '#1d4ed8', background: isSale ? '#ecfdf5' : '#eff6ff', padding: '4px 10px', borderRadius: '999px' }}>
                {isSale ? '🏷️ DEMAND PRICE' : '🏢 DIRECT RENTAL'}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#15803d', background: '#dcfce7', padding: '4px 9px', borderRadius: '999px' }}>
                0% Commission
              </span>
            </div>

            {isSale ? (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: '#047857' }}>
                    PKR {formatPKR(house.salePrice)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Exact: PKR {(house.salePrice || 0).toLocaleString()} {house.isNegotiable ? '• Negotiable' : '• Fixed Price'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '14px', fontSize: '13px', display: 'grid', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Area Size:</span>
                    <b>{house.areaSize ? `${house.areaSize} ${house.areaUnit}` : 'N/A'}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Possession:</span>
                    <b style={{ textTransform: 'capitalize' }}>{house.possessionStatus?.replace('_', ' ') || 'Ready'}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Installments:</span>
                    <b>{house.installmentAvailable ? '✅ Available' : 'Cash / Full Payment'}</b>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>
                      PKR {selectedDuration === 'daily'
                        ? (house.pricePerDay || 2000).toLocaleString()
                        : selectedDuration === 'monthly'
                        ? (house.rentPrice || 0).toLocaleString()
                        : (house.pricePerYear || (house.rentPrice || 0) * 12).toLocaleString()}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>
                      {selectedDuration === 'daily' ? ' / night' : selectedDuration === 'monthly' ? ' / month' : ' / year'}
                    </span>
                  </div>
                </div>

                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' }}>Stay Type:</label>
                <div style={{ display: 'flex', gap: '6px', margin: '6px 0 12px' }}>
                  {['daily', 'monthly', 'yearly'].map(type => (
                    <button
                      key={type} type="button" onClick={() => setSelectedDuration(type)}
                      style={{ flex: 1, padding: '8px 4px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', border: selectedDuration === type ? '2px solid #2563eb' : '1px solid #cbd5e1', background: selectedDuration === type ? '#eff6ff' : '#fff', color: selectedDuration === type ? '#2563eb' : '#64748b', textTransform: 'capitalize' }}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div style={{ border: dateError ? '2px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', borderBottom: '1px solid #cbd5e1' }}>
                    <div style={{ flex: 1, padding: '8px 10px', borderRight: '1px solid #cbd5e1' }}>
                      <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', display: 'block' }}>MOVE-IN</label>
                      <input
                        type="date" required min={todayStr} value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        style={{ border: 'none', outline: 'none', width: '100%', fontSize: '12px', cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ flex: 1, padding: '8px 10px' }}>
                      <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', display: 'block' }}>UNTIL</label>
                      <input
                        type="date" required min={checkIn || todayStr} value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        style={{ border: 'none', outline: 'none', width: '100%', fontSize: '12px', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                  <div style={{ padding: '8px 10px', background: '#f8fafc', fontSize: '12px', color: '#334155', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Est. ({durationCount} {selectedDuration}):</span>
                    <b>PKR {bill.totalRent.toLocaleString()}</b>
                  </div>
                </div>

                {dateError && (
                  <div style={{ background: '#fee2e2', border: '1px solid #f87171', color: '#991b1b', padding: '10px', borderRadius: '6px', fontSize: '12px', marginBottom: '12px' }}>
                    {dateError}
                  </div>
                )}
              </>
            )}

            {/* 1. مفت وزٹ بُک کریں (Primary CTA - 0 روپے) */}
            {!isActualOwner && (
              <button
                type="button"
                onClick={() => {
                  setVisitName(currentUser?.name || '');
                  setVisitPhone(currentUser?.phone || '');
                  setShowVisitModal(true);
                }}
                style={{
                  width: '100%', padding: '13px', marginBottom: '10px',
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)'
                }}
              >
                <Calendar size={18} />
                {lang === 'en' ? 'Book Free Visit (PKR 0)' : 'مفت وزٹ بُک کریں (0 روپے)'}
              </button>
            )}

            {/* 2. براہِ راست واٹس ایپ اور فون کال */}
            {house.owner?.phone && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                <a
                  href={`tel:${house.owner.phone}`}
                  style={{
                    padding: '11px 8px', borderRadius: '8px', border: '1px solid #cbd5e1',
                    background: '#f8fafc', color: '#0f172a', textDecoration: 'none',
                    fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <Phone size={15} color="#2563eb" /> Call Owner
                </a>
                <a
                  href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                  style={{
                    padding: '11px 8px', borderRadius: '8px', border: '1px solid #86efac',
                    background: '#f0fdf4', color: '#15803d', textDecoration: 'none',
                    fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <MessageCircle size={15} /> WhatsApp
                </a>
              </div>
            )}

            {/* 3. لائیو چیٹ */}
            {house.owner && !isActualOwner && (
              <button
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    alert('Please log in first to chat!');
                    navigate('/login');
                    return;
                  }
                  setShowChatModal(true);
                }}
                style={{
                  width: '100%', padding: '11px', marginBottom: '10px',
                  background: '#0f172a', color: '#ffffff', border: 'none',
                  borderRadius: '8px', fontSize: '13.5px', fontWeight: 'bold', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                <MessageCircle size={16} color="#60a5fa" />
                {lang === 'en' ? 'Live Chat with Owner' : 'مالک سے لائیو چیٹ کریں'}
              </button>
            )}

            {/* 4. مفت قیمت / کرایہ لگائیں (Make an Offer) */}
            {!isActualOwner && (
              <button
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    alert('Please log in first to make an offer!');
                    navigate('/login');
                    return;
                  }
                  if (!isSale && dateError) {
                    alert(dateError);
                    return;
                  }
                  setOfferedRent(
                    isSale
                      ? String(Math.round((house.salePrice || 0) * 0.95))
                      : String(Math.round(bill.totalRent * 0.9))
                  );
                  setShowOfferModal(true);
                }}
                style={{
                  width: '100%', padding: '11px',
                  background: '#fef3c7', color: '#b45309', border: '1.5px solid #f59e0b',
                  borderRadius: '8px', fontSize: '13.5px', fontWeight: 'bold', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                <Handshake size={17} />
                {isSale
                  ? (lang === 'en' ? 'Make Purchase Offer (قیمت لگائیں)' : 'اپنی خریداری کی آفر بھیجیں')
                  : (lang === 'en' ? 'Make an Offer (کرایہ لگائیں)' : 'اپنا کرایہ لگائیں (Make an Offer)')}
              </button>
            )}

            {/* 5. آن لائن پیمنٹ صرف تب دکھے جب ENABLE_ONLINE_PAYMENT = true ہو */}
            {ENABLE_ONLINE_PAYMENT && (
              <button
                onClick={handleOpenBookingModal}
                style={{
                  width: '100%', padding: '12px', marginTop: '10px',
                  background: 'linear-gradient(135deg, #e11d48, #be123c)',
                  color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                <Sparkles size={16} />
                {isSale ? 'Pay Token / Bayana (Escrow Hold)' : 'Reserve Dates via Escrow'}
              </button>
            )}

            {/* Trust Notice */}
            <div style={{ marginTop: '14px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11.5px', color: '#475569', lineHeight: '1.5' }}>
              🛡️ <b>100% Free &amp; Direct Deal:</b> {lang === 'en'
                ? 'We charge 0% commission. Visit the property in person before paying anything to the owner.'
                : 'ہم کوئی کمیشن نہیں لیتے۔ کسی بھی رقم کی ادائیگی سے پہلے خود جا کر گھر ضرور دیکھیں۔'}
            </div>
          </div>
        </div>
      </div>

      {/* SIMILAR PROPERTIES */}
      {similarHouses.length > 0 && (
        <div style={{ marginTop: '36px', paddingTop: '24px', borderTop: '2px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '16px', color: '#0f172a' }}>
            {lang === 'en'
              ? 'Similar Properties You May Like'
              : 'ملتی جلتی مزید پراپرٹیز'}
          </h3>
          <div className="houses-grid">
            {similarHouses.map((sim) => (
              <HouseCard key={sim._id} house={sim} />
            ))}
          </div>
        </div>
      )}

      {/* 📅 Free Visit Request Modal */}
      {showVisitModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.75)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', maxWidth: '450px', width: '100%' }}>
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d' }}>
              <Calendar /> Book a Free Property Visit
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
              No payment needed! Visit the property in person and talk directly with the owner.
            </p>
            <form onSubmit={handleVisitSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text" required placeholder="Your Full Name"
                value={visitName} onChange={(e) => setVisitName(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
              <input
                type="text" required placeholder="Your Phone / WhatsApp (e.g. 03001234567)"
                value={visitPhone} onChange={(e) => setVisitPhone(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input
                  type="date" required min={todayStr}
                  value={visitDate} onChange={(e) => setVisitDate(e.target.value)}
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
                <select
                  value={visitTime} onChange={(e) => setVisitTime(e.target.value)}
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                >
                  <option value="Morning (10 AM - 1 PM)">Morning (10-1)</option>
                  <option value="Afternoon (2 PM - 5 PM)">Afternoon (2-5)</option>
                  <option value="Evening (5 PM - 8 PM)">Evening (5-8)</option>
                </select>
              </div>
              <textarea
                rows="2" placeholder="Short note (optional)..."
                value={visitNote} onChange={(e) => setVisitNote(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="submit" disabled={submittingVisit} style={{ flex: 1, padding: '11px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {submittingVisit ? 'Sending...' : 'Confirm Free Visit 📅'}
                </button>
                <button type="button" onClick={() => setShowVisitModal(false)} style={{ flex: 1, background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Make Offer Modal */}
      {showOfferModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.75)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', maxWidth: '450px', width: '100%' }}>
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309' }}>
              <Handshake /> {isSale ? 'Make Purchase Offer' : 'Make Your Offer'}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              {isSale
                ? <>Seller Demand: <b>PKR {formatPKR(house.salePrice)}</b></>
                : <>Original Rent for {durationCount} {selectedDuration}: <b>PKR {bill.totalRent.toLocaleString()}</b></>}
            </p>
            <form onSubmit={handleOfferSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  {isSale ? 'Your Offer Price (PKR):' : 'Your Offered Rent (PKR):'}
                </label>
                <input
                  type="number" required min="500" value={offeredRent}
                  onChange={(e) => setOfferedRent(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: 'bold', boxSizing: 'border-box' }}
                />
                {isSale && Number(offeredRent) > 0 && (
                  <div style={{ fontSize: '12px', color: '#047857', fontWeight: 'bold', marginTop: '4px' }}>
                    💡 {formatPKR(offeredRent)}
                  </div>
                )}
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Short Note (Optional):
                </label>
                <textarea
                  rows="2"
                  placeholder={isSale ? 'e.g. Cash buyer, ready to visit this week...' : 'e.g. Family of 3, long-term stay...'}
                  value={offerNote} onChange={(e) => setOfferNote(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary" disabled={submittingOffer} style={{ flex: 1, padding: '11px' }}>
                  {submittingOffer ? 'Sending...' : 'Send Offer 🤝'}
                </button>
                <button type="button" onClick={() => setShowOfferModal(false)} style={{ flex: 1, background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment / Escrow Modal (صرف تب کھلے گا جب ENABLE_ONLINE_PAYMENT = true ہو) */}
      {ENABLE_ONLINE_PAYMENT && showTokenModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.75)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }}>
          <div style={{ background: '#ffffff', padding: '25px', borderRadius: '12px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck color="#2563eb" /> Pay PKR {bill.totalAmount.toLocaleString()}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>
              {isSale
                ? `Escrow Token / Bayana for "${house.title}"`
                : <>Booked from <b>{checkIn}</b> to <b>{checkOut}</b> ({durationCount} {selectedDuration}).</>}
            </p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              {['JazzCash', 'EasyPaisa'].map((m) => (
                <button
                  key={m} type="button" onClick={() => setPaymentMethod(m)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', border: paymentMethod === m ? '2.5px solid #2563eb' : '1px solid #cbd5e1', background: paymentMethod === m ? '#eff6ff' : '#fff', color: paymentMethod === m ? '#2563eb' : '#64748b' }}
                >
                  {m}
                </button>
              ))}
            </div>

            <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '10px', border: '1.5px solid #93c5fd', marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e40af' }}>{paymentMethod} OFFICIAL ESCROW</span>
                  <h2 style={{ color: '#1e3a8a', margin: '4px 0', fontSize: '22px' }}>{adminPaymentDetails[paymentMethod].number}</h2>
                  <p style={{ fontSize: '13px', color: '#334155' }}>Title: <b>{adminPaymentDetails[paymentMethod].title}</b></p>
                </div>
                <button type="button" onClick={handleCopyNumber} style={{ background: copied ? '#16a34a' : '#2563eb', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <form onSubmit={handleBookingSubmit}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Transaction ID (TID) from SMS:</label>
              <input
                type="text" placeholder="e.g. 02938475618" required value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                style={{ width: '100%', padding: '10px', margin: '6px 0 15px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary" disabled={submittingToken} style={{ flex: 1, padding: '12px' }}>
                  {submittingToken ? 'Submitting...' : isSale ? 'Submit Bayana Token' : 'Lock These Dates'}
                </button>
                <button type="button" onClick={() => setShowTokenModal(false)} style={{ flex: 1, background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {showVideoModal && (
        <div className="modal-overlay" style={{ zIndex: 999999 }}>
          <div className="modal-content" style={{ maxWidth: '800px', width: '100%', padding: '20px', background: '#0f172a', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', color: 'white' }}>
              <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>🎥 Video Tour: {house.title}</h4>
              <button onClick={() => setShowVideoModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
              <iframe
                src={
                  house?.videoUrl?.includes('youtu.be')
                    ? `https://www.youtube.com/embed/${house.videoUrl.split('/').pop().split('?')[0]}?autoplay=1`
                    : house?.videoUrl?.includes('shorts')
                    ? `https://www.youtube.com/embed/${house.videoUrl.split('shorts/')[1]?.split('?')[0]}?autoplay=1`
                    : house?.videoUrl?.includes('watch?v=')
                    ? `https://www.youtube.com/embed/${house.videoUrl.split('watch?v=')[1]?.split('&')[0]}?autoplay=1`
                    : house?.videoUrl || ''
                }
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Property Video Tour"
              />
            </div>
          </div>
        </div>
      )}

      {showAgreementModal && (
        <RentAgreementModal house={house} onClose={() => setShowAgreementModal(false)} />
      )}

      {showChatModal && (
        <ChatModal
          house={house}
          receiverId={houseOwnerId}
          receiverName={house.owner?.name}
          onClose={() => setShowChatModal(false)}
        />
      )}
    </div>
  );
};

export default HouseDetails;