/* eslint-disable */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Search, Home, DollarSign, Calendar, Users, Send, CheckCircle2, MessageSquare } from 'lucide-react';

const TenantRequestsFeed = () => {
  const { currentUser, lang } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [cityFilter, setCityFilter] = useState('');
  const [myHouses, setMyHouses] = useState([]);

  // آفر بھیجنے کا ماڈل
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedHouseId, setSelectedHouseId] = useState('');
  const [offeredRent, setOfferedRent] = useState('');
  const [offerMsg, setOfferMsg] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);

  const currentUserId = currentUser?.id || currentUser?._id;

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`https://house-rent-app-ten.vercel.app/api/tenant-requests/all?city=${cityFilter}`);
      setRequests(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
    if (currentUserId) {
      axios.get(`https://house-rent-app-ten.vercel.app/api/houses/owner/${currentUserId}`)
        .then(res => setMyHouses(res.data || []))
        .catch(() => {});
    }
  }, [cityFilter, currentUserId]);

  // مالک کی طرف سے آفر بھیجنا
  const handleSendOffer = async (e) => {
    e.preventDefault();
    if (!selectedHouseId) {
      alert('Please select one of your properties to offer!');
      return;
    }

    setSubmittingOffer(true);
    try {
      await axios.post('https://house-rent-app-ten.vercel.app/api/tenant-requests/send-offer', {
        requestId: selectedRequest._id,
        landlordId: currentUserId,
        houseId: selectedHouseId,
        offeredRent: Number(offeredRent),
        message: offerMsg,
      });

      alert('Offer sent successfully to the tenant! 🏠📩');
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      alert('Error sending offer: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingOffer(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '950px', marginTop: '25px' }}>
      
      {/* ہیڈر بینر */}
      <div className="house-card" style={{ padding: '25px', background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '25px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px' }}>📢 Tenant Demands: &quot;Mujhe Ghar Chahiye&quot;</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.85 }}>
            Tenants post their exact budgets and areas. Landlords send direct offers with zero dealer commission!
          </p>
        </div>

        <button className="btn-primary" onClick={() => navigate('/post-request')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#2563eb' }}>
          <PlusCircle size={18} /> Post Your Demand (مجھے گھر چاہیے)
        </button>
      </div>

      {/* سرچ فلٹر */}
      <div style={{ marginBottom: '20px', maxWidth: '400px' }}>
        <input
          type="text" placeholder="Filter by city (e.g. Lahore, Islamabad)..."
          value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
        />
      </div>

      {/* تمام ڈیمانڈز کی لسٹ */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {requests.length === 0 ? (
          <div className="house-card" style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: '#64748b' }}>No active tenant demands found. Be the first to post what you need!</p>
            <button className="btn-primary" onClick={() => navigate('/post-request')} style={{ marginTop: '10px' }}>
              Post Requirement
            </button>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req._id} className="house-card" style={{ padding: '22px', borderLeft: '5px solid #2563eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: '#0f172a' }}>
                    Need {req.bedrooms} Bed in {req.area}, {req.city}
                  </h3>
                  <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', gap: '15px', flexWrap: 'wrap', margin: '6px 0' }}>
                    <span>👤 Tenant: <b>{req.tenant?.name}</b></span>
                    <span>👨‍👩‍👧‍👦 Type: <b>{req.tenantType === 'family' ? 'Family' : 'Bachelors'} ({req.familyMembers} Persons)</b></span>
                    <span>📅 Target Move-in: <b>{new Date(req.moveInDate).toLocaleDateString()}</b></span>
                  </div>
                </div>

                <div style={{ textAlign: 'end' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Budget:</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a' }}>
                    PKR {req.budgetMin?.toLocaleString()} - {req.budgetMax?.toLocaleString()}
                  </span>
                </div>
              </div>

              {req.description && (
                <p style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', fontSize: '13px', color: '#334155', margin: '10px 0' }}>
                  &ldquo;{req.description}&rdquo;
                </p>
              )}

              {/* آفرز سمری اور بٹن */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: 'bold' }}>
                  📩 {req.offers?.length || 0} Landlord Offers Received
                </span>

                {/* اگر مالک مکان دیکھے تو آفر بھیج سکے */}
                {currentUserId && currentUserId !== req.tenant?._id && (
                  <button
                    onClick={() => {
                      if (myHouses.length === 0) {
                        alert('You must have at least one property listed in "My Properties" to send an offer!');
                        return;
                      }
                      setSelectedRequest(req);
                      setOfferedRent(req.budgetMax);
                    }}
                    style={{ background: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                  >
                    <Send size={15} /> Send Property Offer (مکان پیش کریں)
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🌟 مکان کی آفر بھیجنے کا پاپ اپ ماڈل */}
      {selectedRequest && (
        <div className="modal-overlay" style={{ zIndex: 999999 }}>
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <h3 style={{ marginBottom: '8px' }}>Send Offer to {selectedRequest.tenant?.name} 🏠</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>
              Looking for: <b>{selectedRequest.bedrooms} Bed in {selectedRequest.area}</b> (Budget: PKR {selectedRequest.budgetMax?.toLocaleString()})
            </p>

            <form onSubmit={handleSendOffer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Select Your Property to Offer:</label>
                <select
                  required value={selectedHouseId} onChange={(e) => setSelectedHouseId(e.target.value)}
                  style={{ width: '100%', padding: '9px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="">-- Choose from your listed houses --</option>
                  {myHouses.map(h => (
                    <option key={h._id} value={h._id}>{h.title} ({h.city} - PKR {h.rentPrice}/mo)</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Your Offered Rent (PKR / month):</label>
                <input
                  type="number" required placeholder="e.g. 38000"
                  value={offeredRent} onChange={(e) => setOfferedRent(e.target.value)}
                  style={{ width: '100%', padding: '9px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Message to Tenant:</label>
                <textarea
                  rows="2" placeholder="e.g. I have a 2-bed upper portion available in Bahria Town matching your requirements..."
                  value={offerMsg} onChange={(e) => setOfferMsg(e.target.value)}
                  style={{ width: '100%', padding: '9px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="submit" className="btn-primary" disabled={submittingOffer} style={{ flex: 1, padding: '11px' }}>
                  {submittingOffer ? 'Sending...' : 'Send Offer Directly 📩'}
                </button>
                <button type="button" onClick={() => setSelectedRequest(null)} className="btn-outline" style={{ flex: 1 }}>
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