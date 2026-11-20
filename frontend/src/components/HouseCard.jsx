/* eslint-disable */
import { useNavigate } from 'react-router-dom';
import { MapPin, Bed, Bath, Star, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HouseCard = ({ house }) => {
  const { lang } = useAuth();
  const navigate = useNavigate();

  const splitPrice =
    house.pricePerPerson > 0
      ? house.pricePerPerson
      : house.isShared && house.totalBeds > 1 && house.rentPrice > 0
      ? Math.round(house.rentPrice / house.totalBeds)
      : 0;

  const displayPrice = house.pricePerDay > 0
    ? `PKR ${house.pricePerDay.toLocaleString()} / night`
    : `PKR ${house.rentPrice?.toLocaleString()} / month`;

  const getSharedBadgeText = () => {
    if (house.sharedGender === 'boys') return lang === 'en' ? '🎓 Shared • Boys' : '🎓 مشترکہ • لڑکے';
    if (house.sharedGender === 'girls') return lang === 'en' ? '🎓 Shared • Girls' : '🎓 مشترکہ • لڑکیاں';
    return lang === 'en' ? '🎓 Shared Room' : '🎓 مشترکہ کمرہ';
  };

  const u = house.utilities || {};
  const isGreatDeal = house.marketStats?.verdict === 'great_deal';

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
        {house.suitableFor === 'bachelors' && !house.isShared && (
          <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(30, 64, 175, 0.9)', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
            👤 {lang === 'en' ? 'Bachelors Ok' : 'بیچلرز الاؤڈ'}
          </span>
        )}

        {/* 🎓 Shared / Roommate بیج */}
        {house.isShared && (
          <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(21, 128, 61, 0.92)', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '4px 9px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
            {getSharedBadgeText()}
          </span>
        )}

        {/* 💚 Great Deal بیج (مارکیٹ ریٹ سے سستا ہونے پر) */}
        {isGreatDeal && (
          <span style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(22, 163, 74, 0.94)', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '4px 9px', borderRadius: '8px', backdropFilter: 'blur(4px)' }}>
            💚 {Math.abs(house.marketStats.percentDiff)}% {lang === 'en' ? 'Below Avg' : 'سستا'}
          </span>
        )}

        {/* 🌟 لائیو اسٹار ریٹنگ بیج */}
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(15, 23, 42, 0.85)', color: 'white', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', backdropFilter: 'blur(4px)' }}>
          <Star size={13} fill="#eab308" color="#eab308" />
          {house.averageRating > 0 ? `${house.averageRating} (${house.totalReviews})` : 'New'}
        </div>
      </div>

      <div className="house-info">
        {house.isShared && splitPrice > 0 ? (
          <div>
            <div className="house-price" style={{ color: '#15803d', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>PKR {splitPrice.toLocaleString()} / {lang === 'en' ? 'person' : 'فی کس'}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={12} />
              <span>
                {lang === 'en'
                  ? `Split ${house.totalBeds} ways • Full: PKR ${house.rentPrice?.toLocaleString()}/mo`
                  : `${house.totalBeds} افراد میں تقسیم • کل کرایہ: PKR ${house.rentPrice?.toLocaleString()}`}
              </span>
            </div>
          </div>
        ) : (
          <div className="house-price" style={{ color: '#0f172a', fontSize: '18px' }}>
            {displayPrice}
          </div>
        )}

        <div className="house-title" style={{ fontSize: '16px' }}>{house.title}</div>
        <div className="house-city">
          <MapPin size={14} style={{ marginInlineEnd: '4px', verticalAlign: 'middle' }} />
          {house.address}, {house.city}
        </div>

        {house.nearLandmark && (
          <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: '600', marginTop: '4px' }}>
            📍 {house.nearLandmark}
          </div>
        )}

        {/* ⚡ منی یوٹیلیٹی ٹیگز */}
        {(u.separateMeter || u.solarOrUps || u.suiGas || u.wifi) && (
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '8px' }}>
            {u.separateMeter && <span style={{ fontSize: '10px', background: '#fef9c3', color: '#854d0e', padding: '2px 6px', borderRadius: '6px', fontWeight: '600' }}>⚡ Meter</span>}
            {u.solarOrUps && <span style={{ fontSize: '10px', background: '#ffedd5', color: '#9a3412', padding: '2px 6px', borderRadius: '6px', fontWeight: '600' }}>☀️ Solar/UPS</span>}
            {u.suiGas && <span style={{ fontSize: '10px', background: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '6px', fontWeight: '600' }}>🔥 Gas</span>}
            {u.wifi && <span style={{ fontSize: '10px', background: '#eff6ff', color: '#1d4ed8', padding: '2px 6px', borderRadius: '6px', fontWeight: '600' }}>📶 WiFi</span>}
          </div>
        )}

        <div className="house-features">
          <span><Bed size={15} /> {house.bedrooms} {lang === 'en' ? 'Beds' : 'کمرے'}</span>
          <span><Bath size={15} /> {house.bathrooms} {lang === 'en' ? 'Baths' : 'باتھ'}</span>
        </div>
      </div>
    </div>
  );
};

export default HouseCard;