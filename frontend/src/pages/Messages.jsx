/* eslint-disable */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MessageCircle, Home, ArrowLeft, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ChatModal from '../components/ChatModal.jsx';

const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://house-rent-app-ten.vercel.app';

const Messages = () => {
  const { currentUser, lang } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);

  const currentUserId = currentUser?.id || currentUser?._id;

  const fetchConversations = async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/api/chat/conversations/${currentUserId}`);
      const allMessages = res.data || [];

      // ہر گھر اور دوسرے یوزر کے حساب سے چیٹس کو گروپ کرنا (تازہ ترین میسج سب سے اوپر)
      const groupedMap = new Map();

      allMessages.forEach((msg) => {
        if (!msg.house || !msg.sender || !msg.receiver) return;

        const senderId = String(msg.sender._id || msg.sender);
        const isMe = senderId === String(currentUserId);
        const otherUser = isMe ? msg.receiver : msg.sender;
        const otherUserId = String(otherUser._id || otherUser);
        const houseId = String(msg.house._id || msg.house);

        const key = `${houseId}_${otherUserId}`;
        if (!groupedMap.has(key)) {
          groupedMap.set(key, {
            key,
            house: msg.house,
            otherUserId,
            otherUserName: otherUser.name || 'User',
            lastMessage: msg.text,
            lastSenderIsMe: isMe,
            updatedAt: msg.createdAt,
          });
        }
      });

      setConversations(Array.from(groupedMap.values()));
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 4000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  if (!currentUser) {
    return (
      <div style={{ maxWidth: '500px', margin: '60px auto', padding: '30px', textAlign: 'center', background: '#fff', borderRadius: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <h2>{lang === 'en' ? 'Please Log In' : 'براہ کرم لاگ ان کریں'}</h2>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>
          {lang === 'en' ? 'Log in to view your messages.' : 'اپنے پیغامات دیکھنے کے لیے لاگ ان کریں۔'}
        </p>
        <button className="btn-primary" onClick={() => navigate('/login')}>
          {lang === 'en' ? 'Go to Login' : 'لاگ ان کریں'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '35px auto', padding: '0 20px' }}>
      <button
        className="btn-outline"
        onClick={() => navigate(-1)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '18px' }}
      >
        <ArrowLeft size={16} />
        {lang === 'en' ? 'Back' : 'واپس جائیں'}
      </button>

      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '20px' }}>
          <div style={{ background: '#eff6ff', color: '#2563eb', padding: '10px', borderRadius: '12px', display: 'flex' }}>
            <MessageCircle size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', color: '#0f172a' }}>
              {lang === 'en' ? 'Messages Inbox' : 'پیغامات (Inbox)'}
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              {lang === 'en' ? 'Click any conversation to view & reply live' : 'جواب دینے کے لیے کسی بھی چیٹ پر کلک کریں'}
            </p>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '30px' }}>
            {lang === 'en' ? 'Loading messages...' : 'پیغامات لوڈ ہو رہے ہیں...'}
          </p>
        ) : conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '45px 20px', color: '#64748b' }}>
            <MessageCircle size={42} color="#cbd5e1" style={{ marginBottom: '10px' }} />
            <h4 style={{ margin: '0 0 6px', color: '#334155' }}>
              {lang === 'en' ? 'No messages yet' : 'ابھی کوئی پیغام نہیں آیا'}
            </h4>
            <p style={{ margin: 0, fontSize: '14px' }}>
              {lang === 'en' ? 'When someone messages you about a property, it will appear here.' : 'جب کوئی آپ سے مکان کے بارے میں رابطہ کرے گا تو یہاں نظر آئے گا۔'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {conversations.map((conv) => (
              <div
                key={conv.key}
                onClick={() =>
                  setActiveChat({
                    house: conv.house,
                    receiverId: conv.otherUserId,
                    receiverName: conv.otherUserName,
                  })
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  transition: '0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '18px',
                      flexShrink: 0,
                    }}
                  >
                    {conv.otherUserName.charAt(0).toUpperCase()}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <b style={{ fontSize: '15px', color: '#0f172a' }}>{conv.otherUserName}</b>
                      <span style={{ fontSize: '12px', color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Home size={12} /> {conv.house.title}
                      </span>
                    </div>

                    <p style={{ margin: '5px 0 0', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.lastSenderIsMe ? (lang === 'en' ? 'You: ' : 'آپ: ') : ''}
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'end', flexShrink: 0 }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginBottom: '6px' }}>
                    <Clock size={12} />
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#2563eb', background: '#fff', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '8px' }}>
                    {lang === 'en' ? 'Reply' : 'جواب دیں'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* کلک کرنے پر لائیو چیٹ ونڈو کھل جائے گی */}
      {activeChat && (
        <ChatModal
          house={activeChat.house}
          receiverId={activeChat.receiverId}
          receiverName={activeChat.receiverName}
          onClose={() => {
            setActiveChat(null);
            fetchConversations();
          }}
        />
      )}
    </div>
  );
};

export default Messages;