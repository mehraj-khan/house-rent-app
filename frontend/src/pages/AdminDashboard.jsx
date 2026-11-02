/* eslint-disable */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShieldCheck, Home, Users, CheckCircle2, XCircle, 
  Trash2, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { currentUser, lang } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalUsers: 0, totalHouses: 0, totalBookings: 0, totalEarnings: 0 });
  const [allBookings, setAllBookings] = useState([]);
  const [allHouses, setAllHouses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, bookingsRes, housesRes, usersRes] = await Promise.all([
        axios.get('https://house-rent-app-ten.vercel.app/api/admin/stats').catch(() => ({ data: { totalUsers: 0, totalHouses: 0, totalBookings: 0, totalEarnings: 0 } })),
        axios.get('https://house-rent-app-ten.vercel.app/api/bookings/all').catch(() => ({ data: [] })),
        axios.get('https://house-rent-app-ten.vercel.app/api/houses').catch(() => ({ data: { houses: [] } })),
        axios.get('https://house-rent-app-ten.vercel.app/api/admin/users').catch(() => ({ data: [] }))
      ]);

      if (statsRes?.data) setStats(statsRes.data);
      if (Array.isArray(bookingsRes?.data)) setAllBookings(bookingsRes.data);
      if (Array.isArray(housesRes?.data?.houses)) setAllHouses(housesRes.data.houses);
      if (Array.isArray(usersRes?.data)) setAllUsers(usersRes.data);
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  const handleBookingAction = async (id, status, msg) => {
    if (!window.confirm(msg)) return;
    try {
      await axios.put(`https://house-rent-app-ten.vercel.app/api/bookings/${id}/status`, { status });
      alert('Status updated successfully!');
      fetchAllAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const handleDeleteHouse = async (houseId) => {
    if (!window.confirm('Delete this listing from platform?')) return;
    try {
      await axios.delete(`https://house-rent-app-ten.vercel.app/api/houses/${houseId}`);
      alert('Listing deleted by Admin! 🗑️');
      fetchAllAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`https://house-rent-app-ten.vercel.app/api/admin/user/${userId}`);
      alert('User deleted!');
      fetchAllAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', background: '#f8fafc' }}>
      
      {/* سائیڈ بار (Sidebar) */}
      <div style={{ width: '260px', background: '#0f172a', color: 'white', padding: '25px 15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ padding: '0 10px 20px', borderBottom: '1px solid #1e293b', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', color: '#60a5fa' }}>🛡️ AdminPortal</h3>
            <span style={{ fontSize: '11px', background: '#1e3a8a', color: '#93c5fd', padding: '2px 8px', borderRadius: '10px' }}>
              SUPER ADMIN
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 14px', borderRadius: '8px', border: 'none',
                background: activeTab === 'overview' ? '#2563eb' : 'transparent', color: 'white', cursor: 'pointer', fontWeight: '600', textAlign: 'start'
              }}
            >
              <LayoutDashboard size={18} /> Overview (اینالیٹکس)
            </button>

            <button
              onClick={() => setActiveTab('escrow')}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 14px', borderRadius: '8px', border: 'none',
                background: activeTab === 'escrow' ? '#2563eb' : 'transparent', color: 'white', cursor: 'pointer', fontWeight: '600', textAlign: 'start'
              }}
            >
              <ShieldCheck size={18} /> Escrow & Payments 💰
            </button>

            <button
              onClick={() => setActiveTab('houses')}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 14px', borderRadius: '8px', border: 'none',
                background: activeTab === 'houses' ? '#2563eb' : 'transparent', color: 'white', cursor: 'pointer', fontWeight: '600', textAlign: 'start'
              }}
            >
              <Home size={18} /> Manage Listings ({allHouses.length})
            </button>

            <button
              onClick={() => setActiveTab('users')}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 14px', borderRadius: '8px', border: 'none',
                background: activeTab === 'users' ? '#2563eb' : 'transparent', color: 'white', cursor: 'pointer', fontWeight: '600', textAlign: 'start'
              }}
            >
              <Users size={18} /> Users List ({allUsers.length})
            </button>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          style={{ width: '100%', background: '#1e293b', color: '#94a3b8', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}
        >
          ← Back to Main Website
        </button>
      </div>

      {/* دائیں جانب مین مواد */}
      <div style={{ flex: 1, padding: '30px 40px', overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', background: 'white', padding: '15px 25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div>
            <h2 style={{ fontSize: '20px', color: '#0f172a' }}>
              {activeTab === 'overview' && 'Platform Overview & Performance'}
              {activeTab === 'escrow' && 'Escrow Fund Holds & Bank Verifications'}
              {activeTab === 'houses' && 'All Listed Properties Moderation'}
              {activeTab === 'users' && 'Registered Users Management'}
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Live real-time database management</p>
          </div>

          <button onClick={fetchAllAdminData} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {/* 1. OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <div className="stats-grid">
              <div className="stat-box" style={{ borderLeft: '4px solid #16a34a' }}>
                <h3 style={{ fontSize: '30px', color: '#16a34a' }}>PKR {(stats.totalEarnings || 0).toLocaleString()}</h3>
                <p style={{ color: '#64748b', fontWeight: 'bold' }}>Total Commission Profit (خالص منافع)</p>
              </div>
              <div className="stat-box" style={{ borderLeft: '4px solid #2563eb' }}>
                <h3 style={{ fontSize: '30px', color: '#2563eb' }}>{stats.totalHouses || 0}</h3>
                <p style={{ color: '#64748b', fontWeight: 'bold' }}>Active House Listings</p>
              </div>
              <div className="stat-box" style={{ borderLeft: '4px solid #9333ea' }}>
                <h3 style={{ fontSize: '30px', color: '#9333ea' }}>{stats.totalUsers || 0}</h3>
                <p style={{ color: '#64748b', fontWeight: 'bold' }}>Registered Accounts</p>
              </div>
              <div className="stat-box" style={{ borderLeft: '4px solid #ca8a04' }}>
                <h3 style={{ fontSize: '30px', color: '#ca8a04' }}>{stats.totalBookings || 0}</h3>
                <p style={{ color: '#64748b', fontWeight: 'bold' }}>Total Escrow Deals</p>
              </div>
            </div>

            <div className="house-card" style={{ padding: '25px', marginTop: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>Admin Instructions:</h3>
              <p style={{ color: '#475569', lineHeight: '1.6' }}>
                • <b>Escrow & Payments</b> ٹیب کھول کر کرایہ داروں کی بھیجی گئی رسیدیں چیک کریں۔<br />
                • <b>Manage Listings</b> میں جا کر کسی بھی فیک اشتہار کو فوری طور پر ڈیلیٹ کریں۔<br />
                • <b>Users List</b> میں جا کر فراڈ کرنے والے اکاؤنٹ کو مستقل بین (Ban) کریں۔
              </p>
            </div>
          </div>
        )}

        {/* 2. ESCROW */}
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
                      <h4 style={{ fontSize: '18px', color: '#1e293b' }}>{b.house?.title || 'House Listing'} ({b.house?.city || 'N/A'})</h4>
                      <div style={{ fontSize: '13px', color: '#475569', margin: '6px 0' }}>
                        Tenant: <b>{b.tenant?.name || 'N/A'}</b> ({b.tenant?.phone || 'N/A'}) | Landlord: <b>{b.landlord?.name || 'N/A'}</b> ({b.landlord?.phone || 'N/A'})
                      </div>
                      <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'inline-block' }}>
                        Method: <b>{b.paymentMethod}</b> | TID: <b style={{ color: '#2563eb', fontSize: '16px' }}>{b.transactionId}</b> | Amount: <b>PKR {b.tokenAmount}</b> (Fee: PKR {b.platformFee})
                      </div>
                    </div>

                    <span style={{
                      padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                      background: b.status === 'pending_admin' ? '#fef9c3' : b.status === 'holding_escrow' ? '#eff6ff' : b.status === 'tenant_approved' ? '#dcfce7' : b.status === 'landlord_paid' ? '#16a34a' : '#fee2e2',
                      color: b.status === 'pending_admin' ? '#854d0e' : b.status === 'holding_escrow' ? '#2563eb' : b.status === 'tenant_approved' ? '#166534' : b.status === 'landlord_paid' ? '#fff' : '#dc2626'
                    }}>
                      {(b.status || 'pending').replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div style={{ marginTop: '15px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {b.status === 'pending_admin' && (
                      <>
                        <button onClick={() => handleBookingAction(b._id, 'holding_escrow', 'Confirm 3,000 PKR received in your JazzCash/EasyPaisa?')} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                          ✓ Confirm Payment Received (Hold in Escrow)
                        </button>
                        <button onClick={() => handleBookingAction(b._id, 'refunded', 'Reject invalid TID?')} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                          ✕ Invalid TID (Reject)
                        </button>
                      </>
                    )}

                    {b.status === 'tenant_approved' && (
                      <button onClick={() => handleBookingAction(b._id, 'landlord_paid', `Send PKR 2,500 to Landlord (${b.landlord?.phone}) and complete deal?`)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        💰 Release 2,500 PKR to Landlord (Keep 500 PKR Fee)
                      </button>
                    )}

                    {b.status === 'holding_escrow' && (
                      <button onClick={() => handleBookingAction(b._id, 'refunded', 'Refund 3,000 PKR to tenant?')} style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer' }}>
                        Refund Tenant (Fraud Report)
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 3. HOUSES */}
        {activeTab === 'houses' && (
          <div className="houses-grid">
            {allHouses.map((house) => (
              <div key={house._id} className="house-card">
                <img src={house.images?.[0] || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600'} alt={house.title} className="house-img" />
                <div className="house-info">
                  <div className="house-price">PKR {house.rentPrice?.toLocaleString()} / mo</div>
                  <div className="house-title">{house.title}</div>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 10px' }}>Owner: <b>{house.owner?.name || 'N/A'}</b> ({house.owner?.phone || 'N/A'})</p>
                  
                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <button className="btn-secondary" style={{ flex: 1, padding: '6px' }} onClick={() => navigate(`/house/${house._id}`)}>View</button>
                    <button onClick={() => handleDeleteHouse(house._id)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }} title="Delete Fake Listing">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. USERS */}
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
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{u.name}</td>
                    <td style={{ padding: '12px' }}>{u.email}</td>
                    <td style={{ padding: '12px' }}>{u.phone}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                        background: u.role === 'admin' ? '#fef9c3' : u.role === 'landlord' ? '#eff6ff' : '#f1f5f9',
                        color: u.role === 'admin' ? '#854d0e' : u.role === 'landlord' ? '#2563eb' : '#475569'
                      }}>
                        {(u.role || 'tenant').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer' }}
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