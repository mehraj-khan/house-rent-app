import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Home,
  PlusCircle,
  LogOut,
  Globe,
  LogIn,
  UserPlus,
  ShieldAlert,
  LayoutDashboard,
  Menu,
  X,
  MessageCircle,
  Users,
  Bell,
  CheckCheck,
  Handshake,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const isLocal =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

const API_URL = isLocal
  ? 'http://localhost:5000'
  : 'https://house-rent-app-ten.vercel.app';

// ہلکی سی نوٹیفیکیشن ٹون (بغیر کسی MP3 فائل کے)
const playNotificationSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // اگر براؤزر آٹو پلے روکے تو خاموش رہے
  }
};

const formatNotifTime = (dateValue) => {
  if (!dateValue) return '';
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const Navbar = () => {
  const { currentUser, logout, lang, toggleLanguage } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [desktopPerm, setDesktopPerm] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  const currentUserId = currentUser?.id || currentUser?._id;

  const requestDesktopPermission = async () => {
    if (typeof Notification === 'undefined') return;
    try {
      const perm = await Notification.requestPermission();
      setDesktopPerm(perm);
    } catch {
      // ignore unsupported browsers
    }
  };

  const fetchNotifications = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await axios.get(`${API_URL}/api/notifications/${currentUserId}`);
      const list = res.data.notifications || [];
      const uNotifs = res.data.unreadNotificationsCount || 0;
      const uMsgs = res.data.unreadMessagesCount || 0;
      const newTotal = uMsgs + uNotifs;

      setNotifications(list);
      setUnreadNotifs(uNotifs);
      setUnreadMessages(uMsgs);

      if (
        window.__hrPrevNotifTotal !== undefined &&
        window.__hrPrevNotifTotal !== null &&
        newTotal > window.__hrPrevNotifTotal
      ) {
        playNotificationSound();
        const latest = list[0];
        if (
          typeof Notification !== 'undefined' &&
          Notification.permission === 'granted' &&
          latest
        ) {
          const browserNotif = new Notification(
            latest.title || 'New Alert - HouseRent PK',
            { body: latest.message || 'You have a new message!' }
          );
          browserNotif.onclick = () => {
            window.focus();
            navigate(latest.link || '/messages');
          };
        }
      }
      window.__hrPrevNotifTotal = newTotal;
    } catch {
      // خاموش ایرر ہینڈلنگ
    }
  }, [currentUserId, navigate]);

  useEffect(() => {
    if (!currentUserId) {
      window.__hrPrevNotifTotal = null;
      setNotifications([]);
      setUnreadNotifs(0);
      setUnreadMessages(0);
      document.title = 'HouseRent PK';
      return;
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [currentUserId, fetchNotifications]);

  useEffect(() => {
    const count = unreadMessages + unreadNotifs;
    document.title =
      count > 0 ? `(${count}) New Alert! - HouseRent PK` : 'HouseRent PK';
  }, [unreadMessages, unreadNotifs]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.hr-notif-area')) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    if (!currentUserId) return;
    try {
      await axios.put(`${API_URL}/api/notifications/read-all/${currentUserId}`);
      setUnreadNotifs(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  const handleNotificationClick = async (notif) => {
    setNotifOpen(false);
    setMobileMenuOpen(false);
    if (!notif.isRead) {
      try {
        await axios.put(`${API_URL}/api/notifications/read/${notif._id}`);
        setUnreadNotifs((prev) => Math.max(prev - 1, 0));
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      } catch {
        // ignore
      }
    }
    navigate(notif.link || '/');
  };

  const handleNavigate = (path) => {
    setMobileMenuOpen(false);
    setNotifOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    setNotifOpen(false);
    logout();
    navigate('/');
  };

  const userInitial = currentUser?.name
    ? currentUser.name.charAt(0).toUpperCase()
    : 'U';

  const renderNotifDropdown = () => (
    <div className="hr-notif-popover">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '8px',
          marginBottom: '8px',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <b style={{ fontSize: '14px', color: '#0f172a' }}>
          🔔 {lang === 'en' ? 'Notifications' : 'نوٹیفیکیشنز'}
        </b>
        {unreadNotifs > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {desktopPerm === 'default' && (
        <button
          type="button"
          onClick={requestDesktopPermission}
          style={{
            width: '100%',
            marginBottom: '10px',
            padding: '8px 10px',
            background: '#eff6ff',
            color: '#1d4ed8',
            border: '1px dashed #93c5fd',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          🔔 Enable Desktop Popup Alerts
        </button>
      )}

      {notifications.length === 0 ? (
        <p
          style={{
            textAlign: 'center',
            color: '#64748b',
            fontSize: '13px',
            padding: '20px 0',
            margin: 0,
          }}
        >
          {lang === 'en' ? 'No notifications yet' : 'ابھی کوئی اطلاع نہیں'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleNotificationClick(n)}
              style={{
                padding: '10px',
                borderRadius: '10px',
                cursor: 'pointer',
                background: n.isRead ? '#f8fafc' : '#eff6ff',
                border: n.isRead ? '1px solid #f1f5f9' : '1px solid #bfdbfe',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <b style={{ fontSize: '13px', color: '#0f172a' }}>{n.title}</b>
                {!n.isRead && (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#2563eb',
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
              <p style={{ margin: '4px 0 2px', fontSize: '12px', color: '#475569' }}>
                {n.message}
              </p>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                {formatNotifTime(n.updatedAt || n.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <nav className="hr-navbar">
      <style>{`
        .hr-navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          padding: 10px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          width: 100%;
          box-sizing: border-box;
        }
        .hr-navbar *, .hr-navbar *::before, .hr-navbar *::after {
          box-sizing: border-box;
        }
        .hr-logo {
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 800;
          font-size: 18px;
          color: #0f172a;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .hr-nav-desktop {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: nowrap;
        }
        .hr-nav-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 7px 11px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
        }
        .hr-mobile-bar {
          display: none;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .hr-icon-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          color: #0f172a;
          border: 1px solid #cbd5e1;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          cursor: pointer;
          padding: 0;
        }
        .hr-badge-dot {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ef4444;
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          min-width: 18px;
          height: 18px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid #fff;
        }
        .hr-notif-popover {
          position: absolute;
          top: 46px;
          right: 0;
          width: 330px;
          max-width: calc(100vw - 24px);
          max-height: 420px;
          overflow-y: auto;
          background: #ffffff;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.16);
          z-index: 99999;
          padding: 12px;
        }
        .hr-nav-drawer {
          display: none;
        }

        /* iPad + Tablet + Mobile (<= 1159px) */
        @media (max-width: 1159px) {
          .hr-navbar {
            padding: 10px 16px;
          }
          .hr-nav-desktop {
            display: none !important;
          }
          .hr-mobile-bar {
            display: flex !important;
          }
          .hr-nav-drawer {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #ffffff;
            padding: 16px;
            border-bottom: 1px solid #e2e8f0;
            box-shadow: 0 16px 35px rgba(15, 23, 42, 0.12);
            max-height: calc(100vh - 64px);
            overflow-y: auto;
            z-index: 9999;
          }
          .hr-drawer-full {
            grid-column: 1 / -1;
          }
          .hr-drawer-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px;
            min-height: 44px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            width: 100%;
          }
        }

        /* Small Mobile (<= 639px) */
        @media (max-width: 639px) {
          .hr-navbar {
            padding: 10px 12px;
          }
          .hr-logo {
            font-size: 16px;
          }
          .hr-lang-mini {
            display: none !important;
          }
          .hr-nav-drawer {
            grid-template-columns: 1fr;
            padding: 14px 12px;
          }
          .hr-notif-popover {
            position: fixed;
            top: 62px;
            left: 12px;
            right: 12px;
            width: auto;
            max-width: none;
            max-height: 70vh;
          }
        }
      `}</style>

      {/* Logo */}
      <Link
        to="/"
        className="hr-logo"
        onClick={() => {
          setMobileMenuOpen(false);
          setNotifOpen(false);
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            padding: '6px',
            background: '#2563eb',
            color: '#fff',
            borderRadius: '8px',
          }}
        >
          <Home size={20} />
        </span>
        <span>{lang === 'en' ? 'HouseRent PK' : 'ہاؤس رینٹ پاکستان'}</span>
      </Link>

      {/* iPad & Mobile Top-Bar Quick Actions + Hamburger */}
      <div className="hr-mobile-bar">
        <button
          type="button"
          className="btn-lang hr-lang-mini"
          onClick={toggleLanguage}
          style={{ padding: '7px 10px', fontSize: '12px' }}
        >
          <Globe size={15} /> {lang === 'en' ? 'اردو' : 'EN'}
        </button>

        {currentUser && (
          <>
            <button
              type="button"
              className="hr-icon-btn"
              onClick={() => handleNavigate('/messages')}
              aria-label="Messages"
              style={{
                background: '#eff6ff',
                color: '#1d4ed8',
                borderColor: '#bfdbfe',
              }}
            >
              <MessageCircle size={18} />
              {unreadMessages > 0 && (
                <span className="hr-badge-dot">{unreadMessages}</span>
              )}
            </button>

            <div className="hr-notif-area" style={{ position: 'relative' }}>
              <button
                type="button"
                className="hr-icon-btn"
                onClick={() => {
                  setNotifOpen((prev) => !prev);
                  setMobileMenuOpen(false);
                }}
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadNotifs > 0 && (
                  <span className="hr-badge-dot">{unreadNotifs}</span>
                )}
              </button>
              {notifOpen && renderNotifDropdown()}
            </div>
          </>
        )}

        <button
          type="button"
          className="hr-icon-btn"
          onClick={() => {
            setMobileMenuOpen((prev) => !prev);
            setNotifOpen(false);
          }}
          aria-label="Toggle menu"
          style={{ background: '#0f172a', color: '#fff', borderColor: '#0f172a' }}
        >
          {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {/* ڈیسک ٹاپ مینیو (>= 1160px) */}
      <div className="hr-nav-desktop">
        <button
          type="button"
          className="btn-lang hr-nav-btn"
          onClick={toggleLanguage}
        >
          <Globe size={15} /> {lang === 'en' ? 'اردو' : 'English'}
        </button>

        <button
          type="button"
          className="hr-nav-btn"
          onClick={() => handleNavigate('/roommates')}
          style={{
            background: '#f0fdf4',
            color: '#15803d',
            border: '1px solid #bbf7d0',
          }}
        >
          <Users size={15} />
          {lang === 'en' ? 'Roommates' : 'روم میٹس'}
        </button>

        {currentUser?.role === 'admin' && (
          <button
            type="button"
            className="hr-nav-btn"
            onClick={() => handleNavigate('/admin')}
            style={{
              background: '#0f172a',
              color: '#60a5fa',
              border: '1px solid #3b82f6',
            }}
          >
            <ShieldAlert size={15} color="#60a5fa" /> Admin
          </button>
        )}

        {currentUser && (
          <>
            <button
              type="button"
              className="btn-secondary hr-nav-btn"
              onClick={() => handleNavigate('/dashboard')}
            >
              <LayoutDashboard size={15} />
              {lang === 'en' ? 'Dashboard' : 'ڈیش بورڈ'}
            </button>

            <button
              type="button"
              className="btn-primary hr-nav-btn"
              onClick={() => handleNavigate('/add-house')}
            >
              <PlusCircle size={15} />
              {lang === 'en' ? 'List Property' : 'گھر لسٹ کریں'}
            </button>

            <button
              type="button"
              className="hr-nav-btn"
              onClick={() => handleNavigate('/messages')}
              style={{
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
              }}
            >
              <MessageCircle size={15} />
              {lang === 'en' ? 'Messages' : 'پیغامات'}
              {unreadMessages > 0 && (
                <span
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '1px 6px',
                    borderRadius: '999px',
                  }}
                >
                  {unreadMessages}
                </span>
              )}
            </button>

            <button
              type="button"
              className="hr-nav-btn"
              onClick={() => handleNavigate('/offers')}
              style={{
                background: '#fef3c7',
                color: '#b45309',
                border: '1px solid #fde68a',
              }}
            >
              <Handshake size={15} />
              {lang === 'en' ? 'Offers' : 'آفرز'}
            </button>

            {/* Desktop Notification Bell */}
            <div className="hr-notif-area" style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                title={lang === 'en' ? 'Notifications' : 'اطلاعات'}
                className="hr-icon-btn"
                style={{ borderRadius: '50%' }}
              >
                <Bell size={18} />
                {unreadNotifs > 0 && (
                  <span className="hr-badge-dot">{unreadNotifs}</span>
                )}
              </button>
              {notifOpen && renderNotifDropdown()}
            </div>
          </>
        )}

        {currentUser ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f8fafc',
              padding: '4px 8px',
              borderRadius: '30px',
              border: '1px solid #e2e8f0',
              flexShrink: 0,
            }}
          >
            <div
              onClick={() => handleNavigate('/profile')}
              title={lang === 'en' ? 'View Profile' : 'پروفائل دیکھیں'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#2563eb',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  flexShrink: 0,
                }}
              >
                {userInitial}
              </span>
              <span
                style={{
                  fontWeight: '600',
                  fontSize: '13px',
                  color: '#0f172a',
                  maxWidth: '110px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {currentUser.name}
              </span>
            </div>
            {currentUser?.role === 'admin' && (
              <span
                style={{
                  background: '#fef3c7',
                  color: '#b45309',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  padding: '2px 6px',
                  borderRadius: '10px',
                }}
              >
                Admin
              </span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="btn-outline"
              title="Logout"
              style={{ padding: '4px 8px', fontSize: '12px' }}
            >
              <LogOut size={14} style={{ verticalAlign: 'middle' }} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-login hr-nav-btn"
              onClick={() => handleNavigate('/login')}
            >
              <LogIn size={15} /> {lang === 'en' ? 'Log In' : 'لاگ ان'}
            </button>
            <button
              type="button"
              className="btn-signup hr-nav-btn"
              onClick={() => handleNavigate('/register')}
            >
              <UserPlus size={15} /> {lang === 'en' ? 'Sign Up' : 'سائن اپ'}
            </button>
          </div>
        )}
      </div>

      {/* iPad & موبائل ڈراپ ڈاؤن مینیو */}
      {mobileMenuOpen && (
        <div className="hr-nav-drawer">
          <button
            type="button"
            className="btn-lang hr-drawer-btn"
            onClick={toggleLanguage}
          >
            <Globe size={18} />
            {lang === 'en' ? 'اردو میں تبدیل کریں' : 'Switch to English'}
          </button>

          <button
            type="button"
            className="hr-drawer-btn"
            onClick={() => handleNavigate('/roommates')}
            style={{
              background: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #bbf7d0',
            }}
          >
            <Users size={18} />
            {lang === 'en' ? 'Roommates Finder' : 'روم میٹس تلاش'}
          </button>

          {currentUser?.role === 'admin' && (
            <button
              type="button"
              className="hr-drawer-btn hr-drawer-full"
              onClick={() => handleNavigate('/admin')}
              style={{
                background: '#0f172a',
                color: '#60a5fa',
                border: '1px solid #3b82f6',
              }}
            >
              <ShieldAlert size={18} /> Admin Control Center
            </button>
          )}

          {currentUser && (
            <>
              <button
                type="button"
                className="btn-secondary hr-drawer-btn"
                onClick={() => handleNavigate('/dashboard')}
              >
                <LayoutDashboard size={18} />
                {lang === 'en' ? 'My Dashboard' : 'میرا ڈیش بورڈ'}
              </button>

              <button
                type="button"
                className="btn-primary hr-drawer-btn"
                onClick={() => handleNavigate('/add-house')}
              >
                <PlusCircle size={18} />
                {lang === 'en' ? 'List a Property' : 'نیا گھر لسٹ کریں'}
              </button>

              <button
                type="button"
                className="hr-drawer-btn"
                onClick={() => handleNavigate('/messages')}
                style={{
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                }}
              >
                <MessageCircle size={18} />
                {lang === 'en' ? 'Messages Inbox' : 'پیغامات (Inbox)'}
                {unreadMessages > 0 && (
                  <span
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '1px 7px',
                      borderRadius: '999px',
                    }}
                  >
                    {unreadMessages}
                  </span>
                )}
              </button>

              <button
                type="button"
                className="hr-drawer-btn"
                onClick={() => handleNavigate('/offers')}
                style={{
                  background: '#fef3c7',
                  color: '#b45309',
                  border: '1px solid #fde68a',
                }}
              >
                <Handshake size={18} />
                {lang === 'en' ? 'Rent Offers' : 'کرایہ آفرز'}
              </button>
            </>
          )}

          {currentUser ? (
            <div
              className="hr-drawer-full"
              style={{
                background: '#f8fafc',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <div
                onClick={() => handleNavigate('/profile')}
                style={{ cursor: 'pointer', minWidth: 0, flex: 1 }}
              >
                <p
                  style={{
                    margin: 0,
                    fontWeight: 'bold',
                    fontSize: '14px',
                    color: '#0f172a',
                  }}
                >
                  {currentUser.name}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#64748b',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {currentUser.email}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-outline"
                style={{
                  padding: '8px 14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          ) : (
            <div
              className="hr-drawer-full"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '8px',
              }}
            >
              <button
                type="button"
                className="btn-login hr-drawer-btn"
                onClick={() => handleNavigate('/login')}
              >
                <LogIn size={16} /> {lang === 'en' ? 'Log In' : 'لاگ ان'}
              </button>
              <button
                type="button"
                className="btn-signup hr-drawer-btn"
                onClick={() => handleNavigate('/register')}
              >
                <UserPlus size={16} />
                {lang === 'en' ? 'Create Account' : 'نیا اکاؤنٹ بنائیں'}
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;