/* eslint-disable */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Save,
  Edit3,
  CheckCircle,
  Trash2,
  PlusCircle,
  Home,
  CalendarCheck,
  Inbox,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { currentUser, login, lang } = useAuth();
  const navigate = useNavigate();

  // ڈیش بورڈ ٹیبز: 'profile' | 'my-bookings' | 'my-properties' | 'incoming-tokens'
  const [activeTab, setActiveTab] = useState('profile');

  // پروفائل اسٹیٹس
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // لسٹنگز اور بکنگز ڈیٹا
  const [myHouses, setMyHouses] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [incomingTokens, setIncomingTokens] = useState([]);

  const currentUserId = currentUser?.id || currentUser?._id;

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  const fetchDashboardData = async () => {
    if (!currentUserId) return;
    try {
      const [housesRes, bookingsRes, incomingRes] = await Promise.all([
        axios
          .get(`https://house-rent-app-ten.vercel.app/api/houses/owner/${currentUserId}`)
          .catch(() => ({ data: [] })),
        axios
          .get(`https://house-rent-app-ten.vercel.app/api/bookings/tenant/${currentUserId}`)
          .catch(() => ({ data: [] })),
        axios
          .get(`https://house-rent-app-ten.vercel.app/api/bookings/landlord/${currentUserId}`)
          .catch(() => ({ data: [] })),
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
      <div
        className="container"
        style={{ maxWidth: '450px', textAlign: 'center', marginTop: '48px', padding: '0 16px' }}
      >
        <div className="house-card" style={{ padding: '28px 20px' }}>
          <h2 style={{ marginTop: 0 }}>Please Log In</h2>
          <p style={{ color: '#64748b', margin: '10px 0 20px' }}>
            Log in to view your dashboard and profile.
          </p>
          <button className="btn-primary" onClick={() => navigate('/login')}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

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

      const token = localStorage.getItem('token');
      login(res.data.user, token);

      setProfileMsg(
        lang === 'en'
          ? 'Profile updated successfully! ✅'
          : 'پروفائل کامیابی سے تبدیل ہو گئی! ✅'
      );
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
      await axios.delete(`https://house-rent-app-ten.vercel.app/api/houses/${houseId}`, {
        data: { userId: currentUserId },
      });
      alert('Property deleted!');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="dash-wrapper">
      <style>{`
        .dash-wrapper {
          width: 100%;
          max-width: 960px;
          margin: 24px auto 80px;
          padding: 0 16px;
          box-sizing: border-box;
        }
        .dash-banner {
          padding: 22px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #0f172a, #1e3a8a);
          color: #fff;
          border-radius: 14px;
        }
        .dash-user-info {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
          flex: 1 1 240px;
        }
        .dash-avatar {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: #2563eb;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: bold;
          flex-shrink: 0;
        }
        .dash-user-text {
          min-width: 0;
        }
        .dash-user-text h2 {
          margin: 0;
          font-size: 20px;
          word-break: break-word;
        }
        .dash-user-text p {
          margin: 4px 0 0;
          font-size: 13px;
          opacity: 0.85;
          overflow-wrap: anywhere;
        }
        .dash-banner-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }
        .dash-banner-actions button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-height: 40px;
          white-space: nowrap;
        }
        .dash-tabs {
          display: flex;
          gap: 8px;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 10px;
          margin-bottom: 22px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .dash-tabs::-webkit-scrollbar {
          display: none;
        }
        .dash-tab-btn {
          padding: 10px 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 700;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .dash-card {
          padding: 26px;
        }
        .dash-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 12px;
        }
        .dash-info-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
          min-width: 0;
        }
        .dash-info-val {
          font-weight: 600;
          overflow-wrap: anywhere;
        }
        .dash-input {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 16px;
        }
        .dash-booking-card {
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
        }
        .dash-booking-left {
          display: flex;
          gap: 14px;
          align-items: center;
          min-width: 0;
          flex: 1;
        }
        .dash-booking-img {
          width: 84px;
          height: 64px;
          object-fit: cover;
          border-radius: 8px;
          flex-shrink: 0;
        }
        .dash-booking-right {
          text-align: right;
          flex-shrink: 0;
        }
        .dash-houses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
          gap: 16px;
        }
        .dash-section-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 15px;
        }

        @media (max-width: 640px) {
          .dash-wrapper {
            margin-top: 14px;
            padding: 0 12px;
          }
          .dash-banner {
            padding: 16px;
            gap: 14px;
          }
          .dash-avatar {
            width: 46px;
            height: 46px;
            font-size: 18px;
          }
          .dash-user-text h2 {
            font-size: 17px;
          }
          .dash-banner-actions {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          .dash-banner-actions button {
            width: 100%;
            font-size: 13px;
            padding: 9px 10px;
            white-space: normal;
            text-align: center;
          }
          .dash-card {
            padding: 16px;
          }
          .dash-booking-card {
            flex-direction: column;
            align-items: stretch;
          }
          .dash-booking-right {
            text-align: left;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #f1f5f9;
            padding-top: 10px;
          }
          .dash-form-actions {
            flex-direction: column;
          }
          .dash-form-actions button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      {/* 🌟 1. یوزر ہیڈر بینر */}
      <div className="house-card dash-banner">
        <div className="dash-user-info">
          <div className="dash-avatar">
            {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
          </div>
          <div className="dash-user-text">
            <h2>{currentUser.name}</h2>
            <p>{currentUser.email}</p>
          </div>
        </div>

        <div className="dash-banner-actions">
          <button
            className="btn-secondary"
            onClick={() => navigate('/bill-calculator')}
            style={{
              background: '#fefce8',
              color: '#854d0e',
              border: '1px solid #fef08a',
            }}
          >
            ⚡ {lang === 'en' ? 'WAPDA Bill Splitter' : 'سب میٹر بل کیلکولیٹر'}
          </button>

          <button className="btn-primary" onClick={() => navigate('/add-house')}>
            <PlusCircle size={16} />{' '}
            {lang === 'en' ? 'List New House' : 'نیا گھر لسٹ کریں'}
          </button>
        </div>
      </div>

      {/* 🌟 2. ڈیش بورڈ کے نیویگیشن ٹیبز */}
      <div className="dash-tabs">
        <button
          className="dash-tab-btn"
          onClick={() => setActiveTab('profile')}
          style={{
            background: activeTab === 'profile' ? '#2563eb' : '#f1f5f9',
            color: activeTab === 'profile' ? '#fff' : '#475569',
          }}
        >
          <User size={16} /> {lang === 'en' ? 'My Profile' : 'میری پروفائل'}
        </button>

        <button
          className="dash-tab-btn"
          onClick={() => setActiveTab('my-bookings')}
          style={{
            background: activeTab === 'my-bookings' ? '#2563eb' : '#f1f5f9',
            color: activeTab === 'my-bookings' ? '#fff' : '#475569',
          }}
        >
          <CalendarCheck size={16} />{' '}
          {lang === 'en'
            ? `Booked Stays (${myBookings.length})`
            : `میری بکنگز (${myBookings.length})`}
        </button>

        <button
          className="dash-tab-btn"
          onClick={() => setActiveTab('my-properties')}
          style={{
            background: activeTab === 'my-properties' ? '#2563eb' : '#f1f5f9',
            color: activeTab === 'my-properties' ? '#fff' : '#475569',
          }}
        >
          <Home size={16} />{' '}
          {lang === 'en'
            ? `My Houses (${myHouses.length})`
            : `میرے مکانات (${myHouses.length})`}
        </button>

        {incomingTokens.length > 0 && (
          <button
            className="dash-tab-btn"
            onClick={() => setActiveTab('incoming-tokens')}
            style={{
              background: activeTab === 'incoming-tokens' ? '#16a34a' : '#f0fdf4',
              color: activeTab === 'incoming-tokens' ? '#fff' : '#166534',
            }}
          >
            <Inbox size={16} />{' '}
            {lang === 'en'
              ? `Tokens Received (${incomingTokens.length})`
              : `موصول شدہ بیعانہ (${incomingTokens.length})`}
          </button>
        )}
      </div>

      {/* TAB 1: 👤 یوزر کی پروفائل */}
      {activeTab === 'profile' && (
        <div className="house-card dash-card">
          <div className="dash-card-header">
            <h3 style={{ margin: 0, fontSize: '18px' }}>
              {lang === 'en' ? 'Personal Profile Details' : 'ذاتی پروفائل کی تفصیلات'}
            </h3>
            {!isEditing && (
              <button
                className="btn-secondary"
                onClick={() => {
                  setIsEditing(true);
                  setProfileMsg('');
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Edit3 size={15} />{' '}
                {lang === 'en' ? 'Edit Profile' : 'پروفائل تبدیل کریں'}
              </button>
            )}
          </div>

          {profileMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ecfdf5',
                color: '#065f46',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px',
              }}
            >
              <CheckCircle size={18} />
              <span>{profileMsg}</span>
            </div>
          )}

          {!isEditing ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              <div className="dash-info-row">
                <User size={18} color="#64748b" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Full Name</div>
                  <div className="dash-info-val">{currentUser.name}</div>
                </div>
              </div>

              <div className="dash-info-row">
                <Mail size={18} color="#64748b" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Email Address</div>
                  <div className="dash-info-val">{currentUser.email}</div>
                </div>
              </div>

              <div className="dash-info-row">
                <Phone size={18} color="#64748b" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Phone Number</div>
                  <div className="dash-info-val">
                    {currentUser.phone || '0300-0000000'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label
                  style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Full Name:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="dash-input"
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Email (Cannot be changed):
                </label>
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="dash-input"
                  style={{
                    borderColor: '#e2e8f0',
                    background: '#f1f5f9',
                    color: '#64748b',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Phone Number:
                </label>
                <input
                  type="text"
                  placeholder="0300-1234567"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="dash-input"
                />
              </div>

              <div
                className="dash-form-actions"
                style={{ display: 'flex', gap: '10px', marginTop: '6px' }}
              >
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={savingProfile}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    minHeight: '42px',
                  }}
                >
                  <Save size={16} /> {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setIsEditing(false)}
                  style={{ minHeight: '42px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: 📅 بک کیے ہوئے گھر */}
      {activeTab === 'my-bookings' && (
        <div>
          <h3 style={{ marginBottom: '15px' }}>
            My Stays &amp; Bookings ({myBookings.length})
          </h3>
          {myBookings.length === 0 ? (
            <div className="house-card" style={{ padding: '30px', textAlign: 'center' }}>
              <p style={{ color: '#64748b' }}>You haven&apos;t reserved any stays yet.</p>
              <button
                className="btn-secondary"
                onClick={() => navigate('/')}
                style={{ marginTop: '10px' }}
              >
                Explore Stays
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '14px' }}>
              {myBookings.map((b) => (
                <div key={b._id} className="house-card dash-booking-card">
                  <div className="dash-booking-left">
                    <img
                      src={
                        b.house?.images?.[0] ||
                        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600'
                      }
                      alt="House"
                      className="dash-booking-img"
                    />
                    <div style={{ minWidth: 0 }}>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '16px',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {b.house?.title || 'House Stay'}
                      </h4>
                      <p
                        style={{
                          margin: '3px 0',
                          fontSize: '13px',
                          color: '#64748b',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {b.house?.address}, {b.house?.city}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '12px',
                          color: '#2563eb',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        Host: <b>{b.landlord?.name}</b> ({b.landlord?.phone})
                      </p>
                    </div>
                  </div>

                  <div className="dash-booking-right">
                    <div
                      style={{
                        fontWeight: 'bold',
                        fontSize: '15px',
                        color: '#16a34a',
                        marginBottom: '4px',
                      }}
                    >
                      PKR {b.totalAmount?.toLocaleString()}
                    </div>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        display: 'inline-block',
                        background:
                          b.status === 'holding_escrow'
                            ? '#eff6ff'
                            : b.status === 'tenant_approved'
                              ? '#dcfce7'
                              : '#fef9c3',
                        color:
                          b.status === 'holding_escrow'
                            ? '#2563eb'
                            : b.status === 'tenant_approved'
                              ? '#166534'
                              : '#854d0e',
                      }}
                    >
                      {b.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: 🏠 اپنے لسٹ کیے ہوئے مکانات */}
      {activeTab === 'my-properties' && (
        <div>
          <div className="dash-section-head">
            <h3 style={{ margin: 0 }}>My Listed Properties ({myHouses.length})</h3>
            <button className="btn-secondary" onClick={() => navigate('/add-house')}>
              + Add New
            </button>
          </div>

          {myHouses.length === 0 ? (
            <div className="house-card" style={{ padding: '30px', textAlign: 'center' }}>
              <p style={{ color: '#64748b' }}>
                You haven&apos;t listed any properties for rent yet.
              </p>
              <button
                className="btn-primary"
                onClick={() => navigate('/add-house')}
                style={{ marginTop: '10px' }}
              >
                List Your First Property
              </button>
            </div>
          ) : (
            <div className="dash-houses-grid">
              {myHouses.map((house) => (
                <div
                  key={house._id}
                  className="house-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    overflow: 'hidden',
                  }}
                >
                  <div>
                    <img
                      src={
                        house.images?.[0] ||
                        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600'
                      }
                      alt={house.title}
                      className="house-img"
                      style={{ width: '100%', objectFit: 'cover' }}
                    />
                    <div className="house-info">
                      <div className="house-price">
                        PKR {house.rentPrice?.toLocaleString()} / mo
                      </div>
                      <div className="house-title">{house.title}</div>
                      <div className="house-city">
                        {house.address}, {house.city}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '0 16px 16px', display: 'flex', gap: '8px' }}>
                    <button
                      className="btn-secondary"
                      style={{ flex: 1, padding: '8px', minHeight: '38px' }}
                      onClick={() => navigate(`/house/${house._id}`)}
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/edit-house/${house._id}`)}
                      style={{
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        padding: '8px 14px',
                        minHeight: '38px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteHouse(house._id)}
                      style={{
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fca5a5',
                        padding: '8px 14px',
                        minHeight: '38px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: 📩 موصول شدہ ٹوکنز */}
      {activeTab === 'incoming-tokens' && (
        <div>
          <h3 style={{ marginBottom: '15px' }}>
            Received Token Reservations ({incomingTokens.length})
          </h3>
          <div style={{ display: 'grid', gap: '14px' }}>
            {incomingTokens.map((b) => (
              <div
                key={b._id}
                className="house-card"
                style={{ padding: '16px', borderLeft: '4px solid #16a34a' }}
              >
                <h4 style={{ margin: 0, overflowWrap: 'anywhere' }}>
                  {b.house?.title}
                </h4>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#475569',
                    margin: '6px 0',
                    overflowWrap: 'anywhere',
                    lineHeight: '1.5',
                  }}
                >
                  Tenant: <b>{b.tenant?.name}</b> ({b.tenant?.phone}) | TID:{' '}
                  <b>{b.transactionId}</b>
                </p>
                <div
                  style={{
                    fontSize: '13px',
                    color: '#16a34a',
                    fontWeight: 'bold',
                    marginTop: '6px',
                  }}
                >
                  Landlord Payout: PKR {b.landlordAmount} (Escrow Token: PKR{' '}
                  {b.tokenAmount})
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