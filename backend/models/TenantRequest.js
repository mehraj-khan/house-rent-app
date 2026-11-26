import mongoose from 'mongoose';

const tenantRequestSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    city: { type: String, required: true },
    area: { type: String, required: true }, // سوسائٹی یا محلہ (DHA, Bahria وغیرہ)
    budgetMin: { type: Number, required: true },
    budgetMax: { type: Number, required: true },
    bedrooms: { type: Number, required: true },
    tenantType: { type: String, enum: ['family', 'bachelors'], default: 'family' },
    familyMembers: { type: Number, default: 3 },
    moveInDate: { type: Date, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['active', 'closed'], default: 'active' },

    purpose: { type: String, enum: ['rent', 'sale'], default: 'rent' },
    propertyType: { type: String, default: 'house' },
    areaSize: { type: String, default: '' },
    areaUnit: { type: String, default: 'Marla' },


    // 📩 مالکان کی طرف سے آنے والی آفرز
    offers: [
      {
        landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        house: { type: mongoose.Schema.Types.ObjectId, ref: 'House' },
        offeredRent: { type: Number, required: true },
        message: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const TenantRequest = mongoose.model('TenantRequest', tenantRequestSchema);
export default TenantRequest;