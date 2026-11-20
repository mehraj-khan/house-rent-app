/* eslint-disable */
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Send, MessageSquare, Home, Users, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://house-rent-app-ten.vercel.app';

const ChatModal = ({ house, requirement, receiverId, receiverName, onClose }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const currentUserId = currentUser?.id || currentUser?._id;
  const contextId = house?._id || requirement?._id;

  // میسجز لائیو فیچ کرنا
  const fetchMessages = async () => {
    if (!currentUserId || !receiverId || !contextId) return;
    try {
      const res = await axios.get(
        `${API_URL}/api/chat/history/${contextId}/${currentUserId}/${receiverId}`
      );
      setMessages(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2500);
    return () => clearInterval(interval);
  }, [contextId, currentUserId, receiverId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const messageText = inputText.trim();
    setSending(true);

    try {
      await axios.post(`${API_URL}/api/chat/send`, {
        houseId: house?._id || null,
        requirementId: requirement?._id || null,
        senderId: currentUserId,
        receiverId: receiverId,
        text: messageText,
      });
      setInputText('');
      fetchMessages();
    } catch (err) {
      alert('Failed to send message: ' + (err.response?.data?.message || err.message));
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', bottom: '20px', right: '20px', width: '380px', maxWidth: '92vw',
      height: '520px', maxHeight: '85vh', background: '#ffffff', borderRadius: '16px',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0',
      display: 'flex', flexDirection: 'column', zIndex: 999999, overflow: 'hidden',
      animation: 'fadeIn 0.2s ease-in-out'
    }}>
      {/* 🌟 چیٹ ہیڈر */}
      <div style={{ background: '#0f172a', color: 'white', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {receiverName ? receiverName[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px' }}>{receiverName || 'User'}</h4>
            <span style={{ fontSize: '11px', color: '#4ade80' }}>● Online Chat</span>
          </div>
        </div>

        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
          <X size={20} />
        </button>
      </div>

      {/* گھر یا روم میٹ پوسٹ کا بینر */}
      <div style={{ background: '#f8fafc', padding: '8px 14px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {house ? <Home size={16} color="#2563eb" /> : <Users size={16} color="#16a34a" />}
        <span style={{ fontSize: '12px', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {house ? (
            <><b>Regarding:</b> {house.title} (PKR {house.rentPrice?.toLocaleString()}/mo)</>
          ) : (
            <><b>Roommate Post:</b> {requirement?.title} (PKR {requirement?.maxBudget?.toLocaleString()}/mo)</>
          )}
        </span>
      </div>

      {/* 💬 میسجز ایریا */}
      <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', background: '#f1f5f9' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', marginTop: '40px' }}>
            <MessageSquare size={32} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
            No messages yet. Send a message to start conversation!
          </div>
        ) : (
          messages.map((m) => {
            const isMe = String(m.sender?._id || m.sender) === String(currentUserId);
            return (
              <div
                key={m._id}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  background: isMe ? '#2563eb' : '#ffffff',
                  color: isMe ? '#ffffff' : '#0f172a',
                  padding: '9px 14px',
                  borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  wordBreak: 'break-word',
                }}
              >
                <div>{m.text}</div>
                <div style={{ fontSize: '10px', opacity: 0.75, textAlign: 'end', marginTop: '4px' }}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ان پٹ بار */}
      <form onSubmit={handleSend} style={{ padding: '10px 14px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="Type your message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{ flex: 1, padding: '10px 14px', borderRadius: '25px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
        />
        <button
          type="submit"
          disabled={sending || !inputText.trim()}
          style={{
            background: '#2563eb', color: 'white', border: 'none', width: '42px', height: '42px',
            borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          {sending ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
};

export default ChatModal;