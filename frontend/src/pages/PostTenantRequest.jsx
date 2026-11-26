/* eslint-disable */
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Send, ArrowLeft, Sparkles, Building2, Tag } from 'lucide-react';

const API_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://house-rent-app-ten.vercel.app';

const formatPKR = (amount) => {
  const num = Number(amount) || 0;
  if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Crore`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)} Lac`;
  return num.toLocaleString();
};

const PostTenantRequest = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    purpose: 'rent', // 'rent' | 'sale'
    propertyType: 'house', // 'house' | 'flat' | 'portion' | 'plot' | 'commercial'
    areaSize: '',
    areaUnit: 'Marla',
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

  const isBuy = formData.purpose === 'sale';
  const isPlotOrCommercial =
    formData.propertyType === 'plot' || formData.propertyType === 'commercial';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please log in first to post your requirement!');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/tenant-requests/create`, {
        ...formData,
        bedrooms: isPlotOrCommercial ? 0 : Number(formData.bedrooms) || 2,
        familyMembers: isBuy ? 1 : Number(formData.familyMembers) || 1,
        tenantType: isBuy ? 'family' : formData.tenantType,
        moveInDate: formData.moveInDate || todayStr,
        tenantId: currentUser.id || currentUser._id,
      });

      alert(
        isBuy
          ? 'Buyer requirement posted! Property owners will now send you matching offers 🏷️📢'
          : 'Requirement posted successfully! Landlords will now send offers to your demand 📢🎉'
      );
      navigate('/wanted');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '650px', marginTop: '30px', marginBottom: '70px' }}>
      <button
        onClick={() => navigate(-1)}
        className="btn-outline"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '18px' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="house-card" style={{ padding: '30px' }}>
        <div
          style={{
            background: isBuy
              ? 'linear-gradient(135deg, #064e3b, #065f46)'
              : 'linear-gradient(135deg, #0f172a, #1e3a8a)',
            color: '#fff',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles color="#eab308" />
            {isBuy ? 'Post What You Want to Buy (خریداری ڈیمانڈ)' : 'Post What You Need (مجھے کرایہ پر گھر چاہیے)'}
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '13px', opacity: 0.9 }}>
            Stop searching and calling dealers. Post your exact budget and location, and verified owners will send offers directly to you!
          </p>
        </div>

        {/* 🏢🏷️ Purpose Switcher: Need to Rent vs Want to Buy */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, purpose: 'rent', budgetMin: '', budgetMax: '' }))}
            style={{
              padding: '11px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              border: !isBuy ? '2px solid #2563eb' : '1px solid #cbd5e1',
              background: !isBuy ? '#eff6ff' : '#fff',
              color: !isBuy ? '#1d4ed8' : '#475569',
            }}
          >
            <Building2 size={16} /> Need to Rent (کرایہ)
          </button>

          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, purpose: 'sale', budgetMin: '', budgetMax: '' }))}
            style={{
              padding: '11px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              border: isBuy ? '2px solid #047857' : '1px solid #cbd5e1',
              background: isBuy ? '#ecfdf5' : '#fff',
              color: isBuy ? '#047857' : '#475569',
            }}
          >
            <Tag size={16} /> Want to Buy (خریداری)
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Property Type (Buy موڈ میں یا دونوں میں مددگار) */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>
              Property Type (کس قسم کی پراپرٹی چاہیے؟):
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { key: 'house', label: '🏡 House' },
                { key: 'flat', label: '🏢 Flat / Apt' },
                { key: 'portion', label: '🚪 Portion' },
                ...(isBuy ? [{ key: 'plot', label: '📐 Plot / Land' }] : []),
                { key: 'commercial', label: '🏪 Commercial' },
              ].map((pt) => {
                const active = formData.propertyType === pt.key;
                return (
                  <button
                    key={pt.key}
                    type="button"
                    onClick={() => setFormData({ ...formData, propertyType: pt.key })}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '700',
                      border: active ? '2px solid #0f172a' : '1px solid #cbd5e1',
                      background: active ? '#0f172a' : '#fff',
                      color: active ? '#fff' : '#475569',
                    }}
                  >
                    {pt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>City (شہر):</label>
              <input
                type="text"
                required
                placeholder="e.g. Lahore, Islamabad"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Area / Society (علاقہ):</label>
              <input
                type="text"
                required
                placeholder="e.g. Bahria Town, DHA, Gulberg"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          {/* Buy موڈ کے لیے Area Size (Marla / Kanal) */}
          {isBuy && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Required Size (رقبہ):</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5, 10, 1"
                  value={formData.areaSize}
                  onChange={(e) => setFormData({ ...formData, areaSize: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Unit:</label>
                <select
                  value={formData.areaUnit}
                  onChange={(e) => setFormData({ ...formData, areaUnit: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}
                >
                  <option value="Marla">Marla</option>
                  <option value="Kanal">Kanal</option>
                  <option value="Sq. Ft">Sq. Ft</option>
                  <option value="Sq. Yds">Sq. Yds (Gaz)</option>
                </select>
              </div>
            </div>
          )}

          {/* Budget Range */}
          <div style={{ background: isBuy ? '#ecfdf5' : '#f8fafc', padding: '15px', borderRadius: '8px', border: isBuy ? '1px solid #a7f3d0' : '1px solid #e2e8f0' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: isBuy ? '#065f46' : '#1e293b', display: 'block', marginBottom: '6px' }}>
              {isBuy
                ? 'Your Buying Budget Range in PKR (خریداری بجٹ کی رینج):'
                : 'Your Monthly Rent Budget Range (ماہانہ کرایہ بجٹ کی رینج):'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <input
                  type="number"
                  required
                  placeholder={isBuy ? 'Min (e.g. 15000000)' : 'Min (e.g. 30000)'}
                  value={formData.budgetMin}
                  onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
                {isBuy && Number(formData.budgetMin) > 0 && (
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#047857' }}>
                    {formatPKR(formData.budgetMin)}
                  </span>
                )}
              </div>
              <div>
                <input
                  type="number"
                  required
                  placeholder={isBuy ? 'Max (e.g. 25000000)' : 'Max (e.g. 40000)'}
                  value={formData.budgetMax}
                  onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
                {isBuy && Number(formData.budgetMax) > 0 && (
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#047857' }}>
                    {formatPKR(formData.budgetMax)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bedrooms & Preference */}
          {!isPlotOrCommercial && (
            <div style={{ display: 'grid', gridTemplateColumns: isBuy ? '1fr' : '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Required Bedrooms (کمرے):</label>
                <select
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="1">1 Bedroom / Room</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3 Bedrooms</option>
                  <option value="4">4+ Bedrooms</option>
                </select>
              </div>

              {!isBuy && (
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Family or Bachelors?</label>
                  <select
                    value={formData.tenantType}
                    onChange={(e) => setFormData({ ...formData, tenantType: e.target.value })}
                    style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="family">👨‍👩‍👧‍👦 Family</option>
                    <option value="bachelors">👤 Bachelors / Students</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {!isBuy ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Total Members (کتنے افراد ہیں):</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.familyMembers}
                  onChange={(e) => setFormData({ ...formData, familyMembers: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Target Shift Date (کب شفٹ ہونا ہے):</label>
                <input
                  type="date"
                  min={todayStr}
                  required
                  value={formData.moveInDate}
                  onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>
          ) : (
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>
                Target Purchase / Deal Timeline (کب تک خریدنا چاہتے ہیں):
              </label>
              <input
                type="date"
                min={todayStr}
                value={formData.moveInDate}
                onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>
              Special Requirements (خاص ضروریات):
            </label>
            <textarea
              rows="3"
              placeholder={
                isBuy
                  ? 'e.g. Cash ready, corner plot or brand new house with registry/intiqal in Bahria Town...'
                  : 'e.g. Need ground portion with car parking and solar/gas preference in Bahria Town...'
              }
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: isBuy ? '#047857' : undefined,
              borderColor: isBuy ? '#047857' : undefined,
            }}
          >
            <Send size={18} />
            {loading
              ? 'Posting...'
              : isBuy
              ? 'Post Buying Demand (مجھے پراپرٹی خریدنی ہے)'
              : 'Post Rent Requirement (مجھے گھر چاہیے)'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostTenantRequest;