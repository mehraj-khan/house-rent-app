/* eslint-disable */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Shield, Save, Edit3, CheckCircle, 
  Trash2, PlusCircle, ShieldCheck, Home, CalendarCheck, Inbox 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { currentUser, login, lang } = useAuth();
  const navigate = useNavigate();

  // ڈیش بورڈ ٹیبز: 'profile' | 'my-bookings' | 'my-properties'
  const [activeTab, setActiveTab] = useState('profile');

  // پروفائل اسٹیٹس
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // لسٹنگز اور بکنگز ڈیٹا
  const [myHouses, setMyHouses] = useState([]);
  const [myBookings, setMyBookings] = useState([]); // جو گھر یوزر نے خود بک کیے
  const [incomingTokens, setIncomingTokens] = useState([]); // جو ٹوکن یوزر کے گھروں پر آئے

  const currentUserId = currentUser?.id || currentUser?._id;

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  // تمام ڈیٹا لوڈ کریں
  const fetchDashboardData = async () => {
    if (!currentUserId) return;
    try {
      const [housesRes, bookingsRes, incomingRes] = await Promise.all([
        axios.get(`https://house-rent-app-ten.vercel.app/api/houses/owner/${currentUserId}`).catch(() => ({ data: [] })),
        axios.get(`https://house-rent-app-ten.vercel.app/api/bookings/tenant/${currentUserId}`).catch(() => ({ data: [] })),
        axios.get(`https://house-rent-app-ten.vercel.app/api/bookings/landlord/${currentUserId}`).catch(() => ({ data: [] }))
      ]);

      setMyHouses(housesRes.data || []);
      setMyBookings(bookingsRes.data || []);
      setIncomingTokens(incomingRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUserId]);

  if (!currentUser) {
    return (
      <div className="container" style={{ maxWidth: '450px', textAlign: 'center', marginTop: '60px' }}>
        <div className="house-card" style={{ padding: '30px' }}>
          <h2>Please Log In</h2>
          <p style={{ color: '#64748b', margin: '10px 0 20px' }}>Log in to view your dashboard and profile.</p>
          <button className="btn-primary" onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      </div>
    );
  }

  // پروفائل سیو ہینڈلر (براہِ راست ڈیٹا بیس میں سیو ہوگا)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');

    try {
      const res = await axios.put('https://house-rent-app-ten.vercel.app/api/auth/profile', {
        userId: currentUserId,
        name,
        phone,
      });

      // نیا ڈیٹا لوکل میموری میں اپڈیٹ کریں تاکہ اوپر نیوبار میں بھی نیا نام آ جائے
      const token = localStorage.getItem('token');
      login(res.data.user, token);

      setProfileMsg(lang === 'en' ? 'Profile updated successfully! ✅' : 'پروفائل کامیابی سے تبدیل ہو گئی! ✅');
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteHouse = async (houseId) => {
    if (!window.confirm('Delete this property?')) return;
    try {
      await axios.delete(`https://house-rent-app-ten.vercel.app/api/houses/${houseId}`, { data: { userId: currentUserId } });
      alert('Property deleted!');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '900px', marginTop: '30px' }}>
      
      {/* 🌟 1. یوزر ہیڈر بینر */}
      <div className="house-card" style={{ padding: '20px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold' }}>
            {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px' }}>{currentUser.name}</h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.85 }}>{currentUser.email}</p>
          </div>
        </div>

        <button 
          className="btn-secondary" 
          onClick={() => navigate('/bill-calculator')} 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fefce8', color: '#854d0e', border: '1px solid #fef08a' }}
        >
          ⚡ {lang === 'en' ? 'WAPDA Bill Splitter' : 'سب میٹر بل کیلکولیٹر'}
        </button>

        <button className="btn-primary" onClick={() => navigate('/add-house')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PlusCircle size={16} /> {lang === 'en' ? 'List New House' : 'نیا گھر لسٹ کریں'}
        </button>
      </div>

      {/* 🌟 2. ڈیش بورڈ کے نیویگیشن ٹیبز (Navigation Tabs) */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '25px', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
            background: activeTab === 'profile' ? '#2563eb' : '#f1f5f9', color: activeTab === 'profile' ? '#fff' : '#475569',
            display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap'
          }}
        >
          <User size={16} /> {lang === 'en' ? 'My Profile' : 'میری پروفائل'}
        </button>

        <button
          onClick={() => setActiveTab('my-bookings')}
          style={{
            padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
            background: activeTab === 'my-bookings' ? '#2563eb' : '#f1f5f9', color: activeTab === 'my-bookings' ? '#fff' : '#475569',
            display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap'
          }}
        >
          <CalendarCheck size={16} /> {lang === 'en' ? `Booked Stays (${myBookings.length})` : `میری بکنگز (${myBookings.length})`}
        </button>

        <button
          onClick={() => setActiveTab('my-properties')}
          style={{
            padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
            background: activeTab === 'my-properties' ? '#2563eb' : '#f1f5f9', color: activeTab === 'my-properties' ? '#fff' : '#475569',
            display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap'
          }}
        >
          <Home size={16} /> {lang === 'en' ? `My Houses (${myHouses.length})` : `میرے مکانات (${myHouses.length})`}
        </button>

        {incomingTokens.length > 0 && (
          <button
            onClick={() => setActiveTab('incoming-tokens')}
            style={{
              padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
              background: activeTab === 'incoming-tokens' ? '#16a34a' : '#f0fdf4', color: activeTab === 'incoming-tokens' ? '#fff' : '#166534',
              display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap'
            }}
          >
            <Inbox size={16} /> {lang === 'en' ? `Tokens Received (${incomingTokens.length})` : `موصول شدہ بیعانہ (${incomingTokens.length})`}
          </button>
        )}
      </div>

      {/* ========================================================
         TAB 1: 👤 یوزر کی پروفائل (دیکھنا اور ایڈٹ کرنا)
         ======================================================== */}
      {activeTab === 'profile' && (
        <div className="house-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>{lang === 'en' ? 'Personal Profile Details' : 'ذاتی پروفائل کی تفصیلات'}</h3>
            {!isEditing && (
              <button className="btn-secondary" onClick={() => { setIsEditing(true); setProfileMsg(''); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Edit3 size={15} /> {lang === 'en' ? 'Edit Profile' : 'پروفائل تبدیل کریں'}
              </button>
            )}
          </div>

          {profileMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
              <CheckCircle size={18} />
              <span>{profileMsg}</span>
            </div>
          )}

          {!isEditing ? (
            <div style={{ display: 'grid', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                <User size={18} color="#64748b" />
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Full Name</div>
                  <div style={{ fontWeight: '600' }}>{currentUser.name}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                <Mail size={18} color="#64748b" />
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Email Address</div>
                  <div style={{ fontWeight: '600' }}>{currentUser.email}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                <Phone size={18} color="#64748b" />
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Phone Number</div>
                  <div style={{ fontWeight: '600' }}>{currentUser.phone || '0300-0000000'}</div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Full Name:</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Email (Cannot be changed):</label>
                <input type="email" disabled value={currentUser.email}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#64748b' }} />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Phone Number:</label>
                <input type="text" placeholder="0300-1234567" required value={phone} onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button type="submit" className="btn-primary" disabled={savingProfile} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Save size={16} /> {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn-outline" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ========================================================
         TAB 2: 📅 بک کیے ہوئے گھر (Houses Booked by this User)
         ======================================================== */}
      {activeTab === 'my-bookings' && (
        <div>
          <h3 style={{ marginBottom: '15px' }}>My Stays & Bookings ({myBookings.length})</h3>
          {myBookings.length === 0 ? (
            <div className="house-card" style={{ padding: '30px', textAlign: 'center' }}>
              <p style={{ color: '#64748b' }}>You haven't reserved any stays yet.</p>
              <button className="btn-secondary" onClick={() => navigate('/')} style={{ marginTop: '10px' }}>Explore Stays</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {myBookings.map((b) => (
                <div key={b._id} className="house-card" style={{ padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <img src={b.house?.images?.[0] || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600'}
                      alt="House" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px' }}>{b.house?.title || 'House Stay'}</h4>
                      <p style={{ margin: '2px 0', fontSize: '13px', color: '#64748b' }}>{b.house?.address}, {b.house?.city}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#2563eb' }}>
                        Host: <b>{b.landlord?.name}</b> ({b.landlord?.phone})
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'end' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#16a34a', marginBottom: '4px' }}>
                      PKR {b.totalAmount?.toLocaleString()}
                    </div>
                    <span style={{
                      padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                      background: b.status === 'holding_escrow' ? '#eff6ff' : b.status === 'tenant_approved' ? '#dcfce7' : '#fef9c3',
                      color: b.status === 'holding_escrow' ? '#2563eb' : b.status === 'tenant_approved' ? '#166534' : '#854d0e'
                    }}>
                      {b.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
         TAB 3: 🏠 اپنے لسٹ کیے ہوئے مکانات (Houses Listed for Rent)
         ======================================================== */}
      {activeTab === 'my-properties' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>My Listed Properties ({myHouses.length})</h3>
            <button className="btn-secondary" onClick={() => navigate('/add-house')}>+ Add New</button>
          </div>

          {myHouses.length === 0 ? (
            <div className="house-card" style={{ padding: '30px', textAlign: 'center' }}>
              <p style={{ color: '#64748b' }}>You haven't listed any properties for rent yet.</p>
              <button className="btn-primary" onClick={() => navigate('/add-house')} style={{ marginTop: '10px' }}>List Your First Property</button>
            </div>
          ) : (
            <div className="houses-grid">
              {myHouses.map((house) => (
                <div key={house._id} className="house-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <img src={house.images?.[0] || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600'} alt={house.title} className="house-img" />
                    <div className="house-info">
                      <div className="house-price">PKR {house.rentPrice?.toLocaleString()} / mo</div>
                      <div className="house-title">{house.title}</div>
                      <div className="house-city">{house.address}, {house.city}</div>
                    </div>
                  </div>

                  <div style={{ padding: '0 18px 18px', display: 'flex', gap: '8px' }}>
                    <button className="btn-secondary" style={{ flex: 1, padding: '7px' }} onClick={() => navigate(`/house/${house._id}`)}>View</button>
                    <button onClick={() => navigate(`/edit-house/${house._id}`)} style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '7px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>✏️</button>
                    <button onClick={() => handleDeleteHouse(house._id)} style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '7px 12px', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
         TAB 4: 📩 موصول شدہ ٹوکنز (اگر یوزر کے گھر پر کسی نے بکنگ کی ہو)
         ======================================================== */}
      {activeTab === 'incoming-tokens' && (
        <div>
          <h3 style={{ marginBottom: '15px' }}>Received Token Reservations ({incomingTokens.length})</h3>
          <div style={{ display: 'grid', gap: '15px' }}>
            {incomingTokens.map((b) => (
              <div key={b._id} className="house-card" style={{ padding: '18px', borderLeft: '4px solid #16a34a' }}>
                <h4 style={{ margin: 0 }}>{b.house?.title}</h4>
                <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0' }}>
                  Tenant: <b>{b.tenant?.name}</b> ({b.tenant?.phone}) | TID: <b>{b.transactionId}</b>
                </p>
                <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: 'bold', marginTop: '4px' }}>
                  Landlord Payout: PKR {b.landlordAmount} (Escrow Token: PKR {b.tokenAmount})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;