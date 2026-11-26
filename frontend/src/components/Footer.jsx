import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  MessageCircle,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// 👇 یہاں اپنا اصلی واٹس ایپ نمبر، ای میل، شہر اور سوشل میڈیا لنکس لکھیں
const SUPPORT_INFO = {
  brandEn: 'HouseRent PK',
  brandUr: 'ہاؤس رینٹ پاکستان',
  whatsappNumber: '923001234567', // 92 کے ساتھ بغیر + کے لکھیں
  displayPhone: '0300-1234567',
  email: 'support@houserentpk.com',
  cityEn: 'Lahore, Pakistan (Serving Nationwide)',
  cityUr: 'لاہور، پاکستان (پاکستان بھر میں سروس)',
  facebookUrl: 'https://facebook.com',
  tiktokUrl: 'https://tiktok.com',
  instagramUrl: 'https://instagram.com',
};

const Footer = () => {
  const { lang } = useAuth();
  const location = useLocation();

  // چیٹ اور ایڈمن پینل پر فوٹر نہ دکھائیں
  if (location.pathname === '/messages' || location.pathname === '/admin') {
    return null;
  }

  const whatsappHelpUrl = `https://wa.me/${SUPPORT_INFO.whatsappNumber}?text=${encodeURIComponent(
    'Assalam-o-Alaikum! I need help regarding HouseRent PK.'
  )}`;

  return (
    <footer className="hr-footer-root">
      <style>{`
        .hr-footer-root {
          background: #0f172a;
          color: #cbd5e1;
          border-top: 1px solid #1e293b;
          margin-top: 40px;
          width: 100%;
          box-sizing: border-box;
        }
        .hr-footer-root *, .hr-footer-root *::before, .hr-footer-root *::after {
          box-sizing: border-box;
        }
        .hr-trust-strip {
          background: #1e293b;
          border-bottom: 1px solid #334155;
          padding: 16px 20px;
        }
        .hr-trust-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 12px;
        }
        .hr-trust-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 600;
          color: #f8fafc;
        }
        .hr-footer-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 38px 20px 26px;
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
          gap: 28px;
        }
        .hr-footer-col h4 {
          color: #ffffff;
          font-size: 14.5px;
          font-weight: 700;
          margin: 0 0 14px;
        }
        .hr-footer-links {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }
        .hr-footer-links a {
          color: #94a3b8;
          text-decoration: none;
          font-size: 13.5px;
          transition: color 0.15s ease;
        }
        .hr-footer-links a:hover {
          color: #ffffff;
        }
        .hr-safety-box {
          margin-top: 12px;
          padding: 11px 12px;
          border-radius: 10px;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.35);
          font-size: 12px;
          color: #fde68a;
          line-height: 1.5;
        }
        .hr-footer-bottom {
          border-top: 1px solid #1e293b;
          padding: 16px 20px 84px;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 12.5px;
          color: #64748b;
        }
        .hr-wa-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 12px;
          padding: 9px 14px;
          border-radius: 9px;
          background: #16a34a;
          color: #ffffff;
          font-weight: 700;
          font-size: 13px;
          text-decoration: none;
        }
        .hr-wa-btn:hover {
          background: #15803d;
        }
        .hr-social-row {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          flex-wrap: wrap;
        }
        .hr-social-pill {
          padding: 5px 10px;
          border-radius: 7px;
          background: #1e293b;
          color: #cbd5e1;
          font-size: 11.5px;
          font-weight: 600;
          text-decoration: none;
          border: 1px solid #334155;
        }
        .hr-social-pill:hover {
          background: #334155;
          color: #fff;
        }

        @media (max-width: 900px) {
          .hr-footer-main {
            grid-template-columns: 1fr 1fr;
            gap: 24px;
          }
        }
        @media (max-width: 560px) {
          .hr-footer-main {
            grid-template-columns: 1fr;
            padding: 28px 16px 20px;
          }
          .hr-footer-bottom {
            flex-direction: column;
            text-align: center;
            padding: 16px 16px 88px;
          }
        }
      `}</style>

      {/* 1. Trust & Value Strip */}
      <div className="hr-trust-strip">
        <div className="hr-trust-inner">
          <div className="hr-trust-item">
            <ShieldCheck size={18} color="#4ade80" />
            <span>{lang === 'en' ? '0% Dealer Commission' : 'بغیر ڈیلر کمیشن براہِ راست ڈیل'}</span>
          </div>
          <div className="hr-trust-item">
            <CheckCircle size={18} color="#60a5fa" />
            <span>{lang === 'en' ? 'Direct Owner Contact' : 'مالک مکان سے براہِ راست رابطہ'}</span>
          </div>
          <div className="hr-trust-item">
            <MessageCircle size={18} color="#fde047" />
            <span>{lang === 'en' ? 'Live Chat & Video Tours' : 'لائیو چیٹ اور ویڈیو ٹور'}</span>
          </div>
          <div className="hr-trust-item">
            <Phone size={18} color="#34d399" />
            <span>{lang === 'en' ? 'Active Support Team' : 'پاکستان بھر میں ہیلپ لائن سپورٹ'}</span>
          </div>
        </div>
      </div>

      {/* 2. Main Columns */}
      <div className="hr-footer-main">
        {/* Column 1: Brand & Support */}
        <div className="hr-footer-col">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span
              style={{
                display: 'inline-flex',
                padding: '6px',
                borderRadius: '8px',
                background: '#2563eb',
                color: '#fff',
              }}
            >
              <Home size={18} />
            </span>
            <b style={{ fontSize: '18px', color: '#ffffff' }}>
              {lang === 'en' ? SUPPORT_INFO.brandEn : SUPPORT_INFO.brandUr}
            </b>
          </div>

          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>
            {lang === 'en'
              ? "Pakistan's transparent marketplace to Rent, Buy & Sell verified properties directly with owners."
              : 'پاکستان کا بااعتماد پلیٹ فارم جہاں آپ بغیر اضافی کمیشن کے گھر کرایہ پر لے، خرید یا بیچ سکتے ہیں۔'}
          </p>

          <a href={whatsappHelpUrl} target="_blank" rel="noopener noreferrer" className="hr-wa-btn">
            <MessageCircle size={16} />
            {lang === 'en' ? 'WhatsApp Support' : 'واٹس ایپ سپورٹ'}
          </a>

          <div className="hr-social-row">
            <a href={SUPPORT_INFO.facebookUrl} target="_blank" rel="noopener noreferrer" className="hr-social-pill">
              Facebook
            </a>
            <a href={SUPPORT_INFO.tiktokUrl} target="_blank" rel="noopener noreferrer" className="hr-social-pill">
              TikTok
            </a>
            <a href={SUPPORT_INFO.instagramUrl} target="_blank" rel="noopener noreferrer" className="hr-social-pill">
              Instagram
            </a>
          </div>
        </div>

        {/* Column 2: Explore */}
        <div className="hr-footer-col">
          <h4>{lang === 'en' ? 'Explore Properties' : 'پراپرٹی تلاش کریں'}</h4>
          <div className="hr-footer-links">
            <Link to="/?purpose=rent">{lang === 'en' ? 'Homes for Rent' : 'کرایہ کے گھر'}</Link>
            <Link to="/buy">{lang === 'en' ? 'Buy Homes & Plots' : 'گھر اور پلاٹ خریدیں'}</Link>
            <Link to="/roommates">{lang === 'en' ? 'Roommates Finder' : 'روم میٹس تلاش کریں'}</Link>
            <Link to="/wanted">{lang === 'en' ? 'Property Demands' : 'خریدار و کرایہ دار ڈیمانڈز'}</Link>
            <Link to="/advertise">{lang === 'en' ? 'Advertise With Us' : 'اپنا اشتہار لگوائیں'}</Link>
          </div>
        </div>

        {/* Column 3: Account & Tools */}
        <div className="hr-footer-col">
          <h4>{lang === 'en' ? 'Tools & Account' : 'ٹولز اور اکاؤنٹ'}</h4>
          <div className="hr-footer-links">
            <Link to="/add-house">{lang === 'en' ? 'List / Sell Property' : 'گھر لگائیں / بیچیں'}</Link>
            <Link to="/post-request">{lang === 'en' ? 'Post Your Demand' : 'اپنی ڈیمانڈ پوسٹ کریں'}</Link>
            <Link to="/dashboard">{lang === 'en' ? 'My Dashboard' : 'میرا ڈیش بورڈ'}</Link>
            <Link to="/offers">{lang === 'en' ? 'Rent & Buy Offers' : 'آفرز دیکھیں'}</Link>
            <Link to="/bill-calculator">{lang === 'en' ? 'WAPDA Bill Splitter' : 'بجلی بل کیلکولیٹر'}</Link>
          </div>
        </div>

        {/* Column 4: Contact & Safety Notice */}
        <div className="hr-footer-col">
          <h4>{lang === 'en' ? 'Contact & Safety' : 'رابطہ اور حفاظتی ہدایات'}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#94a3b8' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
              <Phone size={14} color="#60a5fa" /> {SUPPORT_INFO.displayPhone}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', overflowWrap: 'anywhere' }}>
              <Mail size={14} color="#60a5fa" /> {SUPPORT_INFO.email}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
              <MapPin size={14} color="#60a5fa" /> {lang === 'en' ? SUPPORT_INFO.cityEn : SUPPORT_INFO.cityUr}
            </span>
          </div>

          <div className="hr-safety-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', marginBottom: '3px' }}>
              <AlertTriangle size={14} />
              {lang === 'en' ? 'Safety Tip:' : 'حفاظتی مشورہ:'}
            </div>
            {lang === 'en'
              ? 'Always visit the property in person and verify ownership documents before paying any cash.'
              : 'کسی بھی رقم کی ادائیگی سے پہلے خود جا کر گھر کا معائنہ اور کاغذات کی تصدیق ضرور کریں۔'}
          </div>
        </div>
      </div>

      {/* 3. Copyright */}
      <div className="hr-footer-bottom">
        <span>
          © {new Date().getFullYear()} {SUPPORT_INFO.brandEn}. All rights reserved.
        </span>
        <span>
          {lang === 'en' ? 'Built for Transparent Real Estate in Pakistan 🇵🇰' : 'پاکستان میں شفاف پراپرٹی کے لیے 🇵🇰'}
        </span>
      </div>
    </footer>
  );
};

export default Footer;