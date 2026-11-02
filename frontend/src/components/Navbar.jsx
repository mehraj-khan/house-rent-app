/* eslint-disable */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, PlusCircle, User, LogOut, Globe, LogIn, UserPlus, 
  ShieldAlert, LayoutDashboard, Menu, X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout, lang, toggleLanguage } = useAuth();
  const navigate = useNavigate();

  // موبائل مینیو کھلنے یا بند ہونے کی اسٹیٹ
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleBadge = () => {
    if (currentUser?.role === 'admin') return '👑 Super Admin';
    if (currentUser?.role === 'landlord') return lang === 'en' ? 'Landlord' : 'مالک مکان';
    return lang === 'en' ? 'Tenant' : 'کرایہ دار';
  };

  // بٹن دبانے پر نیویگیٹ کریں اور موبائل مینیو خود بخود بند ہو جائے
  const handleNavigate = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      {/* ویب سائٹ کا لوگو */}
      <Link to="/" className="logo" style={{ textDecoration: 'none' }} onClick={() => setMobileMenuOpen(false)}>
        <Home size={28} /> {lang === 'en' ? 'HouseRent PK' : 'ہاؤس رینٹ پاکستان'}
      </Link>

      {/* 📱 موبائل ہیمبرگر بٹن (صرف موبائل پر دکھے گا) */}
      <button 
        className="btn-hamburger" 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle Navigation Menu"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* 💻 کمپیوٹر کے لیے نیوبار (بڑے مانیٹرز پر نظر آئے گا) */}
      <div className="nav-desktop">
        <button className="btn-lang" onClick={toggleLanguage} title="Change Language">
          <Globe size={18} /> {lang === 'en' ? 'اردو' : 'English'}
        </button>

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => handleNavigate('/admin')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#0f172a', color: '#60a5fa', border: '1.5px solid #3b82f6',
              padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
            }}
          >
            <ShieldAlert size={18} color="#60a5fa" />
            Admin Center
          </button>
        )}

        {currentUser?.role === 'landlord' && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="btn-secondary" onClick={() => handleNavigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}>
              <LayoutDashboard size={18} />
              {lang === 'en' ? 'My Properties' : 'میرے مکانات'}
            </button>
            <button className="btn-primary" onClick={() => handleNavigate('/add-house')}>
              <PlusCircle size={18} style={{ marginInlineEnd: '6px', verticalAlign: 'middle' }} />
              {lang === 'en' ? 'Add Property' : 'گھر لسٹ کریں'}
            </button>
          </div>
        )}

        {currentUser?.role === 'tenant' && (
          <button className="btn-secondary" onClick={() => handleNavigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}>
            <LayoutDashboard size={18} />
            {lang === 'en' ? 'My Bookings' : 'میری بکنگز'}
          </button>
        )}

        {currentUser ? (
          <div className="user-profile">
            <span>
              <User size={18} style={{ verticalAlign: 'middle', marginInlineEnd: '6px' }} />
              <b>{currentUser.name}</b> ({getRoleBadge()})
            </span>
            <button className="btn-outline" onClick={handleLogout}>
              <LogOut size={16} style={{ verticalAlign: 'middle' }} /> {lang === 'en' ? 'Logout' : 'لاگ آؤٹ'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="btn-login" onClick={() => handleNavigate('/login')}>
              <LogIn size={16} /> {lang === 'en' ? 'Log In' : 'لاگ ان'}
            </button>
            <button className="btn-signup" onClick={() => handleNavigate('/register')}>
              <UserPlus size={16} /> {lang === 'en' ? 'Sign Up' : 'سائن اپ'}
            </button>
          </div>
        )}
      </div>

      {/* 📱 موبائل ڈراپ ڈاؤن مینیو (جب ☰ بٹن دبایا جائے) */}
      {mobileMenuOpen && (
        <div className="nav-mobile-dropdown">
          <button className="btn-lang" onClick={toggleLanguage} style={{ justifyContent: 'center' }}>
            <Globe size={18} /> {lang === 'en' ? 'اردو میں تبدیل کریں' : 'Switch to English'}
          </button>

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => handleNavigate('/admin')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                background: '#0f172a', color: '#60a5fa', border: '1.5px solid #3b82f6',
                padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              <ShieldAlert size={18} color="#60a5fa" />
              Admin Control Center
            </button>
          )}

          {currentUser?.role === 'landlord' && (
            <>
              <button className="btn-secondary" onClick={() => handleNavigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <LayoutDashboard size={18} />
                {lang === 'en' ? 'My Properties Dashboard' : 'میرے مکانات کا ڈیش بورڈ'}
              </button>
              <button className="btn-primary" onClick={() => handleNavigate('/add-house')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <PlusCircle size={18} />
                {lang === 'en' ? 'List a New Property' : 'نیا گھر لسٹ کریں'}
              </button>
            </>
          )}

          {currentUser?.role === 'tenant' && (
            <button className="btn-secondary" onClick={() => handleNavigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <LayoutDashboard size={18} />
              {lang === 'en' ? 'My Bookings & Escrow' : 'میری بکنگز اور امانت'}
            </button>
          )}

          {currentUser ? (
            <div className="user-profile">
              <span style={{ fontSize: '15px' }}>
                <User size={18} style={{ verticalAlign: 'middle', marginInlineEnd: '6px' }} />
                Signed in as: <b>{currentUser.name}</b> ({getRoleBadge()})
              </span>
              <button className="btn-outline" onClick={handleLogout} style={{ marginTop: '8px' }}>
                <LogOut size={16} style={{ verticalAlign: 'middle', marginInlineEnd: '6px' }} />
                {lang === 'en' ? 'Logout Account' : 'لاگ آؤٹ کریں'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
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