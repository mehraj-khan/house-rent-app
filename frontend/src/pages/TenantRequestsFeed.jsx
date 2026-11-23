/* eslint-disable */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  PlusCircle,
  Send,
  MessageSquare,
  Phone,
  Eye,
  ChevronDown,
  ChevronUp,
  Home,
  Lock,
} from 'lucide-react';

const API_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://house-rent-app-ten.vercel.app';

const TenantRequestsFeed = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [cityFilter, setCityFilter] = useState('');
  const [myHouses, setMyHouses] = useState([]);
  const [activeView, setActiveView] = useState('all'); // 'all' | 'mine'
  const [toggledIds, setToggledIds] = useState({});

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedHouseId, setSelectedHouseId] = useState('');
  const [offeredRent, setOfferedRent] = useState('');
  const [offerMsg, setOfferMsg] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);

  const currentUserId = currentUser?.id || currentUser?._id;

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/tenant-requests/all?city=${encodeURIComponent(cityFilter)}`
      );
      setRequests(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
    if (currentUserId) {
      axios
        .get(`${API_URL}/api/houses/owner/${currentUserId}`)
        .then((res) => setMyHouses(res.data || []))
        .catch(() => {});
    }
  }, [cityFilter, currentUserId]);

  const handleSendOffer = async (e) => {
    e.preventDefault();
    if (!selectedHouseId) {
      alert('Please select one of your properties to offer!');
      return;
    }

    setSubmittingOffer(true);
    try {
      await axios.post(`${API_URL}/api/tenant-requests/send-offer`, {
        requestId: selectedRequest._id,
        landlordId: currentUserId,
        houseId: selectedHouseId,
        offeredRent: Number(offeredRent),
        message: offerMsg,
      });

      alert('Offer sent successfully to the tenant! 🏠📩');
      setSelectedRequest(null);
      setSelectedHouseId('');
      setOfferMsg('');
      fetchRequests();
    } catch (err) {
      alert('Error sending offer: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingOffer(false);
    }
  };

  const myRequestsCount = requests.filter(
    (r) => currentUserId && (r.tenant?._id || r.tenant) === currentUserId
  ).length;

  const myTotalOffersCount = requests.reduce((sum, r) => {
    const isMine = currentUserId && (r.tenant?._id || r.tenant) === currentUserId;
    return isMine ? sum + (r.offers?.length || 0) : sum;
  }, 0);

  const visibleRequests =
    activeView === 'mine'
      ? requests.filter(
          (r) => currentUserId && (r.tenant?._id || r.tenant) === currentUserId
        )
      : requests;

  const toggleOffers = (reqId, currentlyOpen) => {
    setToggledIds((prev) => ({ ...prev, [reqId]: !currentlyOpen }));
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '960px',
        margin: '24px auto 80px',
        padding: '0 14px',
        boxSizing: 'border-box',
      }}
    >
      {/* ہیڈر بینر */}
      <div
        className="house-card"
        style={{
          padding: '22px',
          background: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '18px',
          borderRadius: '14px',
        }}
      >
        <div style={{ flex: '1 1 260px' }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(18px, 3vw, 22px)' }}>
            📢 Tenant Demands: &quot;Mujhe Ghar Chahiye&quot;
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '13px', opacity: 0.85 }}>
            Tenants post their budgets &amp; areas. Landlords send matching houses directly!
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => navigate('/post-request')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#2563eb',
            padding: '10px 16px',
          }}
        >
          <PlusCircle size={18} /> Post Your Demand (مجھے گھر چاہیے)
        </button>
      </div>

      {/* فلٹر ٹیبز + سٹی سرچ */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '18px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveView('all')}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
              background: activeView === 'all' ? '#2563eb' : '#f1f5f9',
              color: activeView === 'all' ? '#fff' : '#334155',
            }}
          >
            All Demands ({requests.length})
          </button>

          {currentUserId && (
            <button
              type="button"
              onClick={() => setActiveView('mine')}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px',
                background: activeView === 'mine' ? '#16a34a' : '#f0fdf4',
                color: activeView === 'mine' ? '#fff' : '#166534',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              📩 My Requests &amp; Offers ({myRequestsCount})
              {myTotalOffersCount > 0 && (
                <span
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '11px',
                    padding: '1px 7px',
                    borderRadius: '999px',
                  }}
                >
                  {myTotalOffersCount} Offers
                </span>
              )}
            </button>
          )}
        </div>

        <input
          type="text"
          placeholder="Filter by city (e.g. Lahore)..."
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          style={{
            flex: '1 1 220px',
            maxWidth: '340px',
            boxSizing: 'border-box',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '14px',
          }}
        />
      </div>

      {/* تمام ڈیمانڈز کی لسٹ */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {visibleRequests.length === 0 ? (
          <div className="house-card" style={{ padding: '36px 20px', textAlign: 'center' }}>
            <p style={{ color: '#64748b' }}>
              {activeView === 'mine'
                ? "You haven't posted any house demand yet."
                : 'No active tenant demands found.'}
            </p>
            <button
              className="btn-primary"
              onClick={() => navigate('/post-request')}
              style={{ marginTop: '10px' }}
            >
              Post Requirement
            </button>
          </div>
        ) : (
          visibleRequests.map((req) => {
            const reqTenantId = req.tenant?._id || req.tenant;
            const isMyRequest = Boolean(
              currentUserId && reqTenantId && currentUserId === reqTenantId
            );
            const allOffers = req.offers || [];

            // 🔒 پرائیویسی: صرف وہی آفرز دکھیں جو یا میری ڈیمانڈ پر آئیں یا میں نے خود بھیجیں
            const visibleOffers = allOffers.filter((offer) => {
              const offerLandlordId = offer.landlord?._id || offer.landlord;
              return (
                isMyRequest ||
                (currentUserId && offerLandlordId === currentUserId)
              );
            });

            const isExpanded =
              toggledIds[req._id] !== undefined
                ? toggledIds[req._id]
                : isMyRequest && visibleOffers.length > 0;

            return (
              <div
                key={req._id}
                className="house-card"
                style={{
                  padding: '20px',
                  borderLeft: isMyRequest ? '5px solid #16a34a' : '5px solid #2563eb',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ flex: '1 1 250px' }}>
                    <h3 style={{ margin: '0 0 6px', fontSize: '18px', color: '#0f172a' }}>
                      Need {req.bedrooms} Bed in {req.area}, {req.city}
                      {isMyRequest && (
                        <span
                          style={{
                            marginLeft: '8px',
                            fontSize: '11px',
                            background: '#dcfce7',
                            color: '#166534',
                            padding: '2px 8px',
                            borderRadius: '999px',
                          }}
                        >
                          Your Demand
                        </span>
                      )}
                    </h3>
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#64748b',
                        display: 'flex',
                        gap: '12px',
                        flexWrap: 'wrap',
                        margin: '6px 0',
                      }}
                    >
                      <span>
                        👤 Tenant: <b>{req.tenant?.name || 'User'}</b>
                      </span>
                      <span>
                        👨‍👩‍👧‍👦 Type:{' '}
                        <b>
                          {req.tenantType === 'family' ? 'Family' : 'Bachelors'} (
                          {req.familyMembers} Persons)
                        </b>
                      </span>
                      <span>
                        📅 Move-in:{' '}
                        <b>
                          {req.moveInDate
                            ? new Date(req.moveInDate).toLocaleDateString()
                            : 'Flexible'}
                        </b>
                      </span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>
                      Budget:
                    </span>
                    <span style={{ fontSize: '17px', fontWeight: 'bold', color: '#16a34a' }}>
                      PKR {req.budgetMin?.toLocaleString()} -{' '}
                      {req.budgetMax?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {req.description && (
                  <p
                    style={{
                      background: '#f8fafc',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: '#334155',
                      margin: '10px 0',
                    }}
                  >
                    &ldquo;{req.description}&rdquo;
                  </p>
                )}

                {/* آفرز بٹن + لینڈلارڈ ایکشن */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginTop: '12px',
                    paddingTop: '10px',
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleOffers(req._id, isExpanded)}
                    style={{
                      background: allOffers.length > 0 ? '#eff6ff' : '#f8fafc',
                      color: allOffers.length > 0 ? '#1d4ed8' : '#64748b',
                      border:
                        allOffers.length > 0
                          ? '1px solid #93c5fd'
                          : '1px solid #e2e8f0',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    📩 {allOffers.length} Landlord Offers Received
                    {allOffers.length > 0 &&
                      (isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />)}
                  </button>

                  {currentUserId && !isMyRequest && (
                    <button
                      type="button"
                      onClick={() => {
                        if (myHouses.length === 0) {
                          alert(
                            'You must have at least one property listed in "My Properties" to send an offer!'
                          );
                          return;
                        }
                        setSelectedRequest(req);
                        setOfferedRent(req.budgetMax);
                      }}
                      style={{
                        background: '#16a34a',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                      }}
                    >
                      <Send size={15} /> Send Property Offer (مکان پیش کریں)
                    </button>
                  )}
                </div>

                {/* 🔒 پرائیویٹ آفرز سیکشن */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: '14px',
                      padding: '12px',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      display: 'grid',
                      gap: '12px',
                    }}
                  >
                    {visibleOffers.length === 0 ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '13px',
                          color: '#64748b',
                        }}
                      >
                        <Lock size={15} />
                        <span>
                          {allOffers.length > 0
                            ? `${allOffers.length} offer(s) sent — only visible to the tenant who posted this demand.`
                            : 'No landlord offers received yet.'}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>
                          🏠 {isMyRequest ? 'Matching Houses Offered to You' : 'Your Sent Offer'} (
                          {visibleOffers.length}):
                        </div>

                        {visibleOffers.map((offer, idx) => {
                          const houseObj = offer.house;
                          const houseId = houseObj?._id || houseObj;
                          const landlordObj = offer.landlord;
                          const landlordId = landlordObj?._id || landlordObj;

                          return (
                            <div
                              key={offer._id || idx}
                              style={{
                                background: '#ffffff',
                                padding: '14px',
                                borderRadius: '10px',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '12px',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  gap: '12px',
                                  alignItems: 'center',
                                  flex: '1 1 260px',
                                  minWidth: 0,
                                }}
                              >
                                {houseObj?.images?.[0] ? (
                                  <img
                                    src={houseObj.images[0]}
                                    alt={houseObj.title || 'House'}
                                    style={{
                                      width: '76px',
                                      height: '64px',
                                      objectFit: 'cover',
                                      borderRadius: '8px',
                                      flexShrink: 0,
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: '76px',
                                      height: '64px',
                                      borderRadius: '8px',
                                      background: '#eff6ff',
                                      color: '#2563eb',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0,
                                    }}
                                  >
                                    <Home size={24} />
                                  </div>
                                )}

                                <div style={{ minWidth: 0 }}>
                                  <div
                                    style={{
                                      fontWeight: 'bold',
                                      fontSize: '15px',
                                      color: '#0f172a',
                                    }}
                                  >
                                    {houseObj?.title || 'Offered House'}
                                  </div>
                                  {(houseObj?.address || houseObj?.city) && (
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                                      📍 {houseObj.address}
                                      {houseObj.address && houseObj.city ? ', ' : ''}
                                      {houseObj.city}
                                    </div>
                                  )}
                                  <div
                                    style={{
                                      fontSize: '14px',
                                      fontWeight: 'bold',
                                      color: '#16a34a',
                                      marginTop: '3px',
                                    }}
                                  >
                                    Offered Rent: PKR{' '}
                                    {offer.offeredRent?.toLocaleString()} / mo
                                  </div>
                                  <div
                                    style={{
                                      fontSize: '12px',
                                      color: '#475569',
                                      marginTop: '3px',
                                    }}
                                  >
                                    👤 Owner: <b>{landlordObj?.name || 'Landlord'}</b>
                                    {landlordObj?.phone ? ` • ${landlordObj.phone}` : ''}
                                  </div>
                                  {offer.message && (
                                    <p
                                      style={{
                                        margin: '6px 0 0',
                                        fontSize: '12px',
                                        color: '#334155',
                                        background: '#f8fafc',
                                        padding: '6px 8px',
                                        borderRadius: '6px',
                                      }}
                                    >
                                      &ldquo;{offer.message}&rdquo;
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {landlordObj?.phone && isMyRequest && (
                                  <a
                                    href={`tel:${landlordObj.phone}`}
                                    style={{
                                      background: '#f8fafc',
                                      color: '#0f172a',
                                      border: '1px solid #cbd5e1',
                                      padding: '8px 12px',
                                      borderRadius: '8px',
                                      fontWeight: 'bold',
                                      textDecoration: 'none',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      fontSize: '12px',
                                    }}
                                  >
                                    <Phone size={14} /> Call
                                  </a>
                                )}

                                {landlordId && currentUserId !== landlordId && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      navigate('/messages', {
                                        state: {
                                          receiverId: landlordId,
                                          receiverName: landlordObj?.name,
                                        },
                                      })
                                    }
                                    style={{
                                      background: '#eff6ff',
                                      color: '#1d4ed8',
                                      border: '1px solid #bfdbfe',
                                      padding: '8px 12px',
                                      borderRadius: '8px',
                                      fontWeight: 'bold',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      fontSize: '12px',
                                    }}
                                  >
                                    <MessageSquare size={14} /> Message
                                  </button>
                                )}

                                {houseId && (
                                  <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={() => navigate(`/house/${houseId}`)}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      padding: '8px 14px',
                                      fontSize: '12px',
                                    }}
                                  >
                                    <Eye size={14} /> Open House
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* مکان کی آفر بھیجنے کا پاپ اپ ماڈل */}
      {selectedRequest && (
        <div className="modal-overlay" style={{ zIndex: 999999, padding: '12px' }}>
          <div
            className="modal-content"
            style={{ maxWidth: '520px', width: '100%', boxSizing: 'border-box' }}
          >
            <h3 style={{ marginBottom: '8px' }}>
              Send Offer to {selectedRequest.tenant?.name} 🏠
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>
              Looking for:{' '}
              <b>
                {selectedRequest.bedrooms} Bed in {selectedRequest.area}
              </b>{' '}
              (Budget: PKR {selectedRequest.budgetMax?.toLocaleString()})
            </p>

            <form
              onSubmit={handleSendOffer}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  Select Your Property to Offer:
                </label>
                <select
                  required
                  value={selectedHouseId}
                  onChange={(e) => setSelectedHouseId(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px',
                    marginTop: '4px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '15px',
                  }}
                >
                  <option value="">-- Choose from your listed houses --</option>
                  {myHouses.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.title} ({h.city} - PKR {h.rentPrice}/mo)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  Your Offered Rent (PKR / month):
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 38000"
                  value={offeredRent}
                  onChange={(e) => setOfferedRent(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px',
                    marginTop: '4px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '15px',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  Message to Tenant:
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. I have a 2-bed upper portion available..."
                  value={offerMsg}
                  onChange={(e) => setOfferMsg(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px',
                    marginTop: '4px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '15px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submittingOffer}
                  style={{ flex: 1, padding: '11px' }}
                >
                  {submittingOffer ? 'Sending...' : 'Send Offer Directly 📩'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="btn-outline"
                  style={{ flex: 1 }}
                >
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

export default TenantRequestsFeed;