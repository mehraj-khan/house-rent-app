/* eslint-disable */
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://house-rent-app-ten.vercel.app';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, lang } = useAuth();
  const navigate = useNavigate();

  // عام لاگ ان ہینڈلر
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, formData);
      login(res.data.user, res.data.token);
      alert(lang === 'en' ? 'Login successful! 🎉' : 'لاگ ان کامیاب رہا! 🎉');
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // گوگل 1-Click لاگ ان ہینڈلر
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/google`, {
        credential: credentialResponse.credential,
      });

      login(res.data.user, res.data.token);
      alert(`Welcome ${res.data.user.name}! Google Login Successful 🎉`);
      navigate('/');
    } catch (err) {
      console.error('Google Auth Error:', err);
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="container" style={{ maxWidth: '450px', marginTop: '60px' }}>
      <div className="house-card" style={{ padding: '30px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
          {lang === 'en' ? 'Log In to HouseRent' : 'لاگ ان کریں'}
        </h2>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert('Google Sign-In was unsuccessful.')}
            useOneTap
            shape="pill"
            text="continue_with"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold' }}>OR WITH EMAIL</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder={lang === 'en' ? 'Email Address' : 'ای میل ایڈریس'}
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />

          <div style={{ position: 'relative', marginBottom: '8px' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={lang === 'en' ? 'Password' : 'پاسورڈ'}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{ width: '100%', padding: '12px 40px 12px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* 🔑 Forgot Password Link */}
          <div style={{ textAlign: 'end', marginBottom: '18px' }}>
            <Link to="/forgot-password" style={{ color: '#2563eb', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>
              {lang === 'en' ? 'Forgot Password?' : 'پاسورڈ بھول گئے؟'}
            </Link>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '12px' }}>
            {loading ? 'Logging in...' : (lang === 'en' ? 'Log In' : 'لاگ ان')}
          </button>
        </form>

        <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>
          {lang === 'en' ? "Don't have an account? " : 'اکاؤنٹ نہیں ہے؟ '}
          <Link to="/register" style={{ color: '#2563eb', fontWeight: 'bold' }}>
            {lang === 'en' ? 'Sign Up' : 'سائن اپ کریں'}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;