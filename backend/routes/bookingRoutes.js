import express from 'express';
import {
  createBooking,
  getBookedDates, // 👈 امپورٹ کیا
  getLandlordBookings,
  getTenantBookings,
  getAllBookings,
  updateBookingStatus,
} from '../controllers/bookingController.js';

const router = express.Router();

router.post('/create', createBooking);
router.get('/booked-dates/:houseId', getBookedDates); // 👈 بک شدہ تاریخوں کا راستہ
router.get('/all', getAllBookings);
router.get('/landlord/:landlordId', getLandlordBookings);
router.get('/tenant/:tenantId', getTenantBookings);
router.put('/:id/status', updateBookingStatus);

export default router;