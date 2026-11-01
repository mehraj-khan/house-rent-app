import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, PlusCircle, User, LogOut, Globe, LogIn, UserPlus, 
  ShieldAlert, LayoutDashboard 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout, lang, toggleLanguage } = useAuth();
  const navigate = useNavigate();

  // رول کا نام درست دکھانا
  const getRoleBadge = () => {
    if (currentUser?.role === 'admin') return '👑 Super Admin';
    if (currentUser?.role === 'landlord') return lang === 'en' ? 'Landlord' : 'مالک مکان';
    return lang === 'en' ? 'Tenant' : 'کرایہ دار';
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
        <Home size={28} /> {lang === 'en' ? 'HouseRent PK' : 'ہاؤس رینٹ پاکستان'}
      </Link>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {/* لینگویج سوئچر */}
        <button className="btn-lang" onClick={toggleLanguage} title="Change Language">
          <Globe size={18} /> {lang === 'en' ? 'اردو' : 'English'}
        </button>

        {/* 👑 اگر ایڈمن لاگ ان ہو تو ایڈمن پورٹل کا بٹن */}
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => navigate('/admin')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#0f172a', color: '#60a5fa', border: '1.5px solid #3b82f6',
              padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
            }}
          >
            <ShieldAlert size={18} color="#60a5fa" />
            Admin Control Center
          </button>
        )}

        {/* 🏠 اگر لینڈ لارڈ لاگ ان ہو تو "My Properties" اور "Add Property" دونوں بٹنز */}
        {currentUser?.role === 'landlord' && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* میرے مکانات (ڈیش بورڈ) کا بٹن */}
            <button
              className="btn-secondary"
              onClick={() => navigate('/dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
            >
              <LayoutDashboard size={18} />
              {lang === 'en' ? 'My Properties' : 'میرے مکانات'}
            </button>

            {/* نیا گھر لسٹ کرنے کا بٹن */}
            <button className="btn-primary" onClick={() => navigate('/add-house')}>
              <PlusCircle size={18} style={{ marginInlineEnd: '6px', verticalAlign: 'middle' }} />
              {lang === 'en' ? 'Add Property' : 'گھر لسٹ کریں'}
            </button>
          </div>
        )}

        {/* کرایہ دار اگر لاگ ان ہو تو اس کے لیے بکنگز سنٹر کا بٹن */}
        {currentUser?.role === 'tenant' && (
          <button
            className="btn-secondary"
            onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
          >
            <LayoutDashboard size={18} />
            {lang === 'en' ? 'My Bookings' : 'میری بکنگز'}
          </button>
        )}

        {/* یوزر پروفائل اور لاگ آؤٹ بٹن */}
        {currentUser ? (
          <div className="user-profile">
            <span>
              <User size={18} style={{ verticalAlign: 'middle', marginInlineEnd: '6px' }} />
              <b>{currentUser.name}</b> ({getRoleBadge()})
            </span>
            <button className="btn-outline" onClick={() => { logout(); navigate('/'); }}>
              <LogOut size={16} style={{ verticalAlign: 'middle' }} /> {lang === 'en' ? 'Logout' : 'لاگ آؤٹ'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="btn-login" onClick={() => navigate('/login')}>
              <LogIn size={16} /> {lang === 'en' ? 'Log In' : 'لاگ ان'}
            </button>
            <button className="btn-signup" onClick={() => navigate('/register')}>
              <UserPlus size={16} /> {lang === 'en' ? 'Sign Up' : 'سائن اپ'}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;