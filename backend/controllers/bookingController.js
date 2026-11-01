import Booking from '../models/Booking.js';
import House from '../models/House.js';

// 1. نیا ٹوکن جمع کرانا (تاریخوں کی ڈبل بکنگ چیک کرنے کے ساتھ)
export const createBooking = async (req, res) => {
  try {
    const { houseId, tenantId, landlordId, rentType, checkIn, checkOut, durationCount, totalAmount, platformFee, landlordAmount, paymentMethod, transactionId } = req.body;

    const newStart = new Date(checkIn);
    const newEnd = new Date(checkOut);

    // 🔍 چیک کریں کہ کیا ان تاریخوں میں یہ ہوٹل/کمرہ پہلے سے تو بک نہیں ہے؟
    const existingConflict = await Booking.findOne({
      house: houseId,
      status: { $in: ['confirmed', 'holding_escrow', 'tenant_approved', 'landlord_paid'] },
      $or: [
        { checkIn: { $lt: newEnd }, checkOut: { $gt: newStart } }
      ]
    });

    if (existingConflict) {
      return res.status(400).json({
        message: 'Yeh dates pehle se booked hain! Baraye meherbani doosri dates select karein.'
      });
    }

    const newBooking = await Booking.create({
      house: houseId,
      tenant: tenantId,
      landlord: landlordId,
      rentType,
      checkIn: newStart,
      checkOut: newEnd,
      durationCount,
      totalAmount,
      platformFee,
      landlordAmount,
      paymentMethod,
      transactionId,
      status: 'pending_admin',
    });

    res.status(201).json({ message: 'Booking submitted successfully! 🎉', booking: newBooking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. کسی مکان کی پہلے سے بک شدہ تمام تاریخیں حاصل کرنا
export const getBookedDates = async (req, res) => {
  try {
    const { houseId } = req.params;
    const activeBookings = await Booking.find({
      house: houseId,
      status: { $in: ['confirmed', 'holding_escrow', 'tenant_approved', 'landlord_paid'] },
      checkOut: { $gte: new Date() } // جو تاریخیں ابھی آنی ہیں
    }).select('checkIn checkOut');

    res.status(200).json(activeBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. دیگر مینیجمنٹ کنٹرولرز
export const getLandlordBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ landlord: req.params.landlordId })
      .populate('house', 'title address city rentPrice images')
      .populate('tenant', 'name phone email')
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTenantBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ tenant: req.params.tenantId })
      .populate('house', 'title address city rentPrice images')
      .populate('landlord', 'name phone email')
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('house', 'title address city rentPrice')
      .populate('tenant', 'name phone email')
      .populate('landlord', 'name phone email')
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking nahi mili!' });

    booking.status = status;
    await booking.save();
    res.status(200).json({ message: `Updated to ${status}`, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};