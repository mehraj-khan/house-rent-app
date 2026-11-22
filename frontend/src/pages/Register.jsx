/* eslint-disable */
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, KeyRound, ArrowRight, CheckCircle2, Loader2, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { login, lang } = useAuth();
  const navigate = useNavigate();

  // 1: فارم ڈیٹا | 2: OTP تصدیق مرحلہ
  const [step, setStep] = useState(1); // 1 = فارم | 2 = OTP درج کریں
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    otp: '',
  });

  // مرحلہ 1: 6 ہندسوں کا کوڈ بھیجنا
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('https://house-rent-app-ten.vercel.app/api/auth/send-otp', {
     email: formData.email,
      });

      alert(`Verification code sent to ${formData.email}! Please check your Inbox / Spam folder 📩`);
      setStep(2); // OTP باکس کھولیں
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // مرحلہ 2: کوڈ کی تصدیق اور اکاؤنٹ بنانا
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('https://house-rent-app-ten.vercel.app/api/auth/verify-otp', formData);

      login(res.data.user, res.data.token);
      alert(`Email verified! Welcome to HouseRent PK, ${res.data.user.name} 🎉`);
      navigate('/');
    } catch (err) {
      alert('Verification Failed: ' + (err.response?.data?.message || 'Invalid OTP code'));
    } finally {
      setLoading(false);
    }
  };

  // گوگل 1-Click سائن اپ
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('https://house-rent-app-ten.vercel.app/api/auth/google', {
        credential: credentialResponse.credential,
      });

      login(res.data.user, res.data.token);
      alert(`Welcome ${res.data.user.name}! Account created & verified via Google 🎉`);
      navigate('/');
    } catch (err) {
      alert('Google Error: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="container" style={{ maxWidth: '460px', marginTop: '45px' }}>
      <div className="house-card" style={{ padding: '30px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '6px' }}>
          {step === 1 ? 'Create Verified Account' : 'Verify Your Email'}
        </h2>
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
          {step === 1
            ? 'Real email verification system to stop fake accounts.'
            : `Enter the 6-digit code sent to ${formData.email}`}
        </p>

        {/* 🌟 گوگل سائن اپ (صرف پہلے مرحلے پر دکھے گا) */}
        {step === 1 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => alert('Google Sign-Up failed')}
                useOneTap
                shape="pill"
                text="signup_with"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>OR SIGN UP WITH EMAIL</span>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
            </div>
          </>
        )}

        {/* ========================================================
           حالت 1: فارم بھرنا
           ======================================================== */}
        {step === 1 ? (
          <form onSubmit={handleSendOTP}>
            <input
              type="text" placeholder="Full Name" required
              value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
            <input
              type="text" placeholder="Phone Number (e.g. 03001234567)" required
              value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
            <input
              type="email" placeholder="Real Email Address" required
              value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
            <input
              type="password" placeholder="Create Password" required
              value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{ width: '100%', padding: '10px', marginBottom: '18px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {loading ? <><Loader2 size={16} className="spin" /> Sending Verification Code...</> : <><Mail size={16} /> Send 6-Digit Code 📩</>}
            </button>
          </form>
        ) : (
          /* ========================================================
             حالت 2: 6 ہندسوں کا کوڈ درج کرنا
             ======================================================== */
          <form onSubmit={handleVerifyAndRegister}>
            <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '8px', border: '1px solid #bfdbfe', textAlign: 'center', marginBottom: '18px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e40af', display: 'block', marginBottom: '8px' }}>
                Enter 6-Digit Code (میسج میں آنے والا کوڈ لکھیں):
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="482910"
                required
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                style={{ width: '100%', maxWidth: '200px', padding: '12px', textAlign: 'center', fontSize: '24px', letterSpacing: '6px', fontWeight: 'bold', borderRadius: '8px', border: '2px solid #2563eb', outline: 'none' }}
              />
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>
                Check Spam folder if you don't see it in your Inbox.
              </p>
            </div>

            <button type="submit" className="btn-primary" disabled={loading || formData.otp.length < 6} style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {loading ? <><Loader2 size={16} className="spin" /> Verifying Code...</> : <><CheckCircle2 size={16} /> Verify & Complete Registration ✅</>}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              style={{ width: '100%', marginTop: '10px', background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
            >
              ← Change Email or Details
            </button>
          </form>
        )}

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563eb', fontWeight: 'bold' }}>
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;