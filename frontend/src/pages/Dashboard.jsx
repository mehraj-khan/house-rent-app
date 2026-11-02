/* eslint-disable */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Trash2, PlusCircle, ShieldCheck, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { currentUser, lang } = useAuth();
  const [myHouses, setMyHouses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  const currentUserId = currentUser?.id || currentUser?._id;
  const isLandlord = currentUser?.role === 'landlord';

  const fetchDashboardData = async () => {
    if (!currentUserId) return;
    try {
      const endpoint = isLandlord
        ? `https://house-rent-app-ten.vercel.app/api/bookings/landlord/${currentUserId}`
        : `https://house-rent-app-ten.vercel.app/api/bookings/tenant/${currentUserId}`;

      const [housesRes, bookingsRes] = await Promise.all([
        isLandlord ? axios.get(`https://house-rent-app-ten.vercel.app/api/houses/owner/${currentUserId}`) : Promise.resolve({ data: [] }),
        axios.get(endpoint)
      ]);

      setMyHouses(housesRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUserId]);

  const handleDelete = async (houseId) => {
    if (!window.confirm(lang === 'en' ? 'Delete this property?' : 'کیا آپ واقعی یہ گھر ڈیلیٹ کرنا چاہتے ہیں؟')) return;
    try {
      await axios.delete(`https://house-rent-app-ten.vercel.app/api/houses/${houseId}`, { data: { userId: currentUserId } });
      alert(lang === 'en' ? 'Property deleted!' : 'گھر ڈیلیٹ ہو گیا!');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  // امانت اسٹیٹس ایکشنز
  const handleBookingAction = async (bookingId, newStatus, alertMsg) => {
    try {
      await axios.put(`https://house-rent-app-ten.vercel.app/api/bookings/${bookingId}/status`, { status: newStatus });
      alert(alertMsg);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const totalRent = myHouses.reduce((sum, house) => sum + house.rentPrice, 0);

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>{isLandlord ? (lang === 'en' ? 'Landlord Dashboard 📊' : 'مالک مکان ڈیش بورڈ 📊') : (lang === 'en' ? 'Tenant Booking Center 🛡️' : 'کرایہ دار امانت سنٹر 🛡️')}</h2>
          <p style={{ color: '#64748b' }}>{lang === 'en' ? `Welcome, ${currentUser?.name}!` : `خوش آمدید ${currentUser?.name}!`}</p>
        </div>

        {isLandlord && (
          <button className="btn-primary" onClick={() => navigate('/add-house')}>
            <PlusCircle size={18} style={{ marginInlineEnd: '6px', verticalAlign: 'middle' }} />
            {lang === 'en' ? 'Add New House' : 'نیا گھر شامل کریں'}
          </button>
        )}
      </div>

      {/* اگر لینڈ لارڈ ہو تو سمری کارڈز */}
      {isLandlord && (
        <div className="stats-grid">
          <div className="stat-box">
            <h3 style={{ fontSize: '28px', color: '#2563eb' }}>{myHouses.length}</h3>
            <p style={{ color: '#64748b', fontWeight: 'bold' }}>{lang === 'en' ? 'Listed Properties' : 'لسٹ کیے گئے مکانات'}</p>
          </div>
          <div className="stat-box">
            <h3 style={{ fontSize: '28px', color: '#16a34a' }}>PKR {totalRent.toLocaleString()}</h3>
            <p style={{ color: '#64748b', fontWeight: 'bold' }}>{lang === 'en' ? 'Potential Monthly Rent' : 'ماہانہ ممکنہ کرایہ'}</p>
          </div>
          <div className="stat-box">
            <h3 style={{ fontSize: '28px', color: '#9333ea' }}>{bookings.length}</h3>
            <p style={{ color: '#64748b', fontWeight: 'bold' }}>{lang === 'en' ? 'Escrow Bookings' : 'محفوظ امانت بکنگز'}</p>
          </div>
        </div>
      )}

      {/* محفوظ امانت بکنگز سیکشن */}
      <div style={{ marginBottom: '35px' }}>
        <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck color="#16a34a" />
          {isLandlord
            ? (lang === 'en' ? 'Incoming Escrow Reservations (Funds Held by Admin)' : 'موصول شدہ ٹوکن بیعانہ (رقم ایڈمن کے پاس محفوظ ہے)')
            : (lang === 'en' ? 'My Active House Reservations' : 'میری محفوظ مکان بکنگز')}
        </h3>

        {bookings.length === 0 ? (
          <div className="house-card" style={{ padding: '25px', textAlign: 'center' }}>
            <p style={{ color: '#64748b' }}>{lang === 'en' ? 'No active reservations found.' : 'ابھی تک کوئی بکنگ موجود نہیں ہے۔'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {bookings.map((b) => (
              <div key={b._id} className="house-card" style={{ padding: '20px', borderLeft: '5px solid #2563eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h4 style={{ fontSize: '18px', color: '#1e293b' }}>{b.house?.title} ({b.house?.city})</h4>
                    <p style={{ fontSize: '14px', color: '#475569', marginTop: '4px' }}>
                      {isLandlord ? `Tenant: ${b.tenant?.name} (${b.tenant?.phone})` : `Owner: ${b.landlord?.name} (${b.landlord?.phone})`}
                    </p>
                    <p style={{ fontSize: '13px', color: '#2563eb', marginTop: '4px' }}>
                      TID: <b>{b.transactionId}</b> | Token: <b>PKR {b.tokenAmount}</b> (Platform: PKR {b.platformFee} | Landlord: PKR {b.landlordAmount})
                    </p>
                  </div>

                  {/* اسٹیٹس بیج */}
                  <span style={{
                    padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                    background: b.status === 'holding_escrow' ? '#eff6ff' : b.status === 'tenant_approved' ? '#dcfce7' : b.status === 'landlord_paid' ? '#16a34a' : '#fef9c3',
                    color: b.status === 'holding_escrow' ? '#2563eb' : b.status === 'tenant_approved' ? '#166534' : b.status === 'landlord_paid' ? '#fff' : '#854d0e'
                  }}>
                    {b.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* امانت کی صورتحال کی تفصیل */}
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', margin: '12px 0', fontSize: '13px', color: '#475569' }}>
                  {b.status === 'pending_admin' && '⏳ Payment submitted. Admin is verifying the 3,000 PKR transaction with bank/app.'}
                  {b.status === 'holding_escrow' && '🔒 Admin has verified payment! 3,000 PKR is locked in Escrow. Tenant has 24 hours to physically inspect the house.'}
                  {b.status === 'tenant_approved' && '✅ Tenant has physically visited and approved the house! Admin can now release 2,500 PKR to the Landlord.'}
                  {b.status === 'landlord_paid' && '🎉 Deal Completed! Admin has released 2,500 PKR to Landlord and retained 500 PKR commission.'}
                  {b.status === 'refunded' && '❌ Deal Canceled / Fake Listing reported. Token refunded to Tenant.'}
                </div>

                {/* کرایہ دار کا معائنہ ایکشن بٹن */}
                {!isLandlord && b.status === 'holding_escrow' && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleBookingAction(b._id, 'tenant_approved', 'Inspection confirmed! Deal marked as verified.')}
                      style={{ background: '#16a34a', color: 'white', border: 'none', padding: '9px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      ✓ {lang === 'en' ? 'House Inspected & Deal Approved' : 'مکان دیکھ لیا، ڈیل پکی ہے'}
                    </button>
                    <button
                      onClick={() => handleBookingAction(b._id, 'refunded', 'Report submitted to Admin for refund review.')}
                      style={{ background: '#dc2626', color: 'white', border: 'none', padding: '9px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      ✕ {lang === 'en' ? 'Fake / Not as Described (Request Refund)' : 'مکان فیک ہے (پیسے واپس مانگیں)'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* اگر لینڈ لارڈ ہو تو اس کی اپنی لسٹنگز */}
      {isLandlord && (
        <>
          <h3>{lang === 'en' ? 'My Listed Properties' : 'میرے ذاتی مکانات'}</h3>
          <div className="houses-grid" style={{ marginTop: '15px' }}>
            {myHouses.map((house) => (
              <div key={house._id} className="house-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <img src={house.images[0] || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600'} alt={house.title} className="house-img" />
                  <div className="house-info">
                    <div className="house-price">PKR {house.rentPrice.toLocaleString()} / mo</div>
                    <div className="house-title">{house.title}</div>
                    <div className="house-city">{house.address}, {house.city}</div>
                  </div>
                </div>

                <div style={{ padding: '0 20px 20px', display: 'flex', gap: '8px' }}>
                  <button className="btn-secondary" style={{ flex: 1 }} onClick={() => navigate(`/house/${house._id}`)}>View</button>
                  <button onClick={() => navigate(`/edit-house/${house._id}`)} style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>✏️</button>
                  <button onClick={() => handleDelete(house._id)} style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;