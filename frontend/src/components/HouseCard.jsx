/* eslint-disable */
import { useNavigate } from 'react-router-dom';
import { MapPin, Bed, Bath, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HouseCard = ({ house }) => {
  const { lang } = useAuth();
  const navigate = useNavigate();

  const displayPrice = house.pricePerDay > 0
    ? `PKR ${house.pricePerDay.toLocaleString()} / night`
    : `PKR ${house.rentPrice?.toLocaleString()} / month`;

  return (
    <div className="house-card" onClick={() => navigate(`/house/${house._id}`)} style={{ cursor: 'pointer' }}>
      <div style={{ position: 'relative' }}>
        <img
          src={house.images?.[0] || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600'}
          alt={house.title}
          className="house-img"
        />

        {/* 🇵🇰 پاکستانی کلچرل بیج */}
        {house.suitableFor === 'family' && (
          <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(22, 101, 52, 0.9)', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
            👨‍👩‍👧‍👦 {lang === 'en' ? 'Family Only' : 'صرف فیملی'}
          </span>
        )}
        {house.suitableFor === 'bachelors' && (
          <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(30, 64, 175, 0.9)', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
            👤 {lang === 'en' ? 'Bachelors Ok' : 'بیچلرز الاؤڈ'}
          </span>
        )}

        {/* 🌟 لائیو اسٹار ریٹنگ بیج */}
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(15, 23, 42, 0.85)', color: 'white', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', backdropFilter: 'blur(4px)' }}>
          <Star size={13} fill="#eab308" color="#eab308" />
          {house.averageRating > 0 ? `${house.averageRating} (${house.totalReviews})` : 'New'}
        </div>
      </div>

      <div className="house-info">
        <div className="house-price" style={{ color: '#0f172a', fontSize: '18px' }}>
          {displayPrice}
        </div>
        <div className="house-title" style={{ fontSize: '16px' }}>{house.title}</div>
        <div className="house-city">
          <MapPin size={14} style={{ marginInlineEnd: '4px', verticalAlign: 'middle' }} />
          {house.address}, {house.city}
        </div>
        <div className="house-features">
          <span><Bed size={15} /> {house.bedrooms} {lang === 'en' ? 'Beds' : 'کمرے'}</span>
          <span><Bath size={15} /> {house.bathrooms} {lang === 'en' ? 'Baths' : 'باتھ'}</span>
        </div>
      </div>
    </div>
  );
};

export default HouseCard;