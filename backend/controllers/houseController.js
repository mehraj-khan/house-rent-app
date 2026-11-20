import House from '../models/House.js';

// مددگار فنکشن: مارکیٹ ریٹ موازنہ نکالنے کے لیے
const computeMarketStats = (rentPrice, avgRent, sampleCount) => {
  if (!rentPrice || rentPrice <= 0 || !avgRent || avgRent <= 0 || sampleCount < 1) {
    return { avgRent: 0, sampleCount: 0, percentDiff: 0, verdict: 'new' };
  }
  const roundedAvg = Math.round(avgRent);
  const percentDiff = Math.round(((rentPrice - roundedAvg) / roundedAvg) * 100);
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

// 1. نیا گھر شامل کرنا
export const addHouse = async (req, res) => {
  try {
    const { 
      title, description, rentPrice, pricePerDay, pricePerYear, 
      availableFor, suitableFor, availableFrom, availableTo, videoUrl, 
      city, address, bedrooms, bathrooms, images, owner,
      isShared, totalBeds, pricePerPerson, sharedGender,
      utilities, nearLandmark
    } = req.body;

    const numericRent = Number(rentPrice) || 0;
    const numericBeds = isShared ? Math.max(Number(totalBeds) || 2, 1) : 1;
    const calculatedPerPerson = isShared
      ? Number(pricePerPerson) || (numericRent > 0 ? Math.round(numericRent / numericBeds) : 0)
      : 0;

    const newHouse = await House.create({
      title,
      description,
      rentPrice: numericRent,
      pricePerDay: Number(pricePerDay) || 0,
      pricePerYear: Number(pricePerYear) || 0,
      availableFor: availableFor || ['monthly'],
      suitableFor: suitableFor || 'both',
      availableFrom: availableFrom ? new Date(availableFrom) : null,
      availableTo: availableTo ? new Date(availableTo) : null,
      videoUrl: videoUrl || '',
      city,
      address,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      images,
      owner,
      isShared: Boolean(isShared),
      totalBeds: numericBeds,
      pricePerPerson: calculatedPerPerson,
      sharedGender: sharedGender || 'any',
      utilities: {
        separateMeter: Boolean(utilities?.separateMeter),
        solarOrUps: Boolean(utilities?.solarOrUps),
        suiGas: Boolean(utilities?.suiGas),
        water24x7: Boolean(utilities?.water24x7),
        wifi: Boolean(utilities?.wifi),
        parking: Boolean(utilities?.parking),
      },
      nearLandmark: nearLandmark || '',
    });

    res.status(201).json({ message: 'Ghar kamyabi se list ho gaya hai! 🏠', house: newHouse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. تمام گھروں کی لسٹ (فلٹرز + لائیو مارکیٹ ریٹ بیج کے ساتھ)
export const getAllHouses = async (req, res) => {
  try {
    const {
      city, search, maxPrice, rentType, bedrooms, suitableFor,
      isShared, sharedGender, separateMeter, solarOrUps, suiGas, wifi
    } = req.query;

    let query = {};
    let andConditions = [];

    const keyword = search || city;
    if (keyword && keyword.trim() !== '') {
      andConditions.push({
        $or: [
          { city: { $regex: keyword.trim(), $options: 'i' } },
          { address: { $regex: keyword.trim(), $options: 'i' } },
          { title: { $regex: keyword.trim(), $options: 'i' } },
          { description: { $regex: keyword.trim(), $options: 'i' } },
          { nearLandmark: { $regex: keyword.trim(), $options: 'i' } },
        ],
      });
    }

    if (rentType && rentType !== 'all') query.availableFor = rentType;
    if (bedrooms && bedrooms !== 'all') query.bedrooms = { $gte: Number(bedrooms) };
    if (suitableFor && suitableFor !== 'all') query.suitableFor = { $in: [suitableFor, 'both'] };

    if (isShared === 'true') query.isShared = true;
    if (sharedGender && sharedGender !== 'all') {
      query.sharedGender = { $in: [sharedGender, 'any'] };
    }

    // ⚡ یوٹیلیٹی فلٹرز
    if (separateMeter === 'true') query['utilities.separateMeter'] = true;
    if (solarOrUps === 'true') query['utilities.solarOrUps'] = true;
    if (suiGas === 'true') query['utilities.suiGas'] = true;
    if (wifi === 'true') query['utilities.wifi'] = true;

    if (maxPrice) {
      const limit = Number(maxPrice);
      if (rentType === 'daily') {
        query.pricePerDay = { $lte: limit, $gt: 0 };
      } else if (isShared === 'true') {
        andConditions.push({
          $or: [
            { pricePerPerson: { $gt: 0, $lte: limit } },
            { rentPrice: { $lte: limit } },
          ],
        });
      } else {
        query.rentPrice = { $lte: limit };
      }
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const [houses, cityBedroomStats, cityOnlyStats] = await Promise.all([
      House.find(query).populate('owner', 'name phone email').sort({ createdAt: -1 }).lean(),
      House.aggregate([
        { $match: { rentPrice: { $gt: 0 } } },
        {
          $group: {
            _id: { city: { $toLower: '$city' }, bedrooms: '$bedrooms' },
            avgRent: { $avg: '$rentPrice' },
            count: { $sum: 1 },
          },
        },
      ]),
      House.aggregate([
        { $match: { rentPrice: { $gt: 0 } } },
        {
          $group: {
            _id: { $toLower: '$city' },
            avgRent: { $avg: '$rentPrice' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const cbMap = new Map(cityBedroomStats.map(s => [`${s._id.city}_${s._id.bedrooms}`, s]));
    const cMap = new Map(cityOnlyStats.map(s => [s._id, s]));

    const enrichedHouses = houses.map(h => {
      const cityKey = (h.city || '').trim().toLowerCase();
      let stat = cbMap.get(`${cityKey}_${h.bedrooms}`);
      if (!stat || stat.count < 2) {
        stat = cMap.get(cityKey);
      }
      const marketStats =
        stat && stat.count >= 2
          ? computeMarketStats(h.rentPrice, stat.avgRent, stat.count - 1)
          : { avgRent: 0, sampleCount: 0, percentDiff: 0, verdict: 'new' };

      return { ...h, marketStats };
    });

    res.status(200).json({ count: enrichedHouses.length, houses: enrichedHouses });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 3. کسی ایک مکان کی تفصیلات + Live Fair Price Meter لانا
export const getHouseById = async (req, res) => {
  try {
    const house = await House.findById(req.params.id).populate('owner', 'name phone email');
    if (!house) return res.status(404).json({ message: 'Ghar nahi mila!' });

    let marketStats = { avgRent: 0, sampleCount: 0, percentDiff: 0, verdict: 'new' };

    if (house.rentPrice > 0 && house.city) {
      const escapedCity = house.city.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      let similar = await House.find({
        _id: { $ne: house._id },
        city: { $regex: `^${escapedCity}$`, $options: 'i' },
        bedrooms: house.bedrooms,
        rentPrice: { $gt: 0 },
      }).select('rentPrice');

      if (similar.length < 2) {
        similar = await House.find({
          _id: { $ne: house._id },
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

    res.status(200).json({ ...house.toObject(), marketStats });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 4. مکان ڈیلیٹ کرنا
export const deleteHouse = async (req, res) => {
  try {
    const { userId } = req.body;
    const house = await House.findById(req.params.id);
    if (!house) return res.status(404).json({ message: 'Ghar nahi mila!' });

    const houseOwnerId = house.owner ? house.owner.toString() : null;
    if (houseOwnerId && userId && houseOwnerId !== userId.toString()) {
      return res.status(403).json({ message: 'Aap sirf apna ghar delete kar sakte hain!' });
    }

    await House.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Ghar delete ho gaya! 🗑️' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. مالک کے اپنے مکانات
export const getMyHouses = async (req, res) => {
  try {
    const houses = await House.find({ owner: req.params.ownerId });
    res.status(200).json(houses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. مکان اپڈیٹ کرنا
export const updateHouse = async (req, res) => {
  try {
    const { 
      title, description, rentPrice, pricePerDay, pricePerYear, 
      availableFor, suitableFor, availableFrom, availableTo, videoUrl, 
      city, address, bedrooms, bathrooms, images, userId,
      isShared, totalBeds, pricePerPerson, sharedGender,
      utilities, nearLandmark
    } = req.body;

    const house = await House.findById(req.params.id);
    if (!house) return res.status(404).json({ message: 'Ghar nahi mila!' });

    const houseOwnerId = house.owner ? house.owner.toString() : null;
    if (houseOwnerId && userId && houseOwnerId !== userId.toString()) {
      return res.status(403).json({ message: 'Aap sirf apna ghar edit kar sakte hain!' });
    }

    const updatedRent = rentPrice !== undefined ? Number(rentPrice) || 0 : house.rentPrice;
    const updatedShared = isShared !== undefined ? Boolean(isShared) : house.isShared;
    const updatedBeds = totalBeds !== undefined ? Number(totalBeds) || 1 : house.totalBeds;
    const updatedPerPerson = updatedShared
      ? (pricePerPerson !== undefined ? Number(pricePerPerson) : Math.round(updatedRent / Math.max(updatedBeds, 1)))
      : 0;

    const updated = await House.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        rentPrice: updatedRent,
        pricePerDay: Number(pricePerDay) || 0,
        pricePerYear: Number(pricePerYear) || 0,
        availableFor,
        suitableFor,
        availableFrom: availableFrom ? new Date(availableFrom) : house.availableFrom,
        availableTo: availableTo ? new Date(availableTo) : house.availableTo,
        videoUrl: videoUrl !== undefined ? videoUrl : house.videoUrl,
        city,
        address,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        images: images?.length ? images : house.images,
        isShared: updatedShared,
        totalBeds: updatedBeds,
        pricePerPerson: updatedPerPerson,
        sharedGender: sharedGender || house.sharedGender,
        utilities: utilities !== undefined ? utilities : house.utilities,
        nearLandmark: nearLandmark !== undefined ? nearLandmark : house.nearLandmark,
      },
      { new: true }
    );

    res.status(200).json({ message: 'Ghar kamyabi se update ho gaya! ✏️', house: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};