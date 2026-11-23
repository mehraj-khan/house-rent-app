import TenantRequest from '../models/TenantRequest.js';
import Notification from '../models/Notification.js';

// 1. کرایہ دار اپنی ڈیمانڈ پوسٹ کرے گا (Post Requirement)
export const createTenantRequest = async (req, res) => {
  try {
    const {
      tenantId,
      city,
      area,
      budgetMin,
      budgetMax,
      bedrooms,
      tenantType,
      familyMembers,
      moveInDate,
      description,
    } = req.body;

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
      status: 'active',
    });

    res.status(201).json({
      message: 'Demand posted successfully! Landlords will now contact you 🎉',
      request: newRequest,
    });
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

// 3. مالک مکان کی طرف سے کرایہ دار کو گھر کی آفر بھیجنا + نوٹیفیکیشن
export const sendPropertyOffer = async (req, res) => {
  try {
    const { requestId, landlordId, houseId, offeredRent, message } = req.body;

    const request = await TenantRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found!' });

    // چیک کریں کہ اسی مالک نے یہی گھر پہلے سے آفر تو نہیں کیا
    const alreadyOffered = request.offers.some(
      (o) =>
        String(o.landlord) === String(landlordId) &&
        String(o.house) === String(houseId)
    );
    if (alreadyOffered) {
      return res
        .status(400)
        .json({ message: 'You have already offered this property for this demand!' });
    }

    request.offers.push({
      landlord: landlordId,
      house: houseId,
      offeredRent: Number(offeredRent),
      message,
    });

    await request.save();

    // کرایہ دار کو Navbar Bell پر نوٹیفیکیشن بھیجیں
    try {
      await Notification.create({
        user: request.tenant, // ⚠️ اگر آپ کے Notification ماڈل میں recipient ہے تو recipient لکھیں
        title: '🏠 New Matching House Offer!',
        message: `A landlord offered a house for PKR ${Number(offeredRent).toLocaleString()}/mo in ${request.area}, ${request.city}.`,
        link: '/wanted',
        isRead: false,
      });
    } catch (notifErr) {
      console.error('Notification error (ignored):', notifErr.message);
    }

    res.status(200).json({
      message: 'Your property offer has been sent to the tenant! 🏠📩',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};