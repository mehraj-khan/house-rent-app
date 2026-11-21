import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [mobileNotifsOpen, setMobileNotifsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [desktopPerm, setDesktopPerm] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  const notifRef = useRef(null);
  const prevTotalRef = useRef(null);
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

      if (prevTotalRef.current !== null && newTotal > prevTotalRef.current) {
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

      prevTotalRef.current = newTotal;
      setNotifications(list);
      setUnreadNotifs(uNotifs);
      setUnreadMessages(uMsgs);
    } catch {
      // خاموش ایرر ہینڈلنگ
    }
  }, [currentUserId, navigate]);

  useEffect(() => {
    if (!currentUserId) {
      prevTotalRef.current = null;
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
      if (notifRef.current && !notifRef.current.contains(e.target)) {
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
    setMobileNotifsOpen(false);
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
    setMobileNotifsOpen(false);
    setNotifOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    setMobileNotifsOpen(false);
    setNotifOpen(false);
    logout();
    navigate('/');
  };

  const userInitial = currentUser?.name
    ? currentUser.name.charAt(0).toUpperCase()
    : 'U';

  return (
    <nav className="navbar">
      <Link
        to="/"
        className="logo"
        style={{
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: '800',
        }}
        onClick={() => setMobileMenuOpen(false)}
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

      <button
        type="button"
        className="btn-hamburger"
        onClick={() => setMobileMenuOpen((prev) => !prev)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* ڈیسک ٹاپ مینیو */}
      <div className="nav-desktop">
        <button type="button" className="btn-lang" onClick={toggleLanguage}>
          <Globe size={16} /> {lang === 'en' ? 'اردو' : 'English'}
        </button>

        <button
          type="button"
          onClick={() => handleNavigate('/roommates')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#f0fdf4',
            color: '#15803d',
            border: '1px solid #bbf7d0',
            padding: '8px 14px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            whiteSpace: 'nowrap',
          }}
        >
          <Users size={16} />
          {lang === 'en' ? 'Roommates' : 'روم میٹس'}
        </button>

        {currentUser?.role === 'admin' && (
          <button
            type="button"
            onClick={() => handleNavigate('/admin')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#0f172a',
              color: '#60a5fa',
              border: '1px solid #3b82f6',
              padding: '8px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            <ShieldAlert size={16} color="#60a5fa" /> Admin Center
          </button>
        )}

        {currentUser && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleNavigate('/dashboard')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
              }}
            >
              <LayoutDashboard size={16} />
              {lang === 'en' ? 'My Dashboard' : 'میرا ڈیش بورڈ'}
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={() => handleNavigate('/add-house')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
              }}
            >
              <PlusCircle size={16} />
              {lang === 'en' ? 'List Property' : 'گھر لسٹ کریں'}
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/messages')}
              style={{
                position: 'relative',
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
                whiteSpace: 'nowrap',
              }}
            >
              <MessageCircle size={17} />
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
                    marginLeft: '2px',
                  }}
                >
                  {unreadMessages}
                </span>
              )}
            </button>

            <button
  onClick={() => handleNavigate('/offers')}
  style={{
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a',
    padding: '8px 14px', borderRadius: '10px', cursor: 'pointer',
    fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap'
  }}
>
  <Handshake size={16} />
  {lang === 'en' ? 'Offers' : 'آفرز'}
</button>

            {/* Notification Bell */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                title={lang === 'en' ? 'Notifications' : 'اطلاعات'}
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f8fafc',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                }}
              >
                <Bell size={18} />
                {unreadNotifs > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: '800',
                      minWidth: '18px',
                      height: '18px',
                      borderRadius: '999px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 4px',
                      border: '2px solid #fff',
                    }}
                  >
                    {unreadNotifs}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '46px',
                    right: 0,
                    width: '320px',
                    maxHeight: '420px',
                    overflowY: 'auto',
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 12px 35px rgba(0,0,0,0.15)',
                    zIndex: 99999,
                    padding: '12px',
                  }}
                >
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
                        padding: '7px 10px',
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
                            border: n.isRead
                              ? '1px solid #f1f5f9'
                              : '1px solid #bfdbfe',
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
                            <b style={{ fontSize: '13px', color: '#0f172a' }}>
                              {n.title}
                            </b>
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
                          <p
                            style={{
                              margin: '4px 0 2px',
                              fontSize: '12px',
                              color: '#475569',
                            }}
                          >
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
              )}
            </div>
          </div>
        )}

        {currentUser ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f8fafc',
              padding: '4px 8px',
              borderRadius: '30px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              onClick={() => handleNavigate('/profile')}
              title={lang === 'en' ? 'View Profile' : 'پروفائل دیکھیں'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
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
                }}
              >
                {userInitial}
              </span>
              <span style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>
                {currentUser.name}
              </span>
            </div>
            {currentUser?.role === 'admin' && (
              <span
                style={{
                  background: '#fef3c7',
                  color: '#b45309',
                  fontSize: '11px',
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
              style={{ padding: '4px 10px', fontSize: '12px', marginLeft: '4px' }}
            >
              <LogOut size={14} style={{ verticalAlign: 'middle' }} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-login"
              onClick={() => handleNavigate('/login')}
            >
              <LogIn size={16} /> {lang === 'en' ? 'Log In' : 'لاگ ان'}
            </button>
            <button
              type="button"
              className="btn-signup"
              onClick={() => handleNavigate('/register')}
            >
              <UserPlus size={16} /> {lang === 'en' ? 'Sign Up' : 'سائن اپ'}
            </button>
          </div>
        )}
      </div>

      {/* موبائل ڈراپ ڈاؤن مینیو */}
      {mobileMenuOpen && (
        <div className="nav-mobile-dropdown">
          <button
            type="button"
            className="btn-lang"
            onClick={toggleLanguage}
            style={{ justifyContent: 'center' }}
          >
            <Globe size={18} />
            {lang === 'en' ? 'اردو میں تبدیل کریں' : 'Switch to English'}
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('/roommates')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #bbf7d0',
              padding: '11px',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <Users size={18} />
            {lang === 'en' ? 'Roommates & Room Finder' : 'روم میٹس اور کمرہ تلاش'}
          </button>

          {currentUser?.role === 'admin' && (
            <button
              type="button"
              onClick={() => handleNavigate('/admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#0f172a',
                color: '#60a5fa',
                border: '1px solid #3b82f6',
                padding: '11px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              <ShieldAlert size={18} /> Admin Control Center
            </button>
          )}

          {currentUser && (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleNavigate('/dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '11px',
                }}
              >
                <LayoutDashboard size={18} />
                {lang === 'en' ? 'My Dashboard & Bookings' : 'میرا ڈیش بورڈ اور بکنگز'}
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={() => handleNavigate('/add-house')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '11px',
                }}
              >
                <PlusCircle size={18} />
                {lang === 'en' ? 'List a Property' : 'نیا گھر لسٹ کریں'}
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('/messages')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  padding: '11px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
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
  onClick={() => handleNavigate('/offers')}
  style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a',
    padding: '11px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer'
  }}
>
  <Handshake size={18} />
  {lang === 'en' ? 'Rent Offers ' : 'کرایہ آفرز'}
</button>
              {/* Mobile Notifications Toggle */}
              <button
                type="button"
                onClick={() => setMobileNotifsOpen((prev) => !prev)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#f8fafc',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  padding: '11px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                <Bell size={18} />
                {lang === 'en' ? 'Notifications' : 'نوٹیفیکیشنز'}
                {unreadNotifs > 0 && (
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
                    {unreadNotifs}
                  </span>
                )}
              </button>

              {mobileNotifsOpen && (
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    padding: '10px',
                    maxHeight: '260px',
                    overflowY: 'auto',
                  }}
                >
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
                        marginBottom: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCheck size={14} /> Mark all read
                    </button>
                  )}
                  {notifications.length === 0 ? (
                    <p
                      style={{
                        textAlign: 'center',
                        color: '#64748b',
                        fontSize: '13px',
                        margin: '8px 0',
                      }}
                    >
                      {lang === 'en' ? 'No notifications yet' : 'ابھی کوئی اطلاع نہیں'}
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => handleNotificationClick(n)}
                          style={{
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: n.isRead ? '#f8fafc' : '#eff6ff',
                            border: n.isRead
                              ? '1px solid #f1f5f9'
                              : '1px solid #bfdbfe',
                          }}
                        >
                          <b style={{ fontSize: '12px', color: '#0f172a' }}>
                            {n.title}
                          </b>
                          <p style={{ margin: '2px 0', fontSize: '12px', color: '#475569' }}>
                            {n.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {currentUser ? (
            <div
              style={{
                background: '#f8fafc',
                padding: '12px',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '6px',
              }}
            >
              <div onClick={() => handleNavigate('/profile')} style={{ cursor: 'pointer' }}>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>
                  {currentUser.name}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  {currentUser.email}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-outline"
                style={{ padding: '6px 12px' }}
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '6px',
              }}
            >
              <button
                type="button"
                className="btn-login"
                onClick={() => handleNavigate('/login')}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <LogIn size={16} /> {lang === 'en' ? 'Log In' : 'لاگ ان'}
              </button>
              <button
                type="button"
                className="btn-signup"
                onClick={() => handleNavigate('/register')}
                style={{ width: '100%', justifyContent: 'center' }}
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