import Ad from '../models/Ad.js';
import House from '../models/House.js';
import Notification from '../models/Notification.js';

// سرور پر پیکج ریٹس (تاکہ کوئی قیمت تبدیل نہ کر سکے)
const PACKAGE_PRICES = {
  house_boost: { 7: 500, 15: 900, 30: 1500 },
  home_top: { 7: 1500, 15: 2800, 30: 5000 },
  in_feed: { 7: 1000, 15: 1800, 30: 3200 },
};

// 1. نیا Banner Ad یا House Boost جمع کرانا
export const createAd = async (req, res) => {
  try {
    const {
      adType,
      houseId,
      userId,
      advertiserName,
      advertiserPhone,
      businessName,
      title,
      subtitle,
      imageUrl,
      targetUrl,
      placement,
      city,
      packageDays,
      paymentMethod,
      transactionId,
    } = req.body;

    const finalType = adType === 'house_boost' ? 'house_boost' : 'banner';
    const days = [7, 15, 30].includes(Number(packageDays)) ? Number(packageDays) : 7;
    const finalPlacement =
      finalType === 'house_boost'
        ? 'featured_house'
        : placement === 'home_top'
        ? 'home_top'
        : 'in_feed';

    const priceTable =
      finalType === 'house_boost'
        ? PACKAGE_PRICES.house_boost
        : PACKAGE_PRICES[finalPlacement];
    const price = priceTable[days] || 500;

    if (finalType === 'house_boost') {
      if (!houseId) {
        return res.status(400).json({ message: 'House ID is required to boost listing!' });
      }
      const existingPending = await Ad.findOne({
        house: houseId,
        adType: 'house_boost',
        status: 'pending',
      });
      if (existingPending) {
        return res.status(400).json({
          message: 'A boost request for this property is already pending Admin approval!',
        });
      }
    }

    const newAd = await Ad.create({
      adType: finalType,
      house: finalType === 'house_boost' ? houseId : null,
      user: userId || null,
      advertiserName,
      advertiserPhone,
      businessName: businessName || '',
      title,
      subtitle: subtitle || '',
      imageUrl: imageUrl || '',
      targetUrl: targetUrl || '',
      placement: finalPlacement,
      city: city || 'all',
      packageDays: days,
      price,
      paymentMethod: paymentMethod || 'JazzCash',
      transactionId,
      status: 'pending',
    });

    res.status(201).json({
      message: 'Ad request submitted! Admin will verify TID and activate it shortly. 🚀',
      ad: newAd,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. ویب سائٹ پر چلنے والے Active Banner Ads لانا
export const getActiveAds = async (req, res) => {
  try {
    const { placement, city } = req.query;
    const now = new Date();

    const query = {
      adType: 'banner',
      status: 'approved',
      expiresAt: { $gt: now },
    };

    if (placement) query.placement = placement;
    if (city && city.trim() !== '') {
      query.$or = [
        { city: 'all' },
        { city: { $regex: city.trim(), $options: 'i' } },
      ];
    }

    const ads = await Ad.find(query).sort({ createdAt: -1 }).limit(6);
    res.status(200).json(ads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Ad پر Click یا View گننا
export const trackAdClick = async (req, res) => {
  try {
    const ad = await Ad.findByIdAndUpdate(
      req.params.id,
      { $inc: { clicks: 1 } },
      { new: true }
    );
    res.status(200).json({ clicks: ad?.clicks || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const trackAdView = async (req, res) => {
  try {
    await Ad.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. کسی یوزر کے اپنے Ads اور Boosts دیکھنا
export const getMyAds = async (req, res) => {
  try {
    const ads = await Ad.find({ user: req.params.userId })
      .populate('house', 'title city images purpose')
      .sort({ createdAt: -1 });
    res.status(200).json(ads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Admin کے لیے تمام Ads اور House Boosts لانا
export const getAllAdsAdmin = async (req, res) => {
  try {
    const ads = await Ad.find()
      .populate('house', 'title city images purpose rentPrice salePrice isFeatured')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.status(200).json(ads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Admin کا Ad یا House Boost کو Approve یا Reject کرنا
export const updateAdStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' | 'rejected'
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Ad not found!' });

    ad.status = status;

    if (status === 'approved') {
      const now = new Date();
      const expiry = new Date(now.getTime() + ad.packageDays * 24 * 60 * 60 * 1000);
      ad.startsAt = now;
      ad.expiresAt = expiry;

      if (ad.adType === 'house_boost' && ad.house) {
        await House.findByIdAndUpdate(ad.house, {
          isFeatured: true,
          featuredUntil: expiry,
        });
      }
    } else if (status === 'rejected' && ad.adType === 'house_boost' && ad.house) {
      await House.findByIdAndUpdate(ad.house, {
        isFeatured: false,
        featuredUntil: null,
      });
    }

    await ad.save();

    // یوزر کو نوٹیفیکیشن بھیجیں
    if (ad.user) {
      try {
        await Notification.create({
          user: ad.user,
          title:
            status === 'approved'
              ? '🚀 Your Ad / Boost is Live!'
              : '❌ Ad Request Rejected',
          message:
            status === 'approved'
              ? `"${ad.title}" is now active for ${ad.packageDays} days!`
              : `Your ad "${ad.title}" could not be verified. Check your TID or contact support.`,
          type: 'system',
          link: ad.house ? `/house/${ad.house}` : '/advertise',
          isRead: false,
        });
      } catch {
        // ignore notification error
      }
    }

    res.status(200).json({ message: `Ad ${status} successfully!`, ad });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. Admin کا Ad ڈیلیٹ کرنا
export const deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Ad not found!' });

    if (ad.adType === 'house_boost' && ad.house) {
      await House.findByIdAndUpdate(ad.house, {
        isFeatured: false,
        featuredUntil: null,
      });
    }

    await Ad.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Ad deleted successfully! 🗑️' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};