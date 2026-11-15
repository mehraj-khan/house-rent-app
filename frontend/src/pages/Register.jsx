/* eslint-disable */
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '', role: 'user' });
  const { login, lang } = useAuth();
  const navigate = useNavigate();

  // عام سائن اپ
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://house-rent-app-ten.vercel.app/api/auth/register', {
        ...formData,
        role: 'user' // اب ہر کوئی فل ایکسس یوزر ہوگا
      });
      
      login(res.data.user, res.data.token);
      alert(lang === 'en' ? `Welcome ${res.data.user.name}! Account created 🎉` : `خوش آمدید ${res.data.user.name}! اکاؤنٹ بن گیا ہے 🎉`);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  // 🔴 1-Click گوگل سائن اپ
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('https://house-rent-app-ten.vercel.app/api/auth/google', {
        credential: credentialResponse.credential,
      });

      login(res.data.user, res.data.token);
      alert(`Welcome ${res.data.user.name}! Account created & logged in via Google 🎉`);
      navigate('/');
    } catch (err) {
      console.error('Google Auth Error:', err);
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="container" style={{ maxWidth: '460px', marginTop: '50px' }}>
      <div className="house-card" style={{ padding: '30px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>
          {lang === 'en' ? 'Create Your Account' : 'نیا اکاؤنٹ بنائیں'}
        </h2>
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
          {lang === 'en' ? 'One account to book stays and rent out your properties.' : 'ایک ہی اکاؤنٹ سے مکان بک بھی کریں اور کرائے پر بھی دیں۔'}
        </p>

        {/* 🌟 1-Click گوگل سائن اپ بٹن */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert('Google Sign-Up was unsuccessful.')}
            useOneTap
            shape="pill"
            text="signup_with"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold' }}>OR SIGN UP WITH EMAIL</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text" placeholder={lang === 'en' ? 'Full Name' : 'پورا نام'} required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
          <input
            type="text" placeholder={lang === 'en' ? 'Phone Number (e.g. 03001234567)' : 'فون نمبر'} required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
          <input
            type="email" placeholder={lang === 'en' ? 'Email Address' : 'ای میل ایڈریس'} required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
          <input
            type="password" placeholder={lang === 'en' ? 'Password' : 'پاسورڈ'} required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '18px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>
            {lang === 'en' ? 'Create Free Account' : 'مفت اکاؤنٹ بنائیں'}
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