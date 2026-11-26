/* eslint-disable */
import { useNavigate } from 'react-router-dom';
import { MapPin, Bed, Bath, Star, Users, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const formatPKR = (amount) => {
  
  const num = Number(amount) || 0;
  if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Crore`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)} Lac`;
  return num.toLocaleString();
};
const optimizeImg = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&auto=format&fit=crop&q=75';
  if (url.includes('res.cloudinary.com') && url.includes('/upload/') && !url.includes('f_auto')) {
    return url.replace('/upload/', '/upload/f_auto,q_auto,w_500/');
  }
  return url;
};


const HouseCard = ({ house }) => {
  const { lang } = useAuth();
  const navigate = useNavigate();

  const isSale = house.purpose === 'sale';
  const isVerifiedOwner = Boolean(house.owner?.isVerified);
  const isFeatured = Boolean(
    house.isFeaturedActive ||
      (house.isFeatured &&
        house.featuredUntil &&
        new Date(house.featuredUntil).getTime() > Date.now())
  );

  const splitPrice =
    house.pricePerPerson > 0
      ? house.pricePerPerson
      : house.isShared && house.totalBeds > 1 && house.rentPrice > 0
      ? Math.round(house.rentPrice / house.totalBeds)
      : 0;

  const displayPrice = isSale
    ? `PKR ${formatPKR(house.salePrice)}`
    : house.pricePerDay > 0
    ? `PKR ${house.pricePerDay.toLocaleString()} / night`
    : `PKR ${(house.rentPrice || 0).toLocaleString()} / month`;

  const getSharedBadgeText = () => {
    if (house.sharedGender === 'boys') return lang === 'en' ? '🎓 Shared • Boys' : '🎓 مشترکہ • لڑکے';
    if (house.sharedGender === 'girls') return lang === 'en' ? '🎓 Shared • Girls' : '🎓 مشترکہ • لڑکیاں';
    return lang === 'en' ? '🎓 Shared Room' : '🎓 مشترکہ کمرہ';
  };

  const u = house.utilities || {};
  const isGreatDeal = !isSale && house.marketStats?.verdict === 'great_deal';

  return (
    <div
      className="house-card"
      onClick={() => navigate(`/house/${house._id}`)}
      style={{
        cursor: 'pointer',
        border: isFeatured ? '2px solid #f59e0b' : undefined,
        boxShadow: isFeatured ? '0 8px 24px rgba(245, 158, 11, 0.18)' : undefined,
      }}
    >
      <div style={{ position: 'relative' }}>
<img
          src={optimizeImg(house.images?.[0])}
          alt={house.title}
          className="house-img"
          loading="lazy"
        />

        {/* Top-Left Badges (آپس میں نہ ٹکرائیں) */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap', maxWidth: '75%' }}>
          {isFeatured && (
            <span
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#ffffff',
                fontSize: '10.5px',
                fontWeight: '800',
                padding: '4px 8px',
                borderRadius: '10px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            >
              ⚡ FEATURED
            </span>
          )}

          {isVerifiedOwner && (
            <span
              style={{
                background: 'rgba(37, 99, 235, 0.94)',
                color: '#ffffff',
                fontSize: '10.5px',
                fontWeight: '800',
                padding: '4px 8px',
                borderRadius: '10px',
                backdropFilter: 'blur(4px)',
              }}
            >
              ✅ Verified
            </span>
          )}

          {isSale ? (
            <span
              style={{
                background: 'rgba(4, 120, 87, 0.94)',
                color: 'white',
                fontSize: '11px',
                fontWeight: 'bold',
                padding: '4px 9px',
                borderRadius: '10px',
                backdropFilter: 'blur(4px)',
              }}
            >
              🏷️ {lang === 'en' ? 'FOR SALE' : 'برائے فروخت'}
            </span>
          ) : (
            <>
              {house.suitableFor === 'family' && (
                <span style={{ background: 'rgba(22, 101, 52, 0.9)', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
                  👨‍👩‍👧‍👦 {lang === 'en' ? 'Family Only' : 'صرف فیملی'}
                </span>
              )}
              {house.suitableFor === 'bachelors' && !house.isShared && (
                <span style={{ background: 'rgba(30, 64, 175, 0.9)', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
                  👤 {lang === 'en' ? 'Bachelors Ok' : 'بیچلرز الاؤڈ'}
                </span>
              )}
            </>
          )}
        </div>

        {isSale && house.propertyType ? (
          <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(15, 23, 42, 0.82)', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '4px 9px', borderRadius: '10px', textTransform: 'capitalize' }}>
            {house.propertyType}
          </span>
        ) : (
          house.isShared && (
            <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(21, 128, 61, 0.92)', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '4px 9px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
              {getSharedBadgeText()}
            </span>
          )
        )}

        {isGreatDeal && (
          <span style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(22, 163, 74, 0.94)', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '4px 9px', borderRadius: '8px', backdropFilter: 'blur(4px)' }}>
            💚 {Math.abs(house.marketStats.percentDiff)}% {lang === 'en' ? 'Below Avg' : 'سستا'}
          </span>
        )}

        {isSale && house.installmentAvailable && (
          <span style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(217, 119, 6, 0.94)', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '4px 9px', borderRadius: '8px' }}>
            💳 {lang === 'en' ? 'Installments' : 'اقساط پر دستیاب'}
          </span>
        )}

        <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(15, 23, 42, 0.85)', color: 'white', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', backdropFilter: 'blur(4px)' }}>
          <Star size={13} fill="#eab308" color="#eab308" />
          {house.averageRating > 0 ? `${house.averageRating} (${house.totalReviews})` : 'New'}
        </div>
      </div>

      <div className="house-info">
        {!isSale && house.isShared && splitPrice > 0 ? (
          <div>
            <div className="house-price" style={{ color: '#15803d', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>PKR {splitPrice.toLocaleString()} / {lang === 'en' ? 'person' : 'فی کس'}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={12} />
              <span>
                {lang === 'en'
                  ? `Split ${house.totalBeds} ways • Full: PKR ${(house.rentPrice || 0).toLocaleString()}/mo`
                  : `${house.totalBeds} افراد میں تقسیم • کل کرایہ: PKR ${(house.rentPrice || 0).toLocaleString()}`}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
            <div className="house-price" style={{ color: isSale ? '#047857' : '#0f172a', fontSize: '18px' }}>
              {displayPrice}
            </div>
            {isSale && house.isNegotiable && (
              <span style={{ fontSize: '10px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 6px', borderRadius: '6px', fontWeight: '700' }}>
                Negotiable
              </span>
            )}
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

        {(u.separateMeter || u.solarOrUps || u.suiGas || u.wifi) && (
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '8px' }}>
            {u.separateMeter && <span style={{ fontSize: '10px', background: '#fef9c3', color: '#854d0e', padding: '2px 6px', borderRadius: '6px', fontWeight: '600' }}>⚡ Meter</span>}
            {u.solarOrUps && <span style={{ fontSize: '10px', background: '#ffedd5', color: '#9a3412', padding: '2px 6px', borderRadius: '6px', fontWeight: '600' }}>☀️ Solar/UPS</span>}
            {u.suiGas && <span style={{ fontSize: '10px', background: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '6px', fontWeight: '600' }}>🔥 Gas</span>}
            {u.wifi && <span style={{ fontSize: '10px', background: '#eff6ff', color: '#1d4ed8', padding: '2px 6px', borderRadius: '6px', fontWeight: '600' }}>📶 WiFi</span>}
          </div>
        )}

        <div className="house-features">
          {house.areaSize && (
            <span><Layers size={15} /> {house.areaSize} {house.areaUnit || 'Marla'}</span>
          )}
          {house.bedrooms > 0 && (
            <span><Bed size={15} /> {house.bedrooms} {lang === 'en' ? 'Beds' : 'کمرے'}</span>
          )}
          {house.bathrooms > 0 && (
            <span><Bath size={15} /> {house.bathrooms} {lang === 'en' ? 'Baths' : 'باتھ'}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default HouseCard;