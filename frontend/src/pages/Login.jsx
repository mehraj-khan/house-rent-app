import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, lang } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      login(res.data.user, res.data.token);
      alert(lang === 'en' ? 'Login successful! 🎉' : 'لاگ ان کامیاب رہا! 🎉');
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '450px', marginTop: '60px' }}>
      <div className="house-card" style={{ padding: '30px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{lang === 'en' ? 'Log In' : 'لاگ ان کریں'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder={lang === 'en' ? 'Email Address' : 'ای میل ایڈریس'}
            required
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
          <input
            type="password"
            placeholder={lang === 'en' ? 'Password' : 'پاسورڈ'}
            required
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>
            {lang === 'en' ? 'Log In' : 'لاگ ان'}
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