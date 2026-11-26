/* eslint-disable */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Handshake, CheckCircle, XCircle, MessageSquare, ShieldCheck, ArrowLeft, Home, Phone, MessageCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://house-rent-app-ten.vercel.app';

// 🔒 ابھی اعتماد بنانے کے لیے آن لائن پیمنٹ بند ہے (بعد میں آن کرنے کے لیے true کر دیں)
const ENABLE_ONLINE_PAYMENT = false;

const formatPKR = (amount) => {
  const num = Number(amount) || 0;
  if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Crore`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)} Lac`;
  return num.toLocaleString();
};

const Offers = () => {
  const { currentUser, lang } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('received');
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counterInputs, setCounterInputs] = useState({});
  const [payOffer, setPayOffer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('JazzCash');
  const [transactionId, setTransactionId] = useState('');
  const [submittingPay, setSubmittingPay] = useState(false);

  const currentUserId = currentUser?.id || currentUser?._id;

  const adminPaymentDetails = {
    JazzCash: { number: '03001234567', title: 'Muhammad Mehraj' },
    EasyPaisa: { number: '03119876543', title: 'Muhammad Mehraj' },
  };

  const fetchOffers = async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/api/offers/user/${currentUserId}`);
      setReceived(res.data.received || []);
      setSent(res.data.sent || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
    const interval = setInterval(fetchOffers, 5000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  const handleRespond = async (offerId, action, counterAmount = 0) => {
    try {
      await axios.put(`${API_URL}/api/offers/${offerId}/respond`, {
        action,
        userId: currentUserId,
        counterRent: counterAmount,
      });
      fetchOffers();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const getEscrowAmounts = (offer) => {
    const agreed = offer.finalAgreedRent || offer.counterRent || offer.offeredRent || 0;
    const isSaleOffer = offer.rentType === 'sale' || offer.house?.purpose === 'sale';
    if (isSaleOffer) {
      const bayanaToken = Math.min(Math.max(Math.round(agreed * 0.01), 25000), 100000);
      const fee = Math.round(bayanaToken * 0.05) || 1000;
      return { base: bayanaToken, fee, total: bayanaToken + fee, isSaleOffer: true };
    }
    const fee = Math.round(agreed * 0.1) || 500;
    return { base: agreed, fee, total: agreed + fee, isSaleOffer: false };
  };

  const handleEscrowPay = async (e) => {
    e.preventDefault();
    if (!payOffer) return;

    const { base, fee, total, isSaleOffer } = getEscrowAmounts(payOffer);

    setSubmittingPay(true);
    try {
      await axios.post(`${API_URL}/api/bookings/create`, {
        houseId: payOffer.house?._id,
        tenantId: currentUserId,
        landlordId: payOffer.landlord?._id || payOffer.landlord,
        rentType: payOffer.rentType,
        checkIn: payOffer.checkIn,
        checkOut: payOffer.checkOut,
        durationCount: payOffer.durationCount,
        totalAmount: total,
        platformFee: fee,
        landlordAmount: base,
        paymentMethod,
        transactionId,
      });

      await axios.put(`${API_URL}/api/offers/${payOffer._id}/booked`);
      alert(
        isSaleOffer
          ? 'Bayana Token locked at agreed price! 🎉'
          : 'Booking locked at your agreed offer price! 🎉'
      );
      setPayOffer(null);
      setTransactionId('');
      fetchOffers();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingPay(false);
    }
  };

  const formatWhatsAppNumber = (phone) => {
    if (!phone) return '';
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) cleaned = '92' + cleaned.substring(1);
    return cleaned;
  };

  if (!currentUser) {
    return (
      <div style={{ maxWidth: '500px', margin: '60px auto', padding: '30px', textAlign: 'center', background: '#fff', borderRadius: '14px' }}>
        <h2>Please Log In</h2>
        <button className="btn-primary" onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  const list = tab === 'received' ? received : sent;

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '0 20px' }}>
      <button className="btn-outline" onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{ background: '#fef3c7', color: '#b45309', padding: '10px', borderRadius: '12px', display: 'flex' }}>
            <Handshake size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px' }}>
              {lang === 'en' ? 'Rent & Purchase Offers' : 'کرایہ اور خریداری کی آفرز'}
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              {ENABLE_ONLINE_PAYMENT
                ? 'Accept, Counter-Offer, or Pay Token/Rent via Escrow'
                : 'Accept, Counter-Offer, and Connect Directly with Owner / Buyer'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => setTab('received')}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer',
              border: tab === 'received' ? '2px solid #2563eb' : '1px solid #cbd5e1',
              background: tab === 'received' ? '#eff6ff' : '#fff',
              color: tab === 'received' ? '#1d4ed8' : '#64748b',
            }}
          >
            📥 Incoming Offers ({received.length})
          </button>
          <button
            onClick={() => setTab('sent')}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer',
              border: tab === 'sent' ? '2px solid #2563eb' : '1px solid #cbd5e1',
              background: tab === 'sent' ? '#eff6ff' : '#fff',
              color: tab === 'sent' ? '#1d4ed8' : '#64748b',
            }}
          >
            📤 My Sent Offers ({sent.length})
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>Loading offers...</p>
        ) : list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <Handshake size={40} color="#cbd5e1" />
            <p>No offers in this tab yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {list.map((offer) => {
              const isSaleOffer = offer.rentType === 'sale' || offer.house?.purpose === 'sale';
              const activeAmount = offer.counterRent > 0 ? offer.counterRent : offer.offeredRent;
              const isMyTurn =
                (tab === 'received' && offer.lastActionBy === 'tenant') ||
                (tab === 'sent' && offer.lastActionBy === 'landlord');
              const canRespond = (offer.status === 'pending' || offer.status === 'countered') && isMyTurn;
              const escrow = getEscrowAmounts(offer);

              const otherParty = tab === 'received' ? offer.tenant : offer.landlord;
              const otherPartyId = otherParty?._id || otherParty;
              const otherPhone = otherParty?.phone;

              return (
                <div key={offer._id} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <img
                        src={offer.house?.images?.[0] || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=200'}
                        alt=""
                        style={{ width: '64px', height: '54px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '10px', fontWeight: 'bold', padding: '2px 7px', borderRadius: '6px',
                              background: isSaleOffer ? '#ecfdf5' : '#eff6ff',
                              color: isSaleOffer ? '#047857' : '#1d4ed8',
                            }}
                          >
                            {isSaleOffer ? '🏷️ PURCHASE OFFER' : '🏢 RENT OFFER'}
                          </span>
                          <h4
                            onClick={() => navigate(`/house/${offer.house?._id}`)}
                            style={{ margin: 0, fontSize: '16px', color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                          >
                            <Home size={14} color="#2563eb" /> {offer.house?.title}
                          </h4>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                          {tab === 'received' ? `From: ${offer.tenant?.name}` : `Owner: ${offer.landlord?.name}`}
                          {!isSaleOffer && (
                            <> • {new Date(offer.checkIn).toLocaleDateString()} → {new Date(offer.checkOut).toLocaleDateString()} ({offer.durationCount} {offer.rentType})</>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '999px', textTransform: 'uppercase',
                        background: offer.status === 'accepted' || offer.status === 'booked' ? '#dcfce7' : offer.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                        color: offer.status === 'accepted' || offer.status === 'booked' ? '#15803d' : offer.status === 'rejected' ? '#b91c1c' : '#b45309',
                      }}
                    >
                      {offer.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px', padding: '10px 12px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                    <span>
                      Original: <s style={{ color: '#94a3b8' }}>PKR {isSaleOffer ? formatPKR(offer.originalRent) : offer.originalRent?.toLocaleString()}</s>
                    </span>
                    <span style={{ color: isSaleOffer ? '#047857' : '#2563eb', fontWeight: 'bold' }}>
                      {offer.counterRent > 0 ? 'Latest Counter:' : 'Offered:'} PKR {isSaleOffer ? formatPKR(activeAmount) : activeAmount?.toLocaleString()}
                    </span>
                    {offer.note && <span style={{ color: '#475569' }}>Note: &ldquo;{offer.note}&rdquo;</span>}
                  </div>

                  {canRespond && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px', alignItems: 'center' }}>
                      <button
                        onClick={() => handleRespond(offer._id, 'accept')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#16a34a', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                      >
                        <CheckCircle size={14} /> Accept (PKR {isSaleOffer ? formatPKR(activeAmount) : activeAmount.toLocaleString()})
                      </button>

                      <input
                        type="number"
                        placeholder="Counter PKR..."
                        value={counterInputs[offer._id] || ''}
                        onChange={(e) => setCounterInputs({ ...counterInputs, [offer._id]: e.target.value })}
                        style={{ width: '140px', padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                      />
                      <button
                        onClick={() => handleRespond(offer._id, 'counter', counterInputs[offer._id])}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#2563eb', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                      >
                        <MessageSquare size={14} /> Counter
                      </button>

                      <button
                        onClick={() => handleRespond(offer._id, 'reject')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  )}

                  {/* آفر منظور ہونے پر: مفت براہِ راست رابطہ یا Escrow */}
                  {offer.status === 'accepted' && (
                    ENABLE_ONLINE_PAYMENT && tab === 'sent' ? (
                      <div style={{ marginTop: '12px' }}>
                        <button
                          onClick={() => setPayOffer(offer)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            background: isSaleOffer ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #e11d48, #be123c)',
                            color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px',
                            fontWeight: 'bold', fontSize: '13px', cursor: 'pointer'
                          }}
                        >
                          <ShieldCheck size={16} />
                          {isSaleOffer
                            ? `Pay Bayana Token via Escrow (PKR ${escrow.total.toLocaleString()})`
                            : `Pay Agreed Price via Escrow (PKR ${escrow.total.toLocaleString()})`}
                        </button>
                      </div>
                    ) : (
                      <div style={{ marginTop: '12px', padding: '12px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ fontSize: '13px', color: '#065f46', fontWeight: '600' }}>
                          🎉 Deal Agreed at <b>PKR {isSaleOffer ? formatPKR(offer.finalAgreedRent || activeAmount) : (offer.finalAgreedRent || activeAmount)?.toLocaleString()}</b>! Contact directly to finalize:
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {otherPhone && (
                            <a
                              href={`tel:${otherPhone}`}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' }}
                            >
                              <Phone size={14} color="#2563eb" /> Call {otherPhone}
                            </a>
                          )}
                          {otherPhone && (
                            <a
                              href={`https://wa.me/${formatWhatsAppNumber(otherPhone)}?text=${encodeURIComponent(`Assalam-o-Alaikum! Our offer for "${offer.house?.title}" has been accepted. Let's finalize the visit!`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#16a34a', color: '#ffffff', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' }}
                            >
                              <MessageCircle size={14} /> WhatsApp
                            </a>
                          )}
                          {otherPartyId && (
                            <button
                              type="button"
                              onClick={() =>
                                navigate('/messages', {
                                  state: { receiverId: otherPartyId, receiverName: otherParty?.name },
                                })
                              }
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#0f172a', color: '#ffffff', border: 'none', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                              <MessageSquare size={14} /> Live Chat
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {ENABLE_ONLINE_PAYMENT && payOffer && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.75)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', maxWidth: '460px', width: '100%' }}>
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck color="#2563eb" /> Pay Agreed Offer via Escrow
            </h3>
            <p style={{ fontSize: '13px', color: '#475569' }}>
              Agreed Price: <b>PKR {formatPKR(payOffer.finalAgreedRent)}</b> • Escrow Total:{' '}
              <b>PKR {getEscrowAmounts(payOffer).total.toLocaleString()}</b>
            </p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              {['JazzCash', 'EasyPaisa'].map((m) => (
                <button
                  key={m} type="button" onClick={() => setPaymentMethod(m)}
                  style={{ flex: 1, padding: '9px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: paymentMethod === m ? '2px solid #2563eb' : '1px solid #cbd5e1', background: paymentMethod === m ? '#eff6ff' : '#fff' }}
                >
                  {m}
                </button>
              ))}
            </div>

            <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
              <b>{paymentMethod}:</b> {adminPaymentDetails[paymentMethod].number} ({adminPaymentDetails[paymentMethod].title})
            </div>

            <form onSubmit={handleEscrowPay}>
              <input
                type="text" required placeholder="Enter Transaction ID (TID)" value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '12px' }}
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary" disabled={submittingPay} style={{ flex: 1, padding: '11px' }}>
                  {submittingPay ? 'Locking...' : 'Confirm & Lock Deal'}
                </button>
                <button type="button" onClick={() => setPayOffer(null)} style={{ flex: 1, background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Offers;