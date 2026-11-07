import House from '../models/House.js';

// 1. نیا گھر شامل کرنا (تمام جدید فیلڈز اور ویڈیو لنک کے ساتھ)
export const addHouse = async (req, res) => {
  try {
    const { 
      title, description, rentPrice, pricePerDay, pricePerYear, 
      availableFor, suitableFor, availableFrom, availableTo, videoUrl, 
      city, address, bedrooms, bathrooms, images, owner 
    } = req.body;

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
      videoUrl: videoUrl || '', // 🎥 ویڈیو لنک
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

// 2. تمام گھروں کی لسٹ (شہر، علاقہ، پتہ، سوسائٹی اور کیٹیگری فلٹرز کے ساتھ)
export const getAllHouses = async (req, res) => {
  try {
    const { city, search, maxPrice, rentType, bedrooms, suitableFor } = req.query;
    let query = {};

    // 🔍 ملٹی فیلڈ ہمہ گیر سرچ (City, Address, Title, Description)
    const keyword = search || city;
    if (keyword && keyword.trim() !== '') {
      query.$or = [
        { city: { $regex: keyword.trim(), $options: 'i' } },
        { address: { $regex: keyword.trim(), $options: 'i' } },
        { title: { $regex: keyword.trim(), $options: 'i' } },
        { description: { $regex: keyword.trim(), $options: 'i' } },
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

// 3. کسی ایک مکان کی تفصیلات لانا
export const getHouseById = async (req, res) => {
  try {
    const house = await House.findById(req.params.id).populate('owner', 'name phone email');
    if (!house) return res.status(404).json({ message: 'Ghar nahi mila!' });
    res.status(200).json(house);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 4. محفوظ طریقے سے مکان ڈیلیٹ کرنا (صرف اصل مالک کر سکتا ہے)
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

// 5. کسی ایک مالک کے اپنے تمام مکانات لانا (Dashboard)
export const getMyHouses = async (req, res) => {
  try {
    const houses = await House.find({ owner: req.params.ownerId });
    res.status(200).json(houses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. مکان کی تفصیلات ایڈٹ / اپڈیٹ کرنا (ویڈیو اور تاریخوں کے ساتھ)
export const updateHouse = async (req, res) => {
  try {
    const { 
      title, description, rentPrice, pricePerDay, pricePerYear, 
      availableFor, suitableFor, availableFrom, availableTo, videoUrl, 
      city, address, bedrooms, bathrooms, images, userId 
    } = req.body;

    const house = await House.findById(req.params.id);
    if (!house) return res.status(404).json({ message: 'Ghar nahi mila!' });

    const houseOwnerId = house.owner ? house.owner.toString() : null;
    if (houseOwnerId && userId && houseOwnerId !== userId.toString()) {
      return res.status(403).json({ message: 'Aap sirf apna ghar edit kar sakte hain!' });
    }

    const updated = await House.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        rentPrice: Number(rentPrice) || 0,
        pricePerDay: Number(pricePerDay) || 0,
        pricePerYear: Number(pricePerYear) || 0,
        availableFor,
        suitableFor,
        availableFrom: availableFrom ? new Date(availableFrom) : house.availableFrom,
        availableTo: availableTo ? new Date(availableTo) : house.availableTo,
        videoUrl: videoUrl !== undefined ? videoUrl : house.videoUrl, // 👈 ویڈیو اپڈیٹ
        city,
        address,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        images: images?.length ? images : house.images
      },
      { new: true }
    );

    res.status(200).json({ message: 'Ghar kamyabi se update ho gaya! ✏️', house: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};