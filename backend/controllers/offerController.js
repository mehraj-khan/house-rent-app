import Offer from '../models/Offer.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import House from '../models/House.js';
import { sendNewMessageEmail } from '../utils/sendEmail.js';

// 1. کرایہ دار کی طرف سے نئی آفر بھیجنا
export const createOffer = async (req, res) => {
  try {
    const {
      houseId, tenantId, landlordId, rentType,
      checkIn, checkOut, durationCount, originalRent, offeredRent, note
    } = req.body;

    if (!houseId || !tenantId || !landlordId || !offeredRent || Number(offeredRent) <= 0) {
      return res.status(400).json({ message: 'Valid offer amount and details are required!' });
    }

    if (String(tenantId) === String(landlordId)) {
      return res.status(400).json({ message: 'You cannot make an offer on your own property!' });
    }

    const offer = await Offer.create({
      house: houseId,
      tenant: tenantId,
      landlord: landlordId,
      rentType: rentType || 'monthly',
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      durationCount: Number(durationCount) || 1,
      originalRent: Number(originalRent) || 0,
      offeredRent: Number(offeredRent),
      lastActionBy: 'tenant',
      note: note || '',
      status: 'pending',
    });

    // 🔔 مالک مکان کو بیل نوٹیفیکیشن + ای میل بھیجیں
    try {
      const [tenantUser, landlordUser, houseDoc] = await Promise.all([
        User.findById(tenantId).select('name'),
        User.findById(landlordId).select('name email'),
        House.findById(houseId).select('title'),
      ]);

      const tName = tenantUser?.name || 'A Tenant';
      const hTitle = houseDoc?.title || 'your property';
      const msg = `${tName} offered PKR ${Number(offeredRent).toLocaleString()} for "${hTitle}"`;

      await Notification.create({
        user: landlordId,
        sender: tenantId,
        title: '🤝 New Rent Offer Received!',
        message: msg,
        type: 'booking',
        link: '/offers',
        isRead: false,
      });

      if (landlordUser?.email) {
        await sendNewMessageEmail({
          toEmail: landlordUser.email,
          toName: landlordUser.name,
          senderName: tName,
          text: `${msg}${note ? ` — Note: "${note}"` : ''}. Open Offers page to Accept or Counter-Offer!`,
          contextTitle: hTitle,
        });
      }
    } catch {
      // ignore notification errors
    }

    res.status(201).json({ message: 'Offer sent to Host! 🤝', offer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. یوزر کی موصول شدہ اور بھیجی گئی تمام آفرز لانا
export const getUserOffers = async (req, res) => {
  try {
    const { userId } = req.params;

    const [received, sent] = await Promise.all([
      Offer.find({ landlord: userId })
        .populate('house', 'title city address images rentPrice')
        .populate('tenant', 'name email phone')
        .sort({ updatedAt: -1 }),
      Offer.find({ tenant: userId })
        .populate('house', 'title city address images rentPrice')
        .populate('landlord', 'name email phone')
        .sort({ updatedAt: -1 }),
    ]);

    res.status(200).json({ received, sent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. آفر قبول، مسترد یا کاؤنٹر آفر کرنا
export const respondToOffer = async (req, res) => {
  try {
    const { action, userId, counterRent, note } = req.body;
    const offer = await Offer.findById(req.params.id).populate('house', 'title');
    if (!offer) return res.status(404).json({ message: 'Offer not found!' });

    const isLandlord = String(offer.landlord) === String(userId);
    const isTenant = String(offer.tenant) === String(userId);
    if (!isLandlord && !isTenant) {
      return res.status(403).json({ message: 'Not authorized!' });
    }

    const otherUserId = isLandlord ? offer.tenant : offer.landlord;
    const activeAmount = offer.counterRent > 0 ? offer.counterRent : offer.offeredRent;
    let notifTitle = '';
    let notifMsg = '';

    if (action === 'accept') {
      offer.status = 'accepted';
      offer.finalAgreedRent = activeAmount;
      notifTitle = '✅ Rent Offer Accepted!';
      notifMsg = `Agreed rent PKR ${activeAmount.toLocaleString()} for "${offer.house?.title}". Complete Escrow payment now!`;
    } else if (action === 'counter') {
      if (!counterRent || Number(counterRent) <= 0) {
        return res.status(400).json({ message: 'Please enter a valid counter offer amount!' });
      }
      offer.status = 'countered';
      offer.counterRent = Number(counterRent);
      offer.lastActionBy = isLandlord ? 'landlord' : 'tenant';
      if (note !== undefined) offer.note = note;
      notifTitle = '💬 New Counter-Offer!';
      notifMsg = `Counter-offer of PKR ${Number(counterRent).toLocaleString()} for "${offer.house?.title}"`;
    } else if (action === 'reject') {
      offer.status = 'rejected';
      notifTitle = '❌ Offer Declined';
      notifMsg = `Offer for "${offer.house?.title}" was declined.`;
    } else {
      return res.status(400).json({ message: 'Invalid action!' });
    }

    await offer.save();

    await Notification.create({
      user: otherUserId,
      sender: userId,
      title: notifTitle,
      message: notifMsg,
      type: 'booking',
      link: '/offers',
      isRead: false,
    }).catch(() => {});

    res.status(200).json({ message: 'Offer updated!', offer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. بکنگ مکمل ہونے پر آفر کو booked مارک کرنا
export const markOfferBooked = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      { status: 'booked' },
      { new: true }
    );
    res.status(200).json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};