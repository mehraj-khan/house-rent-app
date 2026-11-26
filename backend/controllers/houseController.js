import House from '../models/House.js';
import Requirement from '../models/Requirement.js';
import Notification from '../models/Notification.js';

// 1. مارکیٹ ریٹ موازنہ نکالنے والا فنکشن
const computeMarketStats = (price, avgPrice, sampleCount) => {
  if (!price || price <= 0 || !avgPrice || avgPrice <= 0 || sampleCount < 1) {
    return { avgRent: 0, sampleCount: 0, percentDiff: 0, verdict: 'new' };
  }
  const roundedAvg = Math.round(avgPrice);
  const percentDiff = Math.round(((price - roundedAvg) / roundedAvg) * 100);
  let verdict = 'fair';
  if (percentDiff <= -10) verdict = 'great_deal';
  else if (percentDiff >= 12) verdict = 'above_average';

  return {
    avgRent: roundedAvg,
    sampleCount,
    percentDiff,
    verdict,
  };
};

// 2. پراپرٹی کوالٹی اسکور (0 سے 100 پوائنٹس)
const computeQualityScore = (h) => {
  let score = 0;
  const imgCount = Array.isArray(h.images) ? h.images.length : 0;
  if (imgCount >= 3) score += 25;
  else if (imgCount >= 1) score += 10;

  if (h.videoUrl && h.videoUrl.trim() !== '') score += 20;

  const utilCount = h.utilities
    ? Object.values(h.utilities).filter(Boolean).length
    : 0;
  if (utilCount >= 3) score += 15;
  else if (utilCount >= 1) score += 7;

  if (h.nearLandmark && h.nearLandmark.trim() !== '') score += 10;
  if (h.description && h.description.trim().length >= 60) score += 10;
  if (h.areaSize && String(h.areaSize).trim() !== '') score += 5;
  if ((h.averageRating || 0) >= 4) score += 10;
  if ((h.totalReviews || 0) >= 1) score += 5;

  return Math.min(score, 100);
};

// 3. مارکیٹ ریٹ کیشے (5 منٹ تک تاکہ ہر بار پورا ڈیٹا بیس اسکین نہ ہو)
let marketStatsCache = { cbMap: null, cMap: null, expiresAt: 0 };

const getCachedCityStats = async () => {
  const now = Date.now();
  if (marketStatsCache.cbMap && marketStatsCache.expiresAt > now) {
    return marketStatsCache;
  }

  const [cityBedroomStats, cityOnlyStats] = await Promise.all([
    House.aggregate([
      { $match: { rentPrice: { $gt: 0 }, purpose: { $ne: 'sale' } } },
      {
        $group: {
          _id: { city: { $toLower: '$city' }, bedrooms: '$bedrooms' },
          avgRent: { $avg: '$rentPrice' },
          count: { $sum: 1 },
        },
      },
    ]),
    House.aggregate([
      { $match: { rentPrice: { $gt: 0 }, purpose: { $ne: 'sale' } } },
      {
        $group: {
          _id: { $toLower: '$city' },
          avgRent: { $avg: '$rentPrice' },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  marketStatsCache = {
    cbMap: new Map(cityBedroomStats.map((s) => [`${s._id.city}_${s._id.bedrooms}`, s])),
    cMap: new Map(cityOnlyStats.map((s) => [s._id, s])),
    expiresAt: now + 5 * 60 * 1000,
  };
  return marketStatsCache;
};

// 1. نیا گھر یا پراپرٹی شامل کرنا
export const addHouse = async (req, res) => {
  try {
    const {
      purpose, propertyType,
      title, description,
      rentPrice, pricePerDay, pricePerYear, availableFor,
      salePrice, areaSize, areaUnit, isNegotiable, possessionStatus, installmentAvailable,
      suitableFor, availableFrom, availableTo, videoUrl,
      city, address, bedrooms, bathrooms, images, owner,
      isShared, totalBeds, pricePerPerson, sharedGender,
      utilities, nearLandmark,
    } = req.body;

    const finalPurpose = purpose === 'sale' ? 'sale' : 'rent';
    const numericRent = finalPurpose === 'sale' ? 0 : Number(rentPrice) || 0;
    const numericSale = finalPurpose === 'sale' ? Number(salePrice) || 0 : 0;
    const numericBeds = finalPurpose === 'rent' && isShared ? Math.max(Number(totalBeds) || 2, 1) : 1;
    const calculatedPerPerson =
      finalPurpose === 'rent' && isShared
        ? Number(pricePerPerson) || (numericRent > 0 ? Math.round(numericRent / numericBeds) : 0)
        : 0;

    const cleanUtilities = {
      separateMeter: Boolean(utilities?.separateMeter),
      solarOrUps: Boolean(utilities?.solarOrUps),
      suiGas: Boolean(utilities?.suiGas),
      water24x7: Boolean(utilities?.water24x7),
      wifi: Boolean(utilities?.wifi),
      parking: Boolean(utilities?.parking),
    };

    const qualityScore = computeQualityScore({
      images,
      videoUrl,
      utilities: cleanUtilities,
      nearLandmark,
      description,
      areaSize,
      averageRating: 0,
      totalReviews: 0,
    });

    const ownerId = req.user?._id || owner;

    const newHouse = await House.create({
      purpose: finalPurpose,
      propertyType: propertyType || 'house',
      title,
      description,
      rentPrice: numericRent,
      pricePerDay: finalPurpose === 'sale' ? 0 : Number(pricePerDay) || 0,
      pricePerYear: finalPurpose === 'sale' ? 0 : Number(pricePerYear) || 0,
      availableFor: finalPurpose === 'sale' ? [] : availableFor || ['monthly'],
      salePrice: numericSale,
      areaSize: areaSize || '',
      areaUnit: areaUnit || 'Marla',
      isNegotiable: isNegotiable !== undefined ? Boolean(isNegotiable) : true,
      possessionStatus: possessionStatus || 'ready',
      installmentAvailable: Boolean(installmentAvailable),
      suitableFor: suitableFor || 'both',
      availableFrom: availableFrom ? new Date(availableFrom) : null,
      availableTo: availableTo ? new Date(availableTo) : null,
      videoUrl: videoUrl || '',
      city,
      address,
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      images,
      owner: ownerId,
      isShared: finalPurpose === 'rent' ? Boolean(isShared) : false,
      totalBeds: numericBeds,
      pricePerPerson: calculatedPerPerson,
      sharedGender: sharedGender || 'any',
      utilities: cleanUtilities,
      nearLandmark: nearLandmark || '',
      qualityScore,
    });

    try {
      const effectivePrice =
        finalPurpose === 'sale'
          ? newHouse.salePrice
          : newHouse.isShared && newHouse.pricePerPerson > 0
          ? newHouse.pricePerPerson
          : newHouse.rentPrice;

      const escapedCity = (city || '').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (escapedCity && effectivePrice > 0 && finalPurpose === 'rent') {
        const waitingUsers = await Requirement.find({
          user: { $ne: ownerId },
          type: 'need_room',
          city: { $regex: escapedCity, $options: 'i' },
          maxBudget: { $gte: effectivePrice },
        }).limit(10);

        for (const w of waitingUsers) {
          await Notification.create({
            user: w.user,
            sender: ownerId || null,
            title: `🎯 New Match in ${newHouse.city}!`,
            message: `"${newHouse.title}" fits your PKR ${w.maxBudget.toLocaleString()} budget!`,
            type: 'system',
            link: `/house/${newHouse._id}`,
            isRead: false,
          });
        }
      }
    } catch {
      // ignore match alert error
    }

    res.status(201).json({
      message:
        finalPurpose === 'sale'
          ? 'Property sale ke liye list ho gayi hai! 🏷️'
          : 'Ghar kamyabi se list ho gaya hai! 🏠',
      house: newHouse,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. تمام پراپرٹیز کی لسٹ (Fast Pagination + Cached Stats + Smart Sort)
export const getAllHouses = async (req, res) => {
  try {
    const {
      city, search, purpose, propertyType,
      maxPrice, rentType, bedrooms, suitableFor,
      isShared, sharedGender, separateMeter, solarOrUps, suiGas, wifi,
      page = 1, limit = 12,
    } = req.query;

    let query = {};
    let andConditions = [];

    if (purpose === 'sale') {
      andConditions.push({ purpose: 'sale' });
      if (propertyType && propertyType !== 'all') {
        query.propertyType = propertyType;
      }
    } else if (purpose === 'all') {
      // Admin کے لیے تمام پراپرٹیز
    } else {
      andConditions.push({
        $or: [{ purpose: 'rent' }, { purpose: { $exists: false } }],
      });
      if (rentType && rentType !== 'all') query.availableFor = rentType;
      if (suitableFor && suitableFor !== 'all') query.suitableFor = { $in: [suitableFor, 'both'] };
      if (isShared === 'true') query.isShared = true;
      if (sharedGender && sharedGender !== 'all') {
        query.sharedGender = { $in: [sharedGender, 'any'] };
      }
    }

    const keyword = search || city;
    if (keyword && keyword.trim() !== '') {
      andConditions.push({
        $or: [
          { city: { $regex: keyword.trim(), $options: 'i' } },
          { address: { $regex: keyword.trim(), $options: 'i' } },
          { title: { $regex: keyword.trim(), $options: 'i' } },
          { nearLandmark: { $regex: keyword.trim(), $options: 'i' } },
        ],
      });
    }

    if (bedrooms && bedrooms !== 'all') query.bedrooms = { $gte: Number(bedrooms) };
    if (separateMeter === 'true') query['utilities.separateMeter'] = true;
    if (solarOrUps === 'true') query['utilities.solarOrUps'] = true;
    if (suiGas === 'true') query['utilities.suiGas'] = true;
    if (wifi === 'true') query['utilities.wifi'] = true;

    if (maxPrice) {
      const limitPrice = Number(maxPrice);
      if (purpose === 'sale') {
        query.salePrice = { $lte: limitPrice, $gt: 0 };
      } else if (rentType === 'daily') {
        query.pricePerDay = { $lte: limitPrice, $gt: 0 };
      } else if (isShared === 'true') {
        andConditions.push({
          $or: [
            { pricePerPerson: { $gt: 0, $lte: limitPrice } },
            { rentPrice: { $lte: limitPrice } },
          ],
        });
      } else if (purpose !== 'all') {
        query.rentPrice = { $lte: limitPrice };
      }
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = purpose === 'all' ? 100 : Math.min(Math.max(Number(limit) || 12, 1), 50);

    const [houses, totalCount, stats] = await Promise.all([
      House.find(query)
        .select('-description')
        .populate('owner', 'name phone isVerified')
        .sort({ isFeatured: -1, qualityScore: -1, createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      House.countDocuments(query),
      getCachedCityStats(),
    ]);

    const nowMs = Date.now();
    const enrichedHouses = houses.map((h) => {
      const isFeaturedActive = Boolean(
        h.isFeatured && h.featuredUntil && new Date(h.featuredUntil).getTime() > nowMs
      );

      if (h.purpose === 'sale') {
        return {
          ...h,
          isFeaturedActive,
          marketStats: { avgRent: 0, sampleCount: 0, percentDiff: 0, verdict: 'new' },
        };
      }

      const cityKey = (h.city || '').trim().toLowerCase();
      let stat = stats.cbMap.get(`${cityKey}_${h.bedrooms}`);
      if (!stat || stat.count < 2) {
        stat = stats.cMap.get(cityKey);
      }
      const marketStats =
        stat && stat.count >= 2
          ? computeMarketStats(h.rentPrice, stat.avgRent, stat.count - 1)
          : { avgRent: 0, sampleCount: 0, percentDiff: 0, verdict: 'new' };

      return { ...h, isFeaturedActive, marketStats };
    });

    res.status(200).json({
      count: enrichedHouses.length,
      total: totalCount,
      hasMore: pageNum * limitNum < totalCount,
      houses: enrichedHouses,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 3. کسی ایک مکان کی تفصیلات + Views کاؤنٹ + Live Fair Price Meter
export const getHouseById = async (req, res) => {
  try {
    const house = await House.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('owner', 'name phone email isVerified')


    if (!house) return res.status(404).json({ message: 'Property nahi mili!' });

    let marketStats = { avgRent: 0, sampleCount: 0, percentDiff: 0, verdict: 'new' };

    if (house.purpose !== 'sale' && house.rentPrice > 0 && house.city) {
      const escapedCity = house.city.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      let similar = await House.find({
        _id: { $ne: house._id },
        purpose: { $ne: 'sale' },
        city: { $regex: `^${escapedCity}$`, $options: 'i' },
        bedrooms: house.bedrooms,
        rentPrice: { $gt: 0 },
      }).select('rentPrice');

      if (similar.length < 2) {
        similar = await House.find({
          _id: { $ne: house._id },
          purpose: { $ne: 'sale' },
          city: { $regex: `^${escapedCity}$`, $options: 'i' },
          rentPrice: { $gt: 0 },
        }).select('rentPrice');
      }

      if (similar.length > 0) {
        const sum = similar.reduce((acc, item) => acc + item.rentPrice, 0);
        const avgRent = sum / similar.length;
        marketStats = computeMarketStats(house.rentPrice, avgRent, similar.length);
      }
    }

    const isFeaturedActive = Boolean(
      house.isFeatured &&
        house.featuredUntil &&
        new Date(house.featuredUntil).getTime() > Date.now()
    );

    res.status(200).json({ ...house.toObject(), isFeaturedActive, marketStats });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 4. ملتی جلتی پراپرٹیز
export const getSimilarHouses = async (req, res) => {
  try {
    const current = await House.findById(req.params.id).lean();
    if (!current) return res.status(200).json([]);

    const purposeFilter =
      current.purpose === 'sale'
        ? { purpose: 'sale' }
        : { $or: [{ purpose: 'rent' }, { purpose: { $exists: false } }] };

    const escapedCity = (current.city || '').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    let similar = await House.find({
      _id: { $ne: current._id },
      ...purposeFilter,
      ...(escapedCity ? { city: { $regex: escapedCity, $options: 'i' } } : {}),
    })
      .sort({ isFeatured: -1, qualityScore: -1, createdAt: -1 })
      .limit(4)
      .lean();

    if (similar.length < 4) {
      const existingIds = [current._id, ...similar.map((s) => s._id)];
      const fallback = await House.find({
        _id: { $nin: existingIds },
        ...purposeFilter,
      })
        .sort({ isFeatured: -1, qualityScore: -1, createdAt: -1 })
        .limit(4 - similar.length)
        .lean();
      similar = [...similar, ...fallback];
    }

    res.status(200).json(similar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. مکان ڈیلیٹ کرنا (صرف اصل مالک یا Admin)
export const deleteHouse = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) return res.status(404).json({ message: 'Property nahi mili!' });

    const houseOwnerId = house.owner ? house.owner.toString() : null;
    const requesterId = req.user?._id?.toString();
    const isAdminUser = req.user?.role === 'admin';

    if (!isAdminUser && (!houseOwnerId || houseOwnerId !== requesterId)) {
      return res.status(403).json({ message: 'Aap sirf apni property delete kar sakte hain!' });
    }

    await House.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Property delete ho gayi! 🗑️' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. مالک کے اپنے مکانات
export const getMyHouses = async (req, res) => {
  try {
    const houses = await House.find({ owner: req.params.ownerId }).sort({ createdAt: -1 });
    res.status(200).json(houses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. مکان اپڈیٹ کرنا (صرف اصل مالک یا Admin)
export const updateHouse = async (req, res) => {
  try {
    const {
      purpose, propertyType,
      title, description,
      rentPrice, pricePerDay, pricePerYear, availableFor,
      salePrice, areaSize, areaUnit, isNegotiable, possessionStatus, installmentAvailable,
      suitableFor, availableFrom, availableTo, videoUrl,
      city, address, bedrooms, bathrooms, images,
      isShared, totalBeds, pricePerPerson, sharedGender,
      utilities, nearLandmark,
    } = req.body;

    const house = await House.findById(req.params.id);
    if (!house) return res.status(404).json({ message: 'Property nahi mili!' });

    const houseOwnerId = house.owner ? house.owner.toString() : null;
    const requesterId = req.user?._id?.toString();
    const isAdminUser = req.user?.role === 'admin';

    if (!isAdminUser && (!houseOwnerId || houseOwnerId !== requesterId)) {
      return res.status(403).json({ message: 'Aap sirf apni property edit kar sakte hain!' });
    }

    const updatedPurpose = purpose || house.purpose || 'rent';
    const updatedRent = rentPrice !== undefined ? Number(rentPrice) || 0 : house.rentPrice;
    const updatedShared =
      updatedPurpose === 'rent'
        ? isShared !== undefined
          ? Boolean(isShared)
          : house.isShared
        : false;
    const updatedBeds = totalBeds !== undefined ? Number(totalBeds) || 1 : house.totalBeds;
    const updatedPerPerson = updatedShared
      ? pricePerPerson !== undefined
        ? Number(pricePerPerson)
        : Math.round(updatedRent / Math.max(updatedBeds, 1))
      : 0;

    const finalImages = images?.length ? images : house.images;
    const finalVideo = videoUrl !== undefined ? videoUrl : house.videoUrl;
    const finalUtilities = utilities !== undefined ? utilities : house.utilities;
    const finalLandmark = nearLandmark !== undefined ? nearLandmark : house.nearLandmark;
    const finalArea = areaSize !== undefined ? areaSize : house.areaSize;

    const qualityScore = computeQualityScore({
      images: finalImages,
      videoUrl: finalVideo,
      utilities: finalUtilities,
      nearLandmark: finalLandmark,
      description: description || house.description,
      areaSize: finalArea,
      averageRating: house.averageRating,
      totalReviews: house.totalReviews,
    });

    const updated = await House.findByIdAndUpdate(
      req.params.id,
      {
        purpose: updatedPurpose,
        propertyType: propertyType || house.propertyType,
        title,
        description,
        rentPrice: updatedPurpose === 'sale' ? 0 : updatedRent,
        pricePerDay: updatedPurpose === 'sale' ? 0 : Number(pricePerDay) || 0,
        pricePerYear: updatedPurpose === 'sale' ? 0 : Number(pricePerYear) || 0,
        availableFor: updatedPurpose === 'sale' ? [] : availableFor,
        salePrice: salePrice !== undefined ? Number(salePrice) || 0 : house.salePrice,
        areaSize: finalArea,
        areaUnit: areaUnit || house.areaUnit,
        isNegotiable: isNegotiable !== undefined ? Boolean(isNegotiable) : house.isNegotiable,
        possessionStatus: possessionStatus || house.possessionStatus,
        installmentAvailable:
          installmentAvailable !== undefined ? Boolean(installmentAvailable) : house.installmentAvailable,
        suitableFor,
        availableFrom: availableFrom ? new Date(availableFrom) : house.availableFrom,
        availableTo: availableTo ? new Date(availableTo) : house.availableTo,
        videoUrl: finalVideo,
        city,
        address,
        bedrooms: bedrooms !== undefined ? Number(bedrooms) || 0 : house.bedrooms,
        bathrooms: bathrooms !== undefined ? Number(bathrooms) || 0 : house.bathrooms,
        images: finalImages,
        isShared: updatedShared,
        totalBeds: updatedBeds,
        pricePerPerson: updatedPerPerson,
        sharedGender: sharedGender || house.sharedGender,
        utilities: finalUtilities,
        nearLandmark: finalLandmark,
        qualityScore,
      },
      { new: true }
    );

    res.status(200).json({ message: 'Property kamyabi se update ho gayi! ✏️', house: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 8. مفت وزٹ کی درخواست (بغیر کسی پیشگی پیمنٹ کے)
export const requestFreeVisit = async (req, res) => {
  try {
    const { name, phone, visitDate, visitTime, note } = req.body;
    if (!name || !phone || !visitDate) {
      return res.status(400).json({ message: 'Name, phone and visit date are required!' });
    }

    const house = await House.findById(req.params.id).populate('owner', 'name phone');
    if (!house) return res.status(404).json({ message: 'Property nahi mili!' });

    if (house.owner?._id) {
      try {
        await Notification.create({
          user: house.owner._id,
          sender: req.user?._id || null,
          title: `📅 Free Visit Request: ${house.title}`,
          message: `${name} (${phone}) wants to visit on ${visitDate}${visitTime ? ` (${visitTime})` : ''}.${note ? ` Note: ${note}` : ''}`,
          type: 'system',
          link: `/house/${house._id}`,
          isRead: false,
        });
      } catch {
        // ignore notification error
      }
    }

    res.status(200).json({
      message: 'Visit request sent to owner! They will contact you shortly. 📅✅',
      ownerPhone: house.owner?.phone || '',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};