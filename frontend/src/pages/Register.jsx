/* eslint-disable */
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '', role: 'landlord' });
  const { login, lang } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      
      // نیا اکاؤنٹ بنتے ہی پچھلا لاگ آؤٹ ہو کر نیا یوزر فوراً لاگ ان ہو جائے گا
      login(res.data.user, res.data.token);

      alert(lang === 'en' ? `Welcome ${res.data.user.name}! Account created & logged in 🎉` : `خوش آمدید ${res.data.user.name}! نیا اکاؤنٹ بن گیا ہے اور آپ لاگ ان ہو چکے ہیں 🎉`);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '480px', marginTop: '40px' }}>
      <div className="house-card" style={{ padding: '30px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{lang === 'en' ? 'Create Account' : 'نیا اکاؤنٹ بنائیں'}</h2>
        
        {/* Role Selection */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'landlord' })}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
              border: formData.role === 'landlord' ? '2.5px solid #2563eb' : '1px solid #cbd5e1',
              background: formData.role === 'landlord' ? '#eff6ff' : '#fff',
              color: formData.role === 'landlord' ? '#2563eb' : '#475569', fontWeight: 'bold'
            }}
          >
            🏠 {lang === 'en' ? 'Landlord' : 'مالک مکان'}
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'tenant' })}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
              border: formData.role === 'tenant' ? '2.5px solid #2563eb' : '1px solid #cbd5e1',
              background: formData.role === 'tenant' ? '#eff6ff' : '#fff',
              color: formData.role === 'tenant' ? '#2563eb' : '#475569', fontWeight: 'bold'
            }}
          >
            👤 {lang === 'en' ? 'Tenant' : 'کرایہ دار'}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text" placeholder={lang === 'en' ? 'Full Name' : 'پورا نام'} required
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
          <input
            type="text" placeholder={lang === 'en' ? 'Phone Number' : 'فون نمبر'} required
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
          <input
            type="email" placeholder={lang === 'en' ? 'Email Address' : 'ای میل ایڈریس'} required
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
          <input
            type="password" placeholder={lang === 'en' ? 'Password' : 'پاسورڈ'} required
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '18px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>
            {lang === 'en' ? 'Register' : 'رجسٹر کریں'}
          </button>
        </form>
        <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>
          {lang === 'en' ? 'Already have an account? ' : 'پہلے سے اکاؤنٹ ہے؟ '}
          <Link to="/login" style={{ color: '#2563eb', fontWeight: 'bold' }}>
            {lang === 'en' ? 'Log In' : 'لاگ ان کریں'}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;