/* eslint-disable */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, PlusCircle, LogOut, Globe, LogIn, UserPlus, 
  ShieldAlert, LayoutDashboard, Menu, X, MessageCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout, lang, toggleLanguage } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/');
  };

  const userInitial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U';

  return (
    <nav className="navbar">
      {/* لوگو */}
      <Link
        to="/"
        className="logo"
        style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}
        onClick={() => setMobileMenuOpen(false)}
      >
        <span style={{ display: 'inline-flex', padding: '6px', background: '#2563eb', color: '#fff', borderRadius: '8px' }}>
          <Home size={20} />
        </span>
        <span>{lang === 'en' ? 'HouseRent PK' : 'ہاؤس رینٹ پاکستان'}</span>
      </Link>

      {/* موبائل مینیو ٹوگل */}
      <button className="btn-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* 💻 ڈیسک ٹاپ مینیو */}
      <div className="nav-desktop">
        <button className="btn-lang" onClick={toggleLanguage}>
          <Globe size={16} /> {lang === 'en' ? 'اردو' : 'English'}
        </button>

        {/* 👑 سپر ایڈمن پینل */}
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => handleNavigate('/admin')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: '#0f172a', color: '#60a5fa', border: '1px solid #3b82f6',
              padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
            }}
          >
            <ShieldAlert size={16} color="#60a5fa" />
            Admin Center
          </button>
        )}

        {/* 🌟 ہر لاگ ان یوزر کے بٹن */}
        {currentUser && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="btn-secondary"
              onClick={() => handleNavigate('/dashboard')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
            >
              <LayoutDashboard size={16} />
              {lang === 'en' ? 'My Dashboard' : 'میرا ڈیش بورڈ'}
            </button>
            <button
              className="btn-primary"
              onClick={() => handleNavigate('/add-house')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
            >
              <PlusCircle size={16} />
              {lang === 'en' ? 'List Property' : 'گھر لسٹ کریں'}
            </button>
            <button
              onClick={() => handleNavigate('/messages')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                padding: '8px 14px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                whiteSpace: 'nowrap'
              }}
            >
              <MessageCircle size={17} />
              {lang === 'en' ? 'Messages' : 'پیغامات'}
            </button>
          </div>
        )}

        {currentUser ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '4px 8px', borderRadius: '30px', border: '1px solid #e2e8f0' }}>
            <div
              onClick={() => handleNavigate('/profile')}
              title={lang === 'en' ? 'View Profile' : 'پروفائل دیکھیں'}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>
                {userInitial}
              </span>
              <span style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>{currentUser.name}</span>
            </div>
            {currentUser?.role === 'admin' && (
              <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '11px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px' }}>
                Admin
              </span>
            )}
            <button onClick={handleLogout} className="btn-outline" title="Logout" style={{ padding: '4px 10px', fontSize: '12px', marginLeft: '4px' }}>
              <LogOut size={14} style={{ verticalAlign: 'middle' }} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="btn-login" onClick={() => handleNavigate('/login')}>
              <LogIn size={16} /> {lang === 'en' ? 'Log In' : 'لاگ ان'}
            </button>
            <button className="btn-signup" onClick={() => handleNavigate('/register')}>
              <UserPlus size={16} /> {lang === 'en' ? 'Sign Up' : 'سائن اپ'}
            </button>
          </div>
        )}
      </div>

      {/* 📱 موبائل ڈراپ ڈاؤن مینیو */}
      {mobileMenuOpen && (
        <div className="nav-mobile-dropdown">
          <button className="btn-lang" onClick={toggleLanguage} style={{ justifyContent: 'center' }}>
            <Globe size={18} /> {lang === 'en' ? 'اردو میں تبدیل کریں' : 'Switch to English'}
          </button>

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => handleNavigate('/admin')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: '#0f172a', color: '#60a5fa', border: '1px solid #3b82f6',
                padding: '11px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              <ShieldAlert size={18} /> Admin Control Center
            </button>
          )}

          {currentUser && (
            <>
              <button
                className="btn-secondary"
                onClick={() => handleNavigate('/dashboard')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px' }}
              >
                <LayoutDashboard size={18} />
                {lang === 'en' ? 'My Dashboard & Bookings' : 'میرا ڈیش بورڈ اور بکنگز'}
              </button>
              <button
                className="btn-primary"
                onClick={() => handleNavigate('/add-house')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px' }}
              >
                <PlusCircle size={18} />
                {lang === 'en' ? 'List a Property' : 'نیا گھر لسٹ کریں'}
              </button>
              <button
                onClick={() => handleNavigate('/messages')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe',
                  padding: '11px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer'
                }}
              >
                <MessageCircle size={18} />
                {lang === 'en' ? 'Messages Inbox' : 'پیغامات (Inbox)'}
              </button>
            </>
          )}

          {currentUser ? (
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <div onClick={() => handleNavigate('/profile')} style={{ cursor: 'pointer' }}>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{currentUser.name}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{currentUser.email}</p>
              </div>
              <button onClick={handleLogout} className="btn-outline" style={{ padding: '6px 12px' }}>
                <LogOut size={15} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              <button className="btn-login" onClick={() => handleNavigate('/login')} style={{ width: '100%', justifyContent: 'center' }}>
                <LogIn size={16} /> {lang === 'en' ? 'Log In' : 'لاگ ان'}
              </button>
              <button className="btn-signup" onClick={() => handleNavigate('/register')} style={{ width: '100%', justifyContent: 'center' }}>
                <UserPlus size={16} /> {lang === 'en' ? 'Create Account' : 'نیا اکاؤنٹ بنائیں'}
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;