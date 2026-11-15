/* eslint-disable */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Shield, Save, ArrowLeft, Edit3, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { currentUser, lang } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div style={{ maxWidth: '500px', margin: '60px auto', padding: '30px', textAlign: 'center', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
        <h2>{lang === 'en' ? 'Please Log In' : 'براہ کرم لاگ ان کریں'}</h2>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>
          {lang === 'en' ? 'You need to log in to view your account.' : 'اپنا اکاؤنٹ دیکھنے کے لیے لاگ ان کرنا ضروری ہے۔'}
        </p>
        <button className="btn-primary" onClick={() => navigate('/login')}>
          {lang === 'en' ? 'Go to Login' : 'لاگ ان پر جائیں'}
        </button>
      </div>
    );
  }

  const getRoleLabel = () => {
    if (currentUser.role === 'admin') return '👑 Super Admin';
    if (currentUser.role === 'landlord') return lang === 'en' ? 'Landlord' : 'مالک مکان';
    return lang === 'en' ? 'Tenant' : 'کرایہ دار';
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Backend API jorne ke baad yahan database mein save hoga
    setMessage(lang === 'en' ? 'Profile form ready! Connect backend API to save permanently.' : 'پروفائل فارم تیار ہے! مستقل محفوظ کرنے کے لیے بیک اینڈ API جوڑیں۔');
    setIsEditing(false);
  };

  return (
    <div style={{ maxWidth: '650px', margin: '40px auto', padding: '20px' }}>
      <button
        className="btn-outline"
        onClick={() => navigate(-1)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}
      >
        <ArrowLeft size={16} />
        {lang === 'en' ? 'Back' : 'واپس جائیں'}
      </button>

      <div style={{ background: '#ffffff', borderRadius: '14px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <User size={28} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', color: '#0f172a' }}>{currentUser.name}</h2>
              <span style={{ fontSize: '13px', color: '#3b82f6', fontWeight: '600' }}>{getRoleLabel()}</span>
            </div>
          </div>

          {!isEditing && (
            <button
              className="btn-primary"
              onClick={() => { setIsEditing(true); setMessage(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Edit3 size={16} />
              {lang === 'en' ? 'Edit Profile' : 'پروفائل ایڈٹ کریں'}
            </button>
          )}
        </div>

        {message && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', color: '#065f46', padding: '12px 14px', borderRadius: '8px', marginBottom: '18px', fontSize: '14px' }}>
            <CheckCircle size={18} />
            <span>{message}</span>
          </div>
        )}

        {!isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
              <User size={18} color="#64748b" />
              <div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{lang === 'en' ? 'Full Name' : 'پورا نام'}</div>
                <div style={{ fontWeight: '600', color: '#0f172a' }}>{currentUser.name}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
              <Mail size={18} color="#64748b" />
              <div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{lang === 'en' ? 'Email Address' : 'ای میل'}</div>
                <div style={{ fontWeight: '600', color: '#0f172a' }}>{currentUser.email || '—'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
              <Phone size={18} color="#64748b" />
              <div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{lang === 'en' ? 'Phone Number' : 'فون نمبر'}</div>
                <div style={{ fontWeight: '600', color: '#0f172a' }}>{currentUser.phone || (lang === 'en' ? 'Not added yet' : 'ابھی شامل نہیں کیا')}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
              <Shield size={18} color="#64748b" />
              <div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{lang === 'en' ? 'Account Role' : 'اکاؤنٹ کی قسم'}</div>
                <div style={{ fontWeight: '600', color: '#0f172a' }}>{getRoleLabel()}</div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                {lang === 'en' ? 'Full Name' : 'پورا نام'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                {lang === 'en' ? 'Email (Cannot be changed)' : 'ای میل (تبدیل نہیں ہو سکتی)'}
              </label>
              <input
                type="email"
                value={currentUser.email || ''}
                disabled
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#64748b', fontSize: '15px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                {lang === 'en' ? 'Phone Number' : 'فون نمبر'}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03XX-XXXXXXX"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Save size={16} />
                {lang === 'en' ? 'Save Changes' : 'تبدیلیاں محفوظ کریں'}
              </button>
              <button type="button" className="btn-outline" onClick={() => setIsEditing(false)}>
                {lang === 'en' ? 'Cancel' : 'منسوخ کریں'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;