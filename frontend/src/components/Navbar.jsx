import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Home,
  Plus,
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
  Megaphone,
  Building2,
  Tag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const isLocal =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

const API_URL = isLocal
  ? 'http://localhost:5000'
  : 'https://house-rent-app-ten.vercel.app';

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
    // ignore
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
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [desktopPerm, setDesktopPerm] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  const currentUserId = currentUser?.id || currentUser?._id;
  const queryPurpose = new URLSearchParams(location.search).get('purpose');

  const isBuyActive =
    location.pathname === '/buy' ||
    (location.pathname === '/' && queryPurpose === 'sale');
  const isRentActive = location.pathname === '/' && !isBuyActive;

  const requestDesktopPermission = async () => {
    if (typeof Notification === 'undefined') return;
    try {
      const perm = await Notification.requestPermission();
      setDesktopPerm(perm);
    } catch {
      // ignore
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
      // ignore
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
      <div className="hr-notif-head">
        <span>🔔 {lang === 'en' ? 'Notifications' : 'نوٹیفیکیشنز'}</span>
        {unreadNotifs > 0 && (
          <button type="button" onClick={handleMarkAllRead} className="hr-notif-readall">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {desktopPerm === 'default' && (
        <button type="button" onClick={requestDesktopPermission} className="hr-notif-perm-btn">
          🔔 Enable Desktop Popup Alerts
        </button>
      )}

      {notifications.length === 0 ? (
        <p className="hr-notif-empty">
          {lang === 'en' ? 'No notifications yet' : 'ابھی کوئی اطلاع نہیں'}
        </p>
      ) : (
        <div className="hr-notif-list">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleNotificationClick(n)}
              className={`hr-notif-item ${n.isRead ? 'read' : 'unread'}`}
            >
              <div className="hr-notif-item-top">
                <b>{n.title}</b>
                {!n.isRead && <span className="hr-unread-dot" />}
              </div>
              <p>{n.message}</p>
              <span>{formatNotifTime(n.updatedAt || n.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <header className="hr-nav-root">
      <style>{`
        .hr-nav-root {
          position: sticky;
          top: 0;
          z-index: 1000;
          width: 100%;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 1px 8px rgba(15, 23, 42, 0.04);
        }
        .hr-nav-root *, .hr-nav-root *::before, .hr-nav-root *::after {
          box-sizing: border-box;
        }
        .hr-nav-inner {
          max-width: 1380px;
          margin: 0 auto;
          height: 66px;
          padding: 0 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        /* Logo */
        .hr-brand {
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .hr-brand-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
        }
        .hr-brand-text {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.3px;
          color: #0f172a;
          white-space: nowrap;
        }

        /* Center Segmented Nav */
        .hr-center-track {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        .hr-seg-btn {
          height: 34px;
          padding: 0 13px;
          border: none;
          border-radius: 9px;
          background: transparent;
          color: #475569;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          transition: all 0.16s ease;
        }
        .hr-seg-btn:hover {
          color: #0f172a;
          background: rgba(255, 255, 255, 0.6);
        }
        .hr-seg-btn.active {
          background: #ffffff;
          color: #1d4ed8;
          box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08);
        }
        .hr-seg-btn.active-buy {
          background: #ffffff;
          color: #047857;
          box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08);
        }

        /* Right Side Controls */
        .hr-right-cluster {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .hr-ghost-btn {
          height: 38px;
          padding: 0 11px;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: #334155;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .hr-ghost-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .hr-ghost-btn.active {
          background: #eff6ff;
          color: #1d4ed8;
        }
        .hr-admin-btn {
          height: 36px;
          padding: 0 11px;
          border: 1px solid #1e293b;
          border-radius: 10px;
          background: #0f172a;
          color: #f8fafc;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
        }
        .hr-divider {
          width: 1px;
          height: 22px;
          background: #e2e8f0;
          margin: 0 3px;
        }
        .hr-cta-btn {
          height: 38px;
          padding: 0 14px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
          transition: transform 0.12s ease, box-shadow 0.15s ease;
        }
        .hr-cta-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.32);
        }
        .hr-circle-btn {
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #334155;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .hr-circle-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          color: #0f172a;
        }
        .hr-badge {
          position: absolute;
          top: -3px;
          right: -3px;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          border-radius: 999px;
          background: #ef4444;
          color: #ffffff;
          font-size: 10px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
        }
        .hr-lang-pill {
          height: 38px;
          padding: 0 10px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #334155;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
        }
        .hr-lang-pill:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }
        .hr-user-pill {
          height: 38px;
          padding: 3px 5px 3px 4px;
          border-radius: 999px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }
        .hr-user-trigger {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          padding-right: 2px;
        }
        .hr-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #1e40af);
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .hr-username {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          max-width: 90px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .hr-logout-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: #64748b;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .hr-logout-icon:hover {
          background: #fee2e2;
          color: #dc2626;
        }
        .hr-login-btn {
          height: 38px;
          padding: 0 14px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #0f172a;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .hr-login-btn:hover {
          background: #f8fafc;
        }

        /* Notification Popover */
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
          box-shadow: 0 14px 36px rgba(15, 23, 42, 0.15);
          z-index: 99999;
          padding: 12px;
        }
        .hr-notif-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 10px;
          margin-bottom: 10px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }
        .hr-notif-readall {
          background: none;
          border: none;
          color: #2563eb;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .hr-notif-perm-btn {
          width: 100%;
          margin-bottom: 10px;
          padding: 8px 10px;
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px dashed #93c5fd;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .hr-notif-empty {
          text-align: center;
          color: #64748b;
          font-size: 13px;
          padding: 22px 0;
          margin: 0;
        }
        .hr-notif-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .hr-notif-item {
          padding: 10px 11px;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .hr-notif-item.read {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
        }
        .hr-notif-item.unread {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
        }
        .hr-notif-item-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #0f172a;
        }
        .hr-unread-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2563eb;
          flex-shrink: 0;
        }
        .hr-notif-item p {
          margin: 4px 0 2px;
          font-size: 12px;
          color: #475569;
        }
        .hr-notif-item span {
          font-size: 10px;
          color: #94a3b8;
        }

        /* Mobile / Tablet */
        .hr-mobile-controls {
          display: none;
          align-items: center;
          gap: 8px;
        }
        .hr-menu-toggle {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          border: 1px solid #0f172a;
          background: #0f172a;
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .hr-drawer {
          display: none;
        }

        @media (max-width: 1180px) {
          .hr-center-track,
          .hr-right-cluster {
            display: none !important;
          }
          .hr-mobile-controls {
            display: flex !important;
          }
          .hr-drawer {
            display: block;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #ffffff;
            border-bottom: 1px solid #e2e8f0;
            box-shadow: 0 20px 40px rgba(15, 23, 42, 0.14);
            padding: 16px 20px 20px;
            max-height: calc(100vh - 66px);
            overflow-y: auto;
            z-index: 9999;
          }
          .hr-drawer-section-title {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color: #64748b;
            margin: 12px 0 8px;
          }
          .hr-drawer-section-title:first-child {
            margin-top: 0;
          }
          .hr-drawer-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
          .hr-drawer-item {
            height: 44px;
            padding: 0 12px;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            color: #1e293b;
            font-size: 13.5px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          .hr-drawer-item.active {
            background: #eff6ff;
            border-color: #93c5fd;
            color: #1d4ed8;
          }
          .hr-drawer-item.active-buy {
            background: #ecfdf5;
            border-color: #6ee7b7;
            color: #047857;
          }
          .hr-drawer-cta {
            width: 100%;
            height: 46px;
            margin-top: 10px;
            border: none;
            border-radius: 11px;
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: #ffffff;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
          }
          .hr-drawer-profile {
            margin-top: 14px;
            padding: 12px 14px;
            border-radius: 12px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
          }
        }

        @media (max-width: 639px) {
          .hr-nav-inner {
            padding: 0 14px;
            height: 62px;
          }
          .hr-brand-text {
            font-size: 15.5px;
          }
          .hr-lang-hide-xs {
            display: none !important;
          }
          .hr-drawer {
            padding: 14px;
          }
          .hr-drawer-grid {
            grid-template-columns: 1fr;
          }
          .hr-notif-popover {
            position: fixed;
            top: 66px;
            left: 12px;
            right: 12px;
            width: auto;
            max-width: none;
            max-height: 70vh;
          }
        }
      `}</style>

      <div className="hr-nav-inner">
        {/* 1. Brand Logo */}
        <Link
          to="/"
          className="hr-brand"
          onClick={() => {
            setMobileMenuOpen(false);
            setNotifOpen(false);
          }}
        >
          <span className="hr-brand-icon">
            <Home size={19} />
          </span>
          <span className="hr-brand-text">
            {lang === 'en' ? 'HouseRent PK' : 'ہاؤس رینٹ پاکستان'}
          </span>
        </Link>

        {/* 2. Desktop Center Navigation (Unified Sleek Segmented Bar) */}
        <nav className="hr-center-track" aria-label="Primary">
          <button
            type="button"
            className={`hr-seg-btn ${isRentActive ? 'active' : ''}`}
            onClick={() => handleNavigate('/?purpose=rent')}
          >
            <Building2 size={15} />
            {lang === 'en' ? 'Rent' : 'کرایہ'}
          </button>

          <button
            type="button"
            className={`hr-seg-btn ${isBuyActive ? 'active-buy' : ''}`}
            onClick={() => handleNavigate('/buy')}
          >
            <Tag size={15} />
            {lang === 'en' ? 'Buy' : 'خریدیں'}
          </button>

          <button
            type="button"
            className={`hr-seg-btn ${location.pathname === '/roommates' ? 'active' : ''}`}
            onClick={() => handleNavigate('/roommates')}
          >
            <Users size={15} />
            {lang === 'en' ? 'Roommates' : 'روم میٹس'}
          </button>

          <button
            type="button"
            className={`hr-seg-btn ${location.pathname === '/wanted' ? 'active' : ''}`}
            onClick={() => handleNavigate('/wanted')}
          >
            <Megaphone size={15} />
            {lang === 'en' ? 'Demands' : 'ڈیمانڈز'}
          </button>
        </nav>

        {/* 3. Desktop Right Actions */}
        <div className="hr-right-cluster">
          {currentUser && (
            <>
              <button
                type="button"
                className={`hr-ghost-btn ${location.pathname === '/dashboard' ? 'active' : ''}`}
                onClick={() => handleNavigate('/dashboard')}
              >
                <LayoutDashboard size={15} />
                {lang === 'en' ? 'Dashboard' : 'ڈیش بورڈ'}
              </button>

              <button
                type="button"
                className={`hr-ghost-btn ${location.pathname === '/offers' ? 'active' : ''}`}
                onClick={() => handleNavigate('/offers')}
              >
                <Handshake size={15} />
                {lang === 'en' ? 'Offers' : 'آفرز'}
              </button>

              {currentUser?.role === 'admin' && (
                <button
                  type="button"
                  className="hr-admin-btn"
                  onClick={() => handleNavigate('/admin')}
                >
                  <ShieldAlert size={14} color="#60a5fa" />
                  Admin
                </button>
              )}

              <span className="hr-divider" />

              <button
                type="button"
                className="hr-cta-btn"
                onClick={() => handleNavigate('/add-house')}
              >
                <Plus size={16} strokeWidth={2.6} />
                {lang === 'en' ? 'List / Sell' : 'پوسٹ کریں'}
              </button>

              <button
                type="button"
                className="hr-circle-btn"
                onClick={() => handleNavigate('/messages')}
                title={lang === 'en' ? 'Messages' : 'پیغامات'}
                aria-label="Messages"
              >
                <MessageCircle size={18} />
                {unreadMessages > 0 && <span className="hr-badge">{unreadMessages}</span>}
              </button>

              <div className="hr-notif-area" style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="hr-circle-btn"
                  onClick={() => setNotifOpen((prev) => !prev)}
                  title={lang === 'en' ? 'Notifications' : 'اطلاعات'}
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {unreadNotifs > 0 && <span className="hr-badge">{unreadNotifs}</span>}
                </button>
                {notifOpen && renderNotifDropdown()}
              </div>
            </>
          )}

          <button type="button" className="hr-lang-pill" onClick={toggleLanguage}>
            <Globe size={14} />
            {lang === 'en' ? 'اردو' : 'EN'}
          </button>

          {currentUser ? (
            <div className="hr-user-pill">
              <div
                className="hr-user-trigger"
                onClick={() => handleNavigate('/profile')}
                title={lang === 'en' ? 'View Profile' : 'پروفائل دیکھیں'}
              >
                <span className="hr-avatar">{userInitial}</span>
                <span className="hr-username">{currentUser.name}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="hr-logout-icon"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="hr-login-btn"
                onClick={() => handleNavigate('/login')}
              >
                <LogIn size={15} /> {lang === 'en' ? 'Log In' : 'لاگ ان'}
              </button>
              <button
                type="button"
                className="hr-cta-btn"
                onClick={() => handleNavigate('/register')}
              >
                <UserPlus size={15} /> {lang === 'en' ? 'Sign Up' : 'سائن اپ'}
              </button>
            </>
          )}
        </div>

        {/* 4. Mobile & Tablet Controls */}
        <div className="hr-mobile-controls">
          <button
            type="button"
            className="hr-lang-pill hr-lang-hide-xs"
            onClick={toggleLanguage}
            style={{ height: '36px', padding: '0 9px' }}
          >
            <Globe size={14} /> {lang === 'en' ? 'اردو' : 'EN'}
          </button>

          {currentUser && (
            <>
              <button
                type="button"
                className="hr-circle-btn"
                onClick={() => handleNavigate('/messages')}
                aria-label="Messages"
              >
                <MessageCircle size={18} />
                {unreadMessages > 0 && <span className="hr-badge">{unreadMessages}</span>}
              </button>

              <div className="hr-notif-area" style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="hr-circle-btn"
                  onClick={() => {
                    setNotifOpen((prev) => !prev);
                    setMobileMenuOpen(false);
                  }}
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {unreadNotifs > 0 && <span className="hr-badge">{unreadNotifs}</span>}
                </button>
                {notifOpen && renderNotifDropdown()}
              </div>
            </>
          )}

          <button
            type="button"
            className="hr-menu-toggle"
            onClick={() => {
              setMobileMenuOpen((prev) => !prev);
              setNotifOpen(false);
            }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* 5. Mobile & Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="hr-drawer">
          <div className="hr-drawer-section-title">
            {lang === 'en' ? 'Explore Marketplace' : 'پراپرٹی تلاش کریں'}
          </div>
          <div className="hr-drawer-grid">
            <button
              type="button"
              className={`hr-drawer-item ${isRentActive ? 'active' : ''}`}
              onClick={() => handleNavigate('/?purpose=rent')}
            >
              <Building2 size={17} />
              {lang === 'en' ? 'Rent Homes' : 'کرایہ کے گھر'}
            </button>

            <button
              type="button"
              className={`hr-drawer-item ${isBuyActive ? 'active-buy' : ''}`}
              onClick={() => handleNavigate('/buy')}
            >
              <Tag size={17} />
              {lang === 'en' ? 'Buy Property' : 'گھر خریدیں'}
            </button>

            <button
              type="button"
              className={`hr-drawer-item ${location.pathname === '/roommates' ? 'active' : ''}`}
              onClick={() => handleNavigate('/roommates')}
            >
              <Users size={17} />
              {lang === 'en' ? 'Roommates' : 'روم میٹس'}
            </button>

            <button
              type="button"
              className={`hr-drawer-item ${location.pathname === '/wanted' ? 'active' : ''}`}
              onClick={() => handleNavigate('/wanted')}
            >
              <Megaphone size={17} />
              {lang === 'en' ? 'Demands' : 'ڈیمانڈز'}
            </button>
          </div>

          {currentUser && (
            <>
              <div className="hr-drawer-section-title">
                {lang === 'en' ? 'My Workspace' : 'میرا اکاؤنٹ'}
              </div>

              <button
                type="button"
                className="hr-drawer-cta"
                onClick={() => handleNavigate('/add-house')}
              >
                <Plus size={18} strokeWidth={2.5} />
                {lang === 'en' ? 'List for Rent / Sell Property' : 'گھر کرایہ یا فروخت کے لیے لگائیں'}
              </button>

              <div className="hr-drawer-grid" style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  className={`hr-drawer-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
                  onClick={() => handleNavigate('/dashboard')}
                >
                  <LayoutDashboard size={17} />
                  {lang === 'en' ? 'Dashboard' : 'ڈیش بورڈ'}
                </button>

                <button
                  type="button"
                  className={`hr-drawer-item ${location.pathname === '/offers' ? 'active' : ''}`}
                  onClick={() => handleNavigate('/offers')}
                >
                  <Handshake size={17} />
                  {lang === 'en' ? 'Offers' : 'آفرز'}
                </button>

                <button
                  type="button"
                  className={`hr-drawer-item ${location.pathname === '/messages' ? 'active' : ''}`}
                  onClick={() => handleNavigate('/messages')}
                >
                  <MessageCircle size={17} />
                  {lang === 'en' ? 'Messages' : 'پیغامات'}
                  {unreadMessages > 0 && (
                    <span style={{ background: '#ef4444', color: '#fff', fontSize: '11px', padding: '1px 7px', borderRadius: '999px' }}>
                      {unreadMessages}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  className="hr-drawer-item"
                  onClick={toggleLanguage}
                >
                  <Globe size={17} />
                  {lang === 'en' ? 'اردو' : 'English'}
                </button>
              </div>

              {currentUser?.role === 'admin' && (
                <button
                  type="button"
                  className="hr-drawer-item"
                  onClick={() => handleNavigate('/admin')}
                  style={{ width: '100%', marginTop: '8px', background: '#0f172a', color: '#60a5fa', borderColor: '#1e293b' }}
                >
                  <ShieldAlert size={17} /> Admin Control Center
                </button>
              )}
            </>
          )}

          {!currentUser && (
            <button
              type="button"
              className="hr-drawer-item"
              onClick={toggleLanguage}
              style={{ width: '100%', marginTop: '12px' }}
            >
              <Globe size={17} />
              {lang === 'en' ? 'اردو میں تبدیل کریں' : 'Switch to English'}
            </button>
          )}

          {currentUser ? (
            <div className="hr-drawer-profile">
              <div
                onClick={() => handleNavigate('/profile')}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', minWidth: 0, flex: 1 }}
              >
                <span className="hr-avatar" style={{ width: '38px', height: '38px' }}>
                  {userInitial}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                    {currentUser.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', overflowWrap: 'anywhere' }}>
                    {currentUser.email}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  height: '36px',
                  padding: '0 12px',
                  borderRadius: '9px',
                  border: '1px solid #fecaca',
                  background: '#fef2f2',
                  color: '#dc2626',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <div className="hr-drawer-grid" style={{ marginTop: '12px' }}>
              <button
                type="button"
                className="hr-drawer-item"
                onClick={() => handleNavigate('/login')}
              >
                <LogIn size={16} /> {lang === 'en' ? 'Log In' : 'لاگ ان'}
              </button>
              <button
                type="button"
                className="hr-drawer-cta"
                style={{ marginTop: 0, height: '44px' }}
                onClick={() => handleNavigate('/register')}
              >
                <UserPlus size={16} /> {lang === 'en' ? 'Sign Up' : 'سائن اپ'}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;