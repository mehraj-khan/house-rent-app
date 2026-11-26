/* eslint-disable */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  Home,
  Users,
  Trash2,
  RefreshCw,
  Megaphone,
  CheckCircle,
  XCircle,
  Eye,
  MousePointerClick,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://house-rent-app-ten.vercel.app';

const formatPKR = (amount) => {
  const num = Number(amount) || 0;
  if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Crore`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)} Lac`;
  return num.toLocaleString();
};

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHouses: 0,
    totalBookings: 0,
    bookingEarnings: 0,
    adEarnings: 0,
    totalEarnings: 0,
    pendingAds: 0,
    activeAds: 0,
  });
  const [allBookings, setAllBookings] = useState([]);
  const [allHouses, setAllHouses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allAds, setAllAds] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, bookingsRes, housesRes, usersRes, adsRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/stats`).catch(() => ({ data: {} })),
        axios.get(`${API_URL}/api/bookings/all`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/houses?purpose=all`).catch(() => ({ data: { houses: [] } })),
        axios.get(`${API_URL}/api/admin/users`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/ads/admin/all`).catch(() => ({ data: [] })),
      ]);

      if (statsRes?.data) setStats((prev) => ({ ...prev, ...statsRes.data }));
      if (Array.isArray(bookingsRes?.data)) setAllBookings(bookingsRes.data);
      if (Array.isArray(housesRes?.data?.houses)) setAllHouses(housesRes.data.houses);
      if (Array.isArray(usersRes?.data)) setAllUsers(usersRes.data);
      if (Array.isArray(adsRes?.data)) setAllAds(adsRes.data);
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchAllAdminData();
    }
  }, [currentUser]);

  // Admin Security Guard
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div style={{ maxWidth: '460px', margin: '70px auto', padding: '30px', textAlign: 'center', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ color: '#dc2626', marginTop: 0 }}>🛡️ Access Denied</h2>
        <p style={{ color: '#64748b' }}>Only authorized Super Admins can access this control center.</p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          Go Back Home
        </button>
      </div>
    );
  }

  const handleBookingAction = async (id, status, msg) => {
    if (!window.confirm(msg)) return;
    try {
      await axios.put(`${API_URL}/api/bookings/${id}/status`, { status });
      alert('Status updated successfully!');
      fetchAllAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const handleAdAction = async (adId, status, msg) => {
    if (!window.confirm(msg)) return;
    try {
      await axios.put(`${API_URL}/api/ads/admin/${adId}/status`, { status });
      alert(`Ad ${status} successfully! 🚀`);
      fetchAllAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const handleDeleteAd = async (adId) => {
    if (!window.confirm('Delete this Ad permanently?')) return;
    try {
      await axios.delete(`${API_URL}/api/ads/admin/${adId}`);
      alert('Ad deleted!');
      fetchAllAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const handleDeleteHouse = async (houseId) => {
    if (!window.confirm('Delete this listing from platform?')) return;
    try {
      await axios.delete(`${API_URL}/api/houses/${houseId}`);
      alert('Listing deleted by Admin! 🗑️');
      fetchAllAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/user/${userId}`);
      alert('User deleted!');
      fetchAllAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      const res = await axios.put(`${API_URL}/api/admin/user/${userId}/verify`);
      alert(res.data?.message || 'Verification updated!');
      fetchAllAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const pendingAdsCount = allAds.filter((a) => a.status === 'pending').length;

  const navItems = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { key: 'ads', label: `Ads & Boosts (${allAds.length})`, badge: pendingAdsCount, icon: <Megaphone size={18} /> },
    { key: 'escrow', label: `Escrow (${allBookings.length})`, icon: <ShieldCheck size={18} /> },
    { key: 'houses', label: `Listings (${allHouses.length})`, icon: <Home size={18} /> },
    { key: 'users', label: `Users (${allUsers.length})`, icon: <Users size={18} /> },
  ];

  return (
    <div className="adm-layout">
      <style>{`
        .adm-layout {
          display: flex;
          min-height: calc(100vh - 66px);
          background: #f8fafc;
        }
        .adm-sidebar {
          width: 260px;
          background: #0f172a;
          color: white;
          padding: 25px 15px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .adm-mobile-tabs {
          display: none;
        }
        .adm-main {
          flex: 1;
          padding: 26px 32px;
          overflow-y: auto;
          min-width: 0;
        }
        @media (max-width: 900px) {
          .adm-layout {
            flex-direction: column;
          }
          .adm-sidebar {
            display: none;
          }
          .adm-mobile-tabs {
            display: flex;
            gap: 8px;
            overflow-x: auto;
            padding: 12px 14px;
            background: #0f172a;
          }
          .adm-main {
            padding: 16px;
          }
        }
      `}</style>

      {/* Mobile Admin Tabs */}
      <div className="adm-mobile-tabs">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveTab(item.key)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '12px',
              background: activeTab === item.key ? '#2563eb' : '#1e293b',
              color: '#fff',
            }}
          >
            {item.icon} {item.label}
            {item.badge > 0 && (
              <span style={{ background: '#ef4444', padding: '1px 6px', borderRadius: '999px', fontSize: '10px' }}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Desktop Sidebar */}
      <div className="adm-sidebar">
        <div>
          <div style={{ padding: '0 10px 20px', borderBottom: '1px solid #1e293b', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', color: '#60a5fa', margin: '0 0 6px' }}>🛡️ AdminPortal</h3>
            <span style={{ fontSize: '11px', background: '#1e3a8a', color: '#93c5fd', padding: '2px 8px', borderRadius: '10px' }}>
              SUPER ADMIN
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === item.key ? '#2563eb' : 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '600',
                  textAlign: 'start',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                  {item.icon} {item.label}
                </span>
                {item.badge > 0 && (
                  <span style={{ background: '#ef4444', color: '#fff', fontSize: '11px', padding: '1px 7px', borderRadius: '999px' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          style={{ width: '100%', background: '#1e293b', color: '#94a3b8', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}
        >
          ← Back to Main Website
        </button>
      </div>

      {/* Main Content */}
      <div className="adm-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '22px', background: 'white', padding: '15px 22px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div>
            <h2 style={{ fontSize: '20px', color: '#0f172a', margin: 0 }}>
              {activeTab === 'overview' && 'Platform Overview & Earnings'}
              {activeTab === 'ads' && 'Sponsored Banner Ads & House Boosts'}
              {activeTab === 'escrow' && 'Escrow Fund Holds & Bank Verifications'}
              {activeTab === 'houses' && 'All Listed Properties Moderation (Rent & Sale)'}
              {activeTab === 'users' && 'Registered Users Management'}
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>Live real-time database management</p>
          </div>

          <button onClick={fetchAllAdminData} disabled={loading} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={15} /> {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* 1. OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <div className="stats-grid">
              <div className="stat-box" style={{ borderLeft: '4px solid #16a34a' }}>
                <h3 style={{ fontSize: '28px', color: '#16a34a' }}>PKR {(stats.totalEarnings || 0).toLocaleString()}</h3>
                <p style={{ color: '#64748b', fontWeight: 'bold' }}>
                  Total Platform Profit (Escrow: {stats.bookingEarnings || 0} + Ads: {stats.adEarnings || 0})
                </p>
              </div>
              <div className="stat-box" style={{ borderLeft: '4px solid #f59e0b' }}>
                <h3 style={{ fontSize: '28px', color: '#d97706' }}>{stats.activeAds || 0} Active / {pendingAdsCount} Pending</h3>
                <p style={{ color: '#64748b', fontWeight: 'bold' }}>Sponsored Ads &amp; House Boosts</p>
              </div>
              <div className="stat-box" style={{ borderLeft: '4px solid #2563eb' }}>
                <h3 style={{ fontSize: '28px', color: '#2563eb' }}>{stats.totalHouses || 0}</h3>
                <p style={{ color: '#64748b', fontWeight: 'bold' }}>Total Properties (Rent + Sale)</p>
              </div>
              <div className="stat-box" style={{ borderLeft: '4px solid #9333ea' }}>
                <h3 style={{ fontSize: '28px', color: '#9333ea' }}>{stats.totalUsers || 0}</h3>
                <p style={{ color: '#64748b', fontWeight: 'bold' }}>Registered Accounts</p>
              </div>
            </div>

            <div className="house-card" style={{ padding: '22px', marginTop: '20px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '10px' }}>Admin Quick Guide:</h3>
              <p style={{ color: '#475569', lineHeight: '1.7', margin: 0 }}>
                • <b>Ads &amp; Boosts</b> ٹیب میں جا کر نئے Banner Ads اور House Boosts کی TID چیک کر کے Approve کریں۔<br />
                • <b>Escrow</b> ٹیب میں کرایہ اور بیعانہ (Bayana) ٹوکنز کی تصدیق کریں۔<br />
                • <b>Listings</b> میں فیک اشتہار ڈیلیٹ کریں اور <b>Users</b> میں فراڈ اکاؤنٹ بین کریں۔
              </p>
            </div>
          </div>
        )}

        {/* 2. ADS & HOUSE BOOSTS */}
        {activeTab === 'ads' && (
          <div style={{ display: 'grid', gap: '14px' }}>
            {allAds.length === 0 ? (
              <div className="house-card" style={{ padding: '35px', textAlign: 'center', color: '#64748b' }}>
                No Sponsored Ads or Property Boost requests yet.
              </div>
            ) : (
              allAds.map((ad) => (
                <div
                  key={ad._id}
                  className="house-card"
                  style={{
                    padding: '18px',
                    borderLeft:
                      ad.status === 'pending'
                        ? '5px solid #f59e0b'
                        : ad.status === 'approved'
                        ? '5px solid #16a34a'
                        : '5px solid #dc2626',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: '1 1 320px' }}>
                      {(ad.imageUrl || ad.house?.images?.[0]) && (
                        <img
                          src={ad.imageUrl || ad.house?.images?.[0]}
                          alt=""
                          style={{ width: '90px', height: '68px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                        />
                      )}
                      <div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <span style={{ fontSize: '10.5px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '6px', background: ad.adType === 'house_boost' ? '#fef3c7' : '#eff6ff', color: ad.adType === 'house_boost' ? '#b45309' : '#1d4ed8' }}>
                            {ad.adType === 'house_boost' ? '🚀 HOUSE BOOST' : `📢 BANNER (${ad.placement})`}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            {ad.packageDays} Days • <b>PKR {ad.price?.toLocaleString()}</b>
                          </span>
                        </div>

                        <h4 style={{ margin: '0 0 4px', fontSize: '16px', color: '#0f172a' }}>{ad.title}</h4>
                        <div style={{ fontSize: '12.5px', color: '#475569' }}>
                          Advertiser: <b>{ad.advertiserName}</b> ({ad.advertiserPhone}) • City: <b>{ad.city}</b>
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#1e40af', marginTop: '3px' }}>
                          Method: <b>{ad.paymentMethod}</b> | TID: <b>{ad.transactionId}</b>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Eye size={13} /> {ad.views || 0} Views
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <MousePointerClick size={13} /> {ad.clicks || 0} Clicks
                          </span>
                          {ad.expiresAt && <span>Expires: {new Date(ad.expiresAt).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '5px 12px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        background: ad.status === 'approved' ? '#dcfce7' : ad.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                        color: ad.status === 'approved' ? '#15803d' : ad.status === 'rejected' ? '#b91c1c' : '#b45309',
                      }}
                    >
                      {ad.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                    {ad.status !== 'approved' && (
                      <button
                        onClick={() =>
                          handleAdAction(
                            ad._id,
                            'approved',
                            `Confirm PKR ${ad.price} received in ${ad.paymentMethod} and activate for ${ad.packageDays} days?`
                          )
                        }
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#16a34a', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12.5px', cursor: 'pointer' }}
                      >
                        <CheckCircle size={14} /> Approve &amp; Activate
                      </button>
                    )}

                    {ad.status === 'pending' && (
                      <button
                        onClick={() => handleAdAction(ad._id, 'rejected', 'Reject this Ad / invalid TID?')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#dc2626', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12.5px', cursor: 'pointer' }}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    )}

                    {ad.house?._id && (
                      <button
                        onClick={() => navigate(`/house/${ad.house._id}`)}
                        className="btn-secondary"
                        style={{ padding: '8px 12px', fontSize: '12.5px' }}
                      >
                        View House
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteAd(ad._id)}
                      style={{ marginLeft: 'auto', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 3. ESCROW */}
        {activeTab === 'escrow' && (
          <div style={{ display: 'grid', gap: '15px' }}>
            {allBookings.length === 0 ? (
              <div className="house-card" style={{ padding: '30px', textAlign: 'center' }}>
                <p style={{ color: '#64748b' }}>No escrow bookings found.</p>
              </div>
            ) : (
              allBookings.map((b) => (
                <div key={b._id} className="house-card" style={{ padding: '20px', borderLeft: b.status === 'pending_admin' ? '5px solid #ca8a04' : b.status === 'holding_escrow' ? '5px solid #2563eb' : '5px solid #16a34a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '2px 7px', borderRadius: '6px', background: b.rentType === 'sale' ? '#ecfdf5' : '#eff6ff', color: b.rentType === 'sale' ? '#047857' : '#1d4ed8' }}>
                        {b.rentType === 'sale' ? '🏷️ BAYANA / SALE' : '🏢 RENT'}
                      </span>
                      <h4 style={{ fontSize: '18px', color: '#1e293b', margin: '4px 0' }}>
                        {b.house?.title || 'Property'} ({b.house?.city || 'N/A'})
                      </h4>
                      <div style={{ fontSize: '13px', color: '#475569', margin: '6px 0' }}>
                        Client: <b>{b.tenant?.name || 'N/A'}</b> ({b.tenant?.phone || 'N/A'}) | Owner: <b>{b.landlord?.name || 'N/A'}</b> ({b.landlord?.phone || 'N/A'})
                      </div>
                      <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'inline-block' }}>
                        Method: <b>{b.paymentMethod}</b> | TID: <b style={{ color: '#2563eb', fontSize: '16px' }}>{b.transactionId}</b> | Total: <b>PKR {(b.totalAmount || b.tokenAmount || 0).toLocaleString()}</b> (Fee: PKR {(b.platformFee || 0).toLocaleString()})
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                        background: b.status === 'pending_admin' ? '#fef9c3' : b.status === 'holding_escrow' ? '#eff6ff' : b.status === 'tenant_approved' ? '#dcfce7' : b.status === 'landlord_paid' ? '#16a34a' : '#fee2e2',
                        color: b.status === 'pending_admin' ? '#854d0e' : b.status === 'holding_escrow' ? '#2563eb' : b.status === 'tenant_approved' ? '#166534' : b.status === 'landlord_paid' ? '#fff' : '#dc2626',
                      }}
                    >
                      {(b.status || 'pending').replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div style={{ marginTop: '15px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {b.status === 'pending_admin' && (
                      <>
                        <button
                          onClick={() => handleBookingAction(b._id, 'holding_escrow', `Confirm PKR ${(b.totalAmount || b.tokenAmount || 0).toLocaleString()} received in your JazzCash/EasyPaisa?`)}
                          style={{ background: '#16a34a', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          ✓ Confirm Payment Received (Hold in Escrow)
                        </button>
                        <button
                          onClick={() => handleBookingAction(b._id, 'refunded', 'Reject invalid TID?')}
                          style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          ✕ Invalid TID (Reject)
                        </button>
                      </>
                    )}

                    {b.status === 'tenant_approved' && (
                      <button
                        onClick={() => handleBookingAction(b._id, 'landlord_paid', `Send PKR ${(b.landlordAmount || 0).toLocaleString()} to Owner (${b.landlord?.phone}) and complete deal?`)}
                        style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        💰 Release PKR {(b.landlordAmount || 0).toLocaleString()} to Owner (Keep PKR {(b.platformFee || 0).toLocaleString()} Fee)
                      </button>
                    )}

                    {b.status === 'holding_escrow' && (
                      <button
                        onClick={() => handleBookingAction(b._id, 'refunded', `Refund PKR ${(b.totalAmount || b.tokenAmount || 0).toLocaleString()} to client?`)}
                        style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        Refund Client (Cancel / Fraud)
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 4. HOUSES (Rent & Sale) */}
        {activeTab === 'houses' && (
          <div className="houses-grid">
            {allHouses.map((house) => {
              const isSale = house.purpose === 'sale';
              return (
                <div key={house._id} className="house-card" style={{ position: 'relative' }}>
                  <img
                    src={house.images?.[0] || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600'}
                    alt={house.title}
                    className="house-img"
                  />
                  <span style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '8px', background: isSale ? '#047857' : '#2563eb', color: '#fff' }}>
                    {isSale ? '🏷️ SALE' : '🏢 RENT'}
                  </span>
                  {house.isFeaturedActive && (
                    <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '8px', background: '#f59e0b', color: '#fff' }}>
                      ⚡ FEATURED
                    </span>
                  )}

                  <div className="house-info">
                    <div className="house-price" style={{ color: isSale ? '#047857' : '#0f172a' }}>
                      {isSale ? `PKR ${formatPKR(house.salePrice)}` : `PKR ${(house.rentPrice || 0).toLocaleString()} / mo`}
                    </div>
                    <div className="house-title">{house.title}</div>
                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: '4px 0 6px' }}>
                      Owner: <b>{house.owner?.name || 'N/A'}</b> ({house.owner?.phone || 'N/A'})
                    </p>
                    <p style={{ fontSize: '11.5px', color: '#475569', margin: '0 0 10px' }}>
                      👁️ {house.views || 0} views • Quality: <b>{house.qualityScore || 0}/100</b>
                    </p>

                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                      <button className="btn-secondary" style={{ flex: 1, padding: '6px' }} onClick={() => navigate(`/house/${house._id}`)}>
                        View
                      </button>
                      <button onClick={() => handleDeleteHouse(house._id)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }} title="Delete Fake Listing">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. USERS */}
        {activeTab === 'users' && (
          <div className="house-card" style={{ padding: '20px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px' }}>Name</th>
                  <th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>Phone</th>
                  <th style={{ padding: '12px' }}>Role</th>
                  <th style={{ padding: '12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>
                      {u.name} {u.isVerified && <span title="Verified Owner">✅</span>}
                    </td>
                    <td style={{ padding: '12px' }}>{u.email}</td>
                    <td style={{ padding: '12px' }}>{u.phone}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          background:
                            u.role === 'admin'
                              ? '#fef9c3'
                              : u.role === 'landlord'
                              ? '#eff6ff'
                              : '#f1f5f9',
                          color:
                            u.role === 'admin'
                              ? '#854d0e'
                              : u.role === 'landlord'
                              ? '#2563eb'
                              : '#475569',
                        }}
                      >
                        {(u.role || 'tenant').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleVerifyUser(u._id)}
                        style={{
                          background: u.isVerified ? '#dcfce7' : '#eff6ff',
                          color: u.isVerified ? '#15803d' : '#1d4ed8',
                          border: u.isVerified ? '1px solid #86efac' : '1px solid #bfdbfe',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                        }}
                      >
                        {u.isVerified ? '✅ Verified' : 'Verify Owner'}
                      </button>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          style={{
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: '1px solid #fca5a5',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                          }}
                        >
                          Ban User
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;