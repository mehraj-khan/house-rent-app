/* eslint-disable */
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, Bed, Bath, Phone, Mail, ArrowLeft, Trash2, MessageCircle, 
  ShieldCheck, Copy, Check, Calendar, AlertCircle, Sparkles, Clock, 
  Star, User as UserIcon, Send, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RentAgreementModal from '../components/RentAgreementModal.jsx'; // کرایہ نامہ پاپ اپ

const HouseDetails = () => {
  const { id } = useParams();
  const [house, setHouse] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const { currentUser, lang } = useAuth();
  const navigate = useNavigate();

  // تاریخوں اور بکنگ کی اسٹیٹس
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [bookedDates, setBookedDates] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState('daily');
  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(tomorrowStr);
  const [durationCount, setDurationCount] = useState(1);
  const [dateError, setDateError] = useState('');

  // ریویوز کی اسٹیٹس
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // پیمنٹ پاپ اپ اسٹیٹس
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('JazzCash');
  const [transactionId, setTransactionId] = useState('');
  const [submittingToken, setSubmittingToken] = useState(false);
  const [copied, setCopied] = useState(false);

  // 📄 قانونی کرایہ نامہ پاپ اپ اسٹیٹ (درست جگہ پر)
  const [showAgreementModal, setShowAgreementModal] = useState(false);

  const adminPaymentDetails = {
    JazzCash: { number: '03001234567', title: 'Muhammad Mehraj' },
    EasyPaisa: { number: '03119876543', title: 'Muhammad Mehraj' }
  };

  const fetchHouseAndReviews = async () => {
    try {
      const [houseRes, bookedRes, reviewsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/houses/${id}`),
        axios.get(`http://localhost:5000/api/bookings/booked-dates/${id}`).catch(() => ({ data: [] })),
        axios.get(`http://localhost:5000/api/reviews/${id}`).catch(() => ({ data: [] }))
      ]);
      setHouse(houseRes.data);
      setActiveImage(houseRes.data.images?.[0] || '');
      if (houseRes.data.availableFor?.length > 0) {
        setSelectedDuration(houseRes.data.availableFor[0]);
      }
      setBookedDates(bookedRes.data || []);
      setReviews(reviewsRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHouseAndReviews();
  }, [id]);

  const currentUserId = currentUser?.id || currentUser?._id;
  const houseOwnerId = house?.owner?._id || house?.owner;
  const isActualOwner = Boolean(currentUserId && houseOwnerId && String(currentUserId) === String(houseOwnerId));

  useEffect(() => {
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
  }, [checkIn, checkOut, selectedDuration, bookedDates, house]);

  const calculateBill = () => {
    let baseRate = 0;
    if (selectedDuration === 'daily') baseRate = house?.pricePerDay || 2000;
    if (selectedDuration === 'monthly') baseRate = house?.rentPrice || 35000;
    if (selectedDuration === 'yearly') baseRate = house?.pricePerYear || (house?.rentPrice * 12) || 400000;

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
    if (dateError) {
      alert(dateError);
      return;
    }
    setShowTokenModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please log in first to complete your booking!');
      navigate('/login');
      return;
    }

    setSubmittingToken(true);
    try {
      await axios.post('http://localhost:5000/api/bookings/create', {
        houseId: id,
        tenantId: currentUserId,
        landlordId: houseOwnerId,
        rentType: selectedDuration,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        durationCount,
        totalAmount: bill.totalAmount,
        platformFee: bill.platformFee,
        landlordAmount: bill.landlordAmount,
        paymentMethod,
        transactionId,
      });

      alert('Reservation submitted to Escrow! Dates are locked 🎉');
      setShowTokenModal(false);
      setTransactionId('');
      window.location.reload();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingToken(false);
    }
  };

  // ریویو سبمٹ کرنا
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please log in to submit a review!');
      navigate('/login');
      return;
    }

    setSubmittingReview(true);
    try {
      await axios.post('http://localhost:5000/api/reviews/add', {
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

  if (!house) return <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

  const whatsappUrl = `https://wa.me/${formatWhatsAppNumber(house.owner?.phone)}?text=${encodeURIComponent(`Assalam-o-Alaikum! Is "${house.title}" available from ${checkIn} to ${checkOut}?`)}`;

  return (
    <div className="container" style={{ maxWidth: '1050px', marginTop: '30px' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563eb', textDecoration: 'none', fontWeight: 'bold', marginBottom: '15px' }}>
        <ArrowLeft size={18} /> Back to Listings
      </Link>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* بایاں حصہ */}
        <div style={{ flex: '1 1 600px' }}>
          <div className="house-card" style={{ padding: '20px', marginBottom: '20px' }}>
            <img src={activeImage || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600'} alt={house.title}
              style={{ width: '100%', height: '380px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px' }} />

            {house.images && house.images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '15px' }}>
                {house.images.map((img, index) => (
                  <img key={index} src={img} alt={`Thumb ${index}`} onClick={() => setActiveImage(img)}
                    style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: activeImage === img ? '2.5px solid #2563eb' : '1px solid #cbd5e1' }} />
                ))}
              </div>
            )}

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

            {(house.availableFrom || house.availableTo) && (
              <div style={{ background: '#eff6ff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock color="#2563eb" size={18} />
                <span style={{ fontSize: '13px', color: '#1e40af' }}>
                  <b>Host Availability Window:</b> Available {house.availableFrom ? `from ${new Date(house.availableFrom).toLocaleDateString()}` : 'anytime'} {house.availableTo ? `until ${new Date(house.availableTo).toLocaleDateString()}` : 'onwards'}.
                </span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '20px', padding: '12px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', marginBottom: '15px' }}>
              <span><Bed size={18} /> <b>{house.bedrooms}</b> Bedrooms</span>
              <span><Bath size={18} /> <b>{house.bathrooms}</b> Bathrooms</span>
            </div>

            <h3>About this space</h3>
            <p style={{ lineHeight: '1.6', color: '#334155', margin: '8px 0 20px' }}>{house.description}</p>

            {/* مالک اور واٹس ایپ باکس */}
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
              <p style={{ fontSize: '14px', marginBottom: '6px' }}>Host: <b>{house.owner?.name || 'Hotel Host'}</b> ({house.owner?.phone || 'N/A'})</p>
              
              {/* واٹس ایپ بٹن */}
              {house.owner?.phone && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp" style={{ marginTop: '8px' }}>
                  <MessageCircle size={18} /> Message Host on WhatsApp
                </a>
              )}

              {/* 📄 قانونی کرایہ نامہ جنریٹر بٹن (درست جگہ پر شامل کیا گیا) */}
              <button
                type="button"
                onClick={() => setShowAgreementModal(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#ffffff',
                  color: '#15803d',
                  border: '2px solid #15803d',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '10px',
                  transition: '0.2s'
                }}
              >
                <FileText size={18} color="#15803d" />
                Download Legal Rent Agreement PDF (قانونی کرایہ نامہ)
              </button>
            </div>

            {/* ریویوز سیکشن */}
            <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '25px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <Star size={20} fill="#eab308" color="#eab308" />
                Guest Reviews & Ratings ({reviews.length})
              </h3>

              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
                <h4 style={{ fontSize: '15px', marginBottom: '10px' }}>Leave a Review for this Home:</h4>
                
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
                  ></textarea>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Send size={15} />
                    {submittingReview ? 'Posting Review...' : 'Post Review'}
                  </button>
                </form>
              </div>

              {reviews.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '14px' }}>No reviews yet. Be the first guest to leave a review!</p>
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
                            <h5 style={{ fontSize: '14px', margin: 0 }}>{rev.user?.name || 'Verified Guest'}</h5>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={14} fill={s <= rev.rating ? '#eab308' : '#e2e8f0'} color={s <= rev.rating ? '#eab308' : '#e2e8f0'} />
                          ))}
                        </div>
                      </div>

                      <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', marginTop: '6px' }}>
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* دایاں حصہ: Airbnb کارڈ */}
        <div style={{ flex: '1 1 350px', position: 'sticky', top: '20px' }}>
          <div className="house-card" style={{ padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1.5px solid #e2e8f0' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '15px' }}>
              <div>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>
                  PKR {selectedDuration === 'daily' ? (house.pricePerDay || 2000).toLocaleString() : selectedDuration === 'monthly' ? house.rentPrice.toLocaleString() : (house.pricePerYear || house.rentPrice * 12).toLocaleString()}
                </span>
                <span style={{ color: '#64748b', fontSize: '14px' }}>
                  {selectedDuration === 'daily' ? ' / night' : selectedDuration === 'monthly' ? ' / month' : ' / year'}
                </span>
              </div>
            </div>

            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' }}>Stay Type:</label>
            <div style={{ display: 'flex', gap: '6px', margin: '6px 0 15px' }}>
              {['daily', 'monthly', 'yearly'].map(type => (
                <button
                  key={type} type="button" onClick={() => setSelectedDuration(type)}
                  style={{ flex: 1, padding: '8px 4px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', border: selectedDuration === type ? '2px solid #2563eb' : '1px solid #cbd5e1', background: selectedDuration === type ? '#eff6ff' : '#fff', color: selectedDuration === type ? '#2563eb' : '#64748b', textTransform: 'capitalize' }}
                >
                  {type}
                </button>
              ))}
            </div>

            <div style={{ border: dateError ? '2px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #cbd5e1' }}>
                <div style={{ flex: 1, padding: '8px 10px', borderRight: '1px solid #cbd5e1' }}>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', display: 'block' }}>CHECK-IN</label>
                  <input
                    type="date" required
                    min={todayStr}
                    value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: '12px', cursor: 'pointer' }}
                  />
                </div>
                <div style={{ flex: 1, padding: '8px 10px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', display: 'block' }}>CHECKOUT</label>
                  <input
                    type="date" required
                    min={checkIn || todayStr}
                    value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: '12px', cursor: 'pointer' }}
                  />
                </div>
              </div>
              <div style={{ padding: '8px 10px', background: '#f8fafc', fontSize: '12px', color: '#334155' }}>
                Duration: <b>{durationCount} {selectedDuration === 'daily' ? 'Days' : selectedDuration === 'monthly' ? 'Months' : 'Years'}</b>
              </div>
            </div>

            {dateError && (
              <div style={{ background: '#fee2e2', border: '1px solid #f87171', color: '#991b1b', padding: '10px', borderRadius: '6px', fontSize: '12px', marginBottom: '15px' }}>
                {dateError}
              </div>
            )}

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginBottom: '15px', fontSize: '14px', color: '#475569' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Rent ({durationCount} {selectedDuration}):</span>
                <span>PKR {bill.totalRent.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#16a34a' }}>
                <span>Escrow Service Fee:</span>
                <span>PKR {bill.platformFee.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1.5px solid #e2e8f0', fontWeight: 'bold', fontSize: '17px', color: '#0f172a' }}>
                <span>Total:</span>
                <span style={{ color: '#2563eb' }}>PKR {bill.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleOpenBookingModal}
              style={{
                width: '100%', padding: '14px',
                background: 'linear-gradient(135deg, #e11d48, #be123c)',
                color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 4px 15px rgba(225, 29, 72, 0.35)'
              }}
            >
              <Sparkles size={18} />
              Reserve Available Dates
            </button>
          </div>
        </div>

      </div>

      {/* پیمنٹ پاپ اپ */}
      {showTokenModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0, 0, 0, 0.75)', zIndex: 999999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px'
        }}>
          <div style={{
            background: '#ffffff', padding: '25px', borderRadius: '12px',
            maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck color="#2563eb" /> Pay PKR {bill.totalAmount.toLocaleString()}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>
              Booked from <b>{checkIn}</b> to <b>{checkOut}</b> ({durationCount} {selectedDuration}).
            </p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <button type="button" onClick={() => setPaymentMethod('JazzCash')}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', border: paymentMethod === 'JazzCash' ? '2.5px solid #2563eb' : '1px solid #cbd5e1', background: paymentMethod === 'JazzCash' ? '#eff6ff' : '#fff', color: paymentMethod === 'JazzCash' ? '#2563eb' : '#64748b' }}>
                JazzCash
              </button>
              <button type="button" onClick={() => setPaymentMethod('EasyPaisa')}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', border: paymentMethod === 'EasyPaisa' ? '2.5px solid #2563eb' : '1px solid #cbd5e1', background: paymentMethod === 'EasyPaisa' ? '#eff6ff' : '#fff', color: paymentMethod === 'EasyPaisa' ? '#2563eb' : '#64748b' }}>
                EasyPaisa
              </button>
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
              <input type="text" placeholder="e.g. 02938475618" required value={transactionId} onChange={(e) => setTransactionId(e.target.value)}
                style={{ width: '100%', padding: '10px', margin: '6px 0 15px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary" disabled={submittingToken} style={{ flex: 1, padding: '12px' }}>
                  {submittingToken ? 'Submitting...' : 'Lock These Dates'}
                </button>
                <button type="button" onClick={() => setShowTokenModal(false)} style={{ flex: 1, background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📄 قانونی کرایہ نامہ کا پاپ اپ (درست اور محفوظ جگہ پر) */}
      {showAgreementModal && (
        <RentAgreementModal house={house} onClose={() => setShowAgreementModal(false)} />
      )}

    </div>
  );
};

export default HouseDetails;