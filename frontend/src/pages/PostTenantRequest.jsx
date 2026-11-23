/* eslint-disable */
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Send, ArrowLeft, Building2, MapPin, DollarSign, Users, Calendar, Sparkles } from 'lucide-react';

const PostTenantRequest = () => {
  const { currentUser, lang } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    city: '',
    area: '',
    budgetMin: '',
    budgetMax: '',
    bedrooms: 2,
    tenantType: 'family',
    familyMembers: 3,
    moveInDate: '',
    description: '',
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please log in first to post your requirement!');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await axios.post('https://house-rent-app-ten.vercel.app/api/tenant-requests/create', {
        ...formData,
        tenantId: currentUser.id || currentUser._id,
      });

      alert('Requirement posted successfully! Landlords will now send offers to your demand 📢🎉');
      navigate('/wanted');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '650px', marginTop: '30px' }}>
      <button onClick={() => navigate(-1)} className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '18px' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="house-card" style={{ padding: '30px' }}>
        <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', color: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '22px' }}>
          <h2 style={{ margin: 0, fontSize: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles color="#eab308" /> Post What You Need (مجھے گھر چاہیے)
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '13px', opacity: 0.9 }}>
            Stop searching and calling dealers. Post your exact budget and location, and verified landlords will send offers directly to you!
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>City (شہر):</label>
              <input
                type="text" required placeholder="e.g. Lahore, Islamabad"
                value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Area / Society (علاقہ / محلہ):</label>
              <input
                type="text" required placeholder="e.g. Bahria Town, DHA, Gulberg"
                value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '6px' }}>
              Your Monthly Rent Budget Range (بجٹ کی رینج):
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input
                type="number" required placeholder="Min Budget (e.g. 30000)"
                value={formData.budgetMin} onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
              <input
                type="number" required placeholder="Max Budget (e.g. 40000)"
                value={formData.budgetMax} onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Required Bedrooms (کمرے):</label>
              <select
                value={formData.bedrooms} onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="1">1 Bedroom / Room</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Family or Bachelors?</label>
              <select
                value={formData.tenantType} onChange={(e) => setFormData({ ...formData, tenantType: e.target.value })}
                style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="family">👨‍👩‍👧‍👦 Family</option>
                <option value="bachelors">👤 Bachelors / Students</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Total Members (کتنے افراد ہیں):</label>
              <input
                type="number" min="1" required
                value={formData.familyMembers} onChange={(e) => setFormData({ ...formData, familyMembers: e.target.value })}
                style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Target Shift Date (کب شفٹ ہونا ہے):</label>
              <input
                type="date" min={todayStr} required
                value={formData.moveInDate} onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>
              Special Requirements (خاص ضروریات مثلاً گیس، سولر، پارکنگ):
            </label>
            <textarea
              rows="3"
              placeholder="e.g. Need ground portion with car parking and solar/gas preference in Bahria Town..."
              value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            ></textarea>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Send size={18} /> {loading ? 'Posting...' : 'Post Requirement (مجھے گھر چاہیے)'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostTenantRequest;