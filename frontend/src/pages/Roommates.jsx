/* eslint-disable */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Users, Plus, Search, MapPin, Wallet, Trash2, Calendar,
  Briefcase, X, MessageCircle, Image as ImageIcon, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ChatModal from '../components/ChatModal.jsx';
import { uploadToCloudinary } from '../utils/uploadCloudinary';
import { getLiveLocation } from '../utils/getLiveLocation';

const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://house-rent-app-ten.vercel.app';

const Roommates = () => {
  const { currentUser, lang } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [locating, setLocating] = useState(false);
  const [activeChatPost, setActiveChatPost] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    type: 'need_room',
    city: '',
    area: '',
    maxBudget: '',
    gender: 'boys',
    occupation: '',
    phone: currentUser?.phone || '',
    moveInDate: '',
    images: [],
    description: '',
  });

  const currentUserId = currentUser?.id || currentUser?._id;

  const fetchPosts = async () => {
    try {
      let url = `${API_URL}/api/requirements?search=${search}&type=${typeFilter}&gender=${genderFilter}`;
      const res = await axios.get(url);
      setPosts(res.data || []);
    } catch (err) {
      console.error('Error loading roommate posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [search, typeFilter, genderFilter]);

  const handleLiveLocation = async () => {
    setLocating(true);
    try {
      const { city, area } = await getLiveLocation();
      setFormData((prev) => ({
        ...prev,
        city: city || prev.city,
        area: area || prev.area,
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setLocating(false);
    }
  };

  const handleMultipleImages = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadProgress(10);
    try {
      const uploadedUrls = [];
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
        const url = await uploadToCloudinary(files[i], 'image');
        uploadedUrls.push(url);
      }
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
    } catch (err) {
      alert('Image Upload Error: ' + err.message);
    } finally {
      setUploadProgress(null);
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please log in first to post your requirement!');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/requirements/add`, {
        ...formData,
        images: formData.type === 'need_roommate' ? formData.images : [],
        user: currentUserId,
      });

      alert(lang === 'en' ? 'Requirement posted! Landlords & roommates can now contact you 🎉' : 'پوسٹ لگ گئی! اب مالک مکان اور روم میٹس آپ سے رابطہ کر سکیں گے 🎉');
      setShowForm(false);
      setFormData({
        title: '',
        type: 'need_room',
        city: '',
        area: '',
        maxBudget: '',
        gender: 'boys',
        occupation: '',
        phone: currentUser?.phone || '',
        moveInDate: '',
        images: [],
        description: '',
      });
      fetchPosts();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await axios.delete(`${API_URL}/api/requirements/${id}`, {
        data: { userId: currentUserId, role: currentUser?.role },
      });
      fetchPosts();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatWhatsApp = (phone) => {
    if (!phone) return '';
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) cleaned = '92' + cleaned.substring(1);
    return cleaned;
  };

  const getGenderBadge = (gender) => {
    if (gender === 'boys') return { text: lang === 'en' ? '👨 Boys' : '👨 لڑکے', bg: '#eff6ff', color: '#1d4ed8' };
    if (gender === 'girls') return { text: lang === 'en' ? '👩 Girls' : '👩 لڑکیاں', bg: '#fdf2f8', color: '#be185d' };
    if (gender === 'family') return { text: lang === 'en' ? '👨‍👩‍👧‍👦 Family' : '👨‍👩‍👧‍👦 فیملی', bg: '#f0fdf4', color: '#15803d' };
    return { text: lang === 'en' ? '🤝 Anyone' : '🤝 کوئی بھی', bg: '#f1f5f9', color: '#475569' };
  };

  return (
    <div style={{ maxWidth: '1050px', margin: '30px auto', padding: '0 20px' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
          color: '#ffffff',
          padding: '28px',
          borderRadius: '18px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 10px 30px rgba(30, 58, 138, 0.2)',
        }}
      >
        <div>
          <h1 style={{ margin: '0 0 8px', fontSize: '26px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={28} color="#60a5fa" />
            {lang === 'en' ? 'Roommate & Room Finder Board' : 'روم میٹ اور کمرہ تلاش بورڈ'}
          </h1>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '14px' }}>
            {lang === 'en'
              ? 'Post your budget & area — let Landlords & Roommates reach out to you directly (0% Commission)!'
              : 'اپنا بجٹ اور علاقہ پوسٹ کریں — مالک مکان اور روم میٹس خود آپ سے رابطہ کریں گے!'}
          </p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) {
              alert('Please log in first to post!');
              navigate('/login');
              return;
            }
            setShowForm(!showForm);
          }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: showForm ? '#ef4444' : '#22c55e', color: '#ffffff',
            border: 'none', padding: '12px 20px', borderRadius: '12px',
            fontWeight: 'bold', fontSize: '15px', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          }}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? (lang === 'en' ? 'Close Form' : 'فارم بند کریں') : (lang === 'en' ? 'Post Requirement' : 'اپنی پوسٹ لگائیں')}
        </button>
      </div>

      {showForm && (
        <div
          style={{
            background: '#ffffff', padding: '24px', borderRadius: '16px',
            border: '1.5px solid #bfdbfe', boxShadow: '0 8px 25px rgba(0,0,0,0.06)',
            marginBottom: '25px',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#0f172a' }}>
            {lang === 'en' ? 'What are you looking for?' : 'آپ کو کس چیز کی ضرورت ہے؟'}
          </h3>

          <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'need_room', images: [] })}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer',
                  border: formData.type === 'need_room' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  background: formData.type === 'need_room' ? '#eff6ff' : '#fff',
                  color: formData.type === 'need_room' ? '#1d4ed8' : '#64748b',
                }}
              >
                🏠 {lang === 'en' ? 'I Need a Room / Flat' : 'مجھے کمرہ / فلیٹ چاہیے'}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'need_roommate' })}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer',
                  border: formData.type === 'need_roommate' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                  background: formData.type === 'need_roommate' ? '#f0fdf4' : '#fff',
                  color: formData.type === 'need_roommate' ? '#15803d' : '#64748b',
                }}
              >
                🤝 {lang === 'en' ? 'I Need a Roommate' : 'مجھے روم میٹ چاہیے'}
              </button>
            </div>

            <input
              type="text" required placeholder="Title (e.g. FAST Student looking for Shared Room in Johar Town)"
              value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{ padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            />

            {/* 📍 Live Location Auto-Fill بٹن */}
            <button
              type="button"
              onClick={handleLiveLocation}
              disabled={locating}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: '8px',
                border: '1.5px solid #2563eb', background: '#eff6ff', color: '#1d4ed8',
                fontWeight: 'bold', fontSize: '13px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              <MapPin size={16} />
              {locating ? 'Detecting Live Location...' : '📍 Use My Live Location (Auto-Fill City & Area)'}
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <input type="text" required placeholder="City (e.g. Lahore, Islamabad)" value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <input type="text" required placeholder="Area / University (e.g. G-11 / NUST)" value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <input type="number" required placeholder="Max Monthly Budget (PKR)" value={formData.maxBudget}
                onChange={(e) => setFormData({ ...formData, maxBudget: e.target.value })}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <option value="boys">👨 Boys / Male</option>
                <option value="girls">👩 Girls / Female</option>
                <option value="family">👨‍👩‍👧‍👦 Family</option>
                <option value="any">🤝 Anyone</option>
              </select>

              <input type="text" placeholder="University / Job (e.g. NUST Student, Software Dev)" value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />

              <input type="text" required placeholder="WhatsApp Number (03XX-XXXXXXX)" value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />

              <input type="date" value={formData.moveInDate}
                onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} title="Preferred Move-in Date" />
            </div>

            {formData.type === 'need_roommate' && (
              <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '10px', border: '1.5px dashed #86efac' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <ImageIcon size={16} />
                  {lang === 'en' ? 'Upload Room Photos (Optional - helps find roommates faster!)' : 'کمرے کی تصاویر اپلوڈ کریں (اختیاری)'}
                </label>

                <input type="file" accept="image/*" multiple onChange={handleMultipleImages} disabled={uploadProgress !== null}
                  style={{ width: '100%', fontSize: '13px', cursor: 'pointer' }} />

                {uploadProgress !== null && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#15803d', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Loader2 size={14} className="spin" /> Uploading photos... {uploadProgress}%
                  </div>
                )}

                {formData.images.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {formData.images.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img src={img} alt="Preview" style={{ width: '70px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                        <button type="button" onClick={() => removeImage(idx)}
                          style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <textarea rows="3" required placeholder="Write details (e.g. Need clean room with WiFi, non-smoker, near metro...)"
              value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />

            <button type="submit" className="btn-primary" disabled={submitting || uploadProgress !== null} style={{ padding: '12px', fontSize: '15px' }}>
              {submitting ? 'Publishing...' : (lang === 'en' ? 'Publish Post 🚀' : 'پوسٹ شائع کریں 🚀')}
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '22px', alignItems: 'center' }}>
        <div style={{ flex: '1 1 250px', display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '8px 12px' }}>
          <Search size={18} color="#64748b" />
          <input type="text" placeholder={lang === 'en' ? 'Search city, area, university (e.g. NUST, Johar Town)...' : 'شہر، علاقہ یا یونیورسٹی سرچ کریں...'}
            value={search} onChange={(e) => setSearch(e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }} />
        </div>

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', fontWeight: '600', fontSize: '13px' }}>
          <option value="all">All Posts</option>
          <option value="need_room">🏠 Need a Room</option>
          <option value="need_roommate">🤝 Need a Roommate</option>
        </select>

        <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}
          style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', fontWeight: '600', fontSize: '13px' }}>
          <option value="all">All Genders</option>
          <option value="boys">👨 Boys</option>
          <option value="girls">👩 Girls</option>
          <option value="family">👨‍👩‍👧‍👦 Family</option>
        </select>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>Loading posts...</p>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', color: '#64748b' }}>
          <Users size={42} color="#cbd5e1" style={{ marginBottom: '10px' }} />
          <h3>{lang === 'en' ? 'No posts found yet' : 'ابھی کوئی پوسٹ موجود نہیں'}</h3>
          <p>{lang === 'en' ? 'Be the first to post your room or roommate requirement!' : 'پہلی پوسٹ آپ خود لگائیں!'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '18px' }}>
          {posts.map((post) => {
            const gBadge = getGenderBadge(post.gender);
            const isOwner = currentUserId && String(post.user?._id || post.user) === String(currentUserId);
            const canDelete = isOwner || currentUser?.role === 'admin';

            const waUrl = `https://wa.me/${formatWhatsApp(post.phone)}?text=${encodeURIComponent(
              `Assalam-o-Alaikum ${post.user?.name || ''}! I saw your post "${post.title}" on HouseRent PK.`
            )}`;

            return (
              <div key={post._id} style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  {post.images && post.images.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <img src={post.images[0]} alt={post.title} onClick={() => setZoomImage(post.images[0])}
                        style={{ width: '100%', height: '165px', objectFit: 'cover', borderRadius: '10px', cursor: 'pointer' }} />
                      {post.images.length > 1 && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px', overflowX: 'auto' }}>
                          {post.images.slice(1).map((img, i) => (
                            <img key={i} src={img} alt={`Room ${i + 2}`} onClick={() => setZoomImage(img)}
                              style={{ width: '50px', height: '42px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: '1px solid #cbd5e1' }} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '999px', background: post.type === 'need_roommate' ? '#dcfce7' : '#dbeafe', color: post.type === 'need_roommate' ? '#15803d' : '#1d4ed8' }}>
                      {post.type === 'need_roommate' ? (lang === 'en' ? '🤝 Needs Roommate' : '🤝 روم میٹ چاہیے') : (lang === 'en' ? '🏠 Needs Room' : '🏠 کمرہ چاہیے')}
                    </span>

                    <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '999px', background: gBadge.bg, color: gBadge.color }}>
                      {gBadge.text}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 8px', fontSize: '17px', color: '#0f172a' }}>{post.title}</h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '13px', color: '#475569', marginBottom: '10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="#2563eb" /> <b>{post.area}, {post.city}</b>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d', fontWeight: '700' }}>
                      <Wallet size={14} /> Budget: PKR {post.maxBudget?.toLocaleString()} / mo
                    </span>
                    {post.occupation && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Briefcase size={14} color="#64748b" /> {post.occupation}
                      </span>
                    )}
                    {post.moveInDate && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} color="#64748b" /> Move-in: {new Date(post.moveInDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.5', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                    {post.description}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Posted by: <b style={{ color: '#0f172a' }}>{post.user?.name || 'User'}</b>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {!isOwner && (
                      <button type="button" onClick={() => {
                        if (!currentUser) { alert('Please log in first to chat!'); navigate('/login'); return; }
                        setActiveChatPost(post);
                      }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#0f172a', color: '#ffffff', border: 'none', padding: '7px 11px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                        <MessageCircle size={14} color="#60a5fa" /> Chat
                      </button>
                    )}

                    <a href={waUrl} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#16a34a', color: '#fff', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' }}>
                      <MessageCircle size={14} /> WhatsApp
                    </a>

                    {canDelete && (
                      <button onClick={() => handleDelete(post._id)} title="Delete Post"
                        style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '7px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex' }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {zoomImage && (
        <div onClick={() => setZoomImage(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <img src={zoomImage} alt="Enlarged" style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: '12px', objectFit: 'contain' }} />
        </div>
      )}

      {activeChatPost && (
        <ChatModal
          requirement={activeChatPost}
          receiverId={activeChatPost.user?._id || activeChatPost.user}
          receiverName={activeChatPost.user?.name || 'User'}
          onClose={() => setActiveChatPost(null)}
        />
      )}
    </div>
  );
};

export default Roommates;