import TenantRequest from '../models/TenantRequest.js';

// 1. کرایہ دار اپنی ڈیمانڈ پوسٹ کرے گا (Post Requirement)
export const createTenantRequest = async (req, res) => {
  try {
    const { tenantId, city, area, budgetMin, budgetMax, bedrooms, tenantType, familyMembers, moveInDate, description } = req.body;

    const newRequest = await TenantRequest.create({
      tenant: tenantId,
      city,
      area,
      budgetMin: Number(budgetMin),
      budgetMax: Number(budgetMax),
      bedrooms: Number(bedrooms),
      tenantType,
      familyMembers: Number(familyMembers),
      moveInDate: new Date(moveInDate),
      description,
    });

    res.status(201).json({ message: 'Demand posted successfully! Landlords will now contact you 🎉', request: newRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. تمام متلاشی افراد کی ڈیمانڈز دیکھنا (Public Feed)
export const getAllTenantRequests = async (req, res) => {
  try {
    const { city } = req.query;
    let query = { status: 'active' };
    if (city && city.trim() !== '') {
      query.city = { $regex: city.trim(), $options: 'i' };
    }

    const requests = await TenantRequest.find(query)
      .populate('tenant', 'name phone email')
      .populate({
        path: 'offers.landlord',
        select: 'name phone email',
      })
      .populate({
        path: 'offers.house',
        select: 'title rentPrice city address images',
      })
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. مالک مکان کی طرف سے کرایہ دار کو گھر کی آفر بھیجنا
export const sendPropertyOffer = async (req, res) => {
  try {
    const { requestId, landlordId, houseId, offeredRent, message } = req.body;

    const request = await TenantRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found!' });

    request.offers.push({
      landlord: landlordId,
      house: houseId,
      offeredRent: Number(offeredRent),
      message,
    });

    await request.save();
    res.status(200).json({ message: 'Your property offer has been sent to the tenant! 🏠📩' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};