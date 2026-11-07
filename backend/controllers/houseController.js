import House from '../models/House.js';

// 1. نیا گھر شامل کرنا
export const addHouse = async (req, res) => {
  try {
    const { title, description, rentPrice, pricePerDay, pricePerYear, availableFor, suitableFor,availableFrom,availableTo, city, address, bedrooms, bathrooms, images, owner } = req.body;

    const newHouse = await House.create({
      title,
      description,
      rentPrice: Number(rentPrice) || 0,
      pricePerDay: Number(pricePerDay) || 0,
      pricePerYear: Number(pricePerYear) || 0,
      availableFor: availableFor || ['monthly'],
      suitableFor: suitableFor || 'both',
      availableFrom: availableFrom ? new Date(availableFrom) : null,
      availableTo: availableTo ? new Date(availableTo) : null,
      city,
      address,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      images,
      owner,
    });

    res.status(201).json({ message: 'Ghar kamyabi se list ho gaya hai! 🏠', house: newHouse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. تمام گھروں کی لسٹ (فلٹرز کے ساتھ)
// 2. تمام گھروں کی لسٹ (شہر، علاقہ، پتہ اور سوسائٹی کے ہمہ گیر سرچ کے ساتھ)
export const getAllHouses = async (req, res) => {
  try {
    const { city, search, maxPrice, rentType, bedrooms, suitableFor } = req.query;
    let query = {};

    // 🔍 اگر یوزر نے کوئی بھی شہر، علاقہ یا محلہ بولا یا لکھا ہو
    const keyword = search || city;
    if (keyword && keyword.trim() !== '') {
      query.$or = [
        { city: { $regex: keyword.trim(), $options: 'i' } },        // شہر میں تلاش کرے
        { address: { $regex: keyword.trim(), $options: 'i' } },     // پتہ / سوسائٹی (DHA, Bahria وغیرہ) میں تلاش کرے
        { title: { $regex: keyword.trim(), $options: 'i' } },       // ٹائٹل میں تلاش کرے
        { description: { $regex: keyword.trim(), $options: 'i' } }, // تفصیلات میں تلاش کرے
      ];
    }

    if (rentType && rentType !== 'all') query.availableFor = rentType;
    if (bedrooms && bedrooms !== 'all') query.bedrooms = { $gte: Number(bedrooms) };
    if (suitableFor && suitableFor !== 'all') query.suitableFor = { $in: [suitableFor, 'both'] };

    if (maxPrice) {
      if (rentType === 'daily') {
        query.pricePerDay = { $lte: Number(maxPrice), $gt: 0 };
      } else {
        query.rentPrice = { $lte: Number(maxPrice) };
      }
    }

    const houses = await House.find(query).populate('owner', 'name phone email').sort({ createdAt: -1 });
    res.status(200).json({ count: houses.length, houses });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 3. دیگر کنٹرولرز ویسے ہی رہیں گے
export const getHouseById = async (req, res) => {
  try {
    const house = await House.findById(req.params.id).populate('owner', 'name phone email');
    if (!house) return res.status(404).json({ message: 'Ghar nahi mila!' });
    res.status(200).json(house);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

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

export const getMyHouses = async (req, res) => {
  try {
    const houses = await House.find({ owner: req.params.ownerId });
    res.status(200).json(houses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHouse = async (req, res) => {
  try {
    const { title, description, rentPrice, pricePerDay, pricePerYear, availableFor, suitableFor, city, address, bedrooms, bathrooms, images, userId } = req.body;
    const house = await House.findById(req.params.id);
    if (!house) return res.status(404).json({ message: 'Ghar nahi mila!' });

    const houseOwnerId = house.owner ? house.owner.toString() : null;
    if (houseOwnerId && userId && houseOwnerId !== userId.toString()) {
      return res.status(403).json({ message: 'Aap sirf apna ghar edit kar sakte hain!' });
    }

    const updated = await House.findByIdAndUpdate(
      req.params.id,
      {
        title, description, rentPrice: Number(rentPrice), pricePerDay: Number(pricePerDay) || 0,
        pricePerYear: Number(pricePerYear) || 0, availableFor, suitableFor, city, address,
        bedrooms: Number(bedrooms), bathrooms: Number(bathrooms), images: images?.length ? images : house.images
      },
      { new: true }
    );

    res.status(200).json({ message: 'Updated!', house: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};