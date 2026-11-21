import House from '../models/House.js';
import Requirement from '../models/Requirement.js';

// 1. کسی گھر کے لیے انتظار کرنے والے میچنگ کرایہ دار / طلباء ڈھونڈنا (Host کے لیے)
export const getMatchesForHouse = async (req, res) => {
  try {
    const house = await House.findById(req.params.houseId);
    if (!house) return res.status(404).json({ message: 'House not found!' });

    const effectiveRent =
      house.isShared && house.pricePerPerson > 0 ? house.pricePerPerson : house.rentPrice;

    const escapedCity = (house.city || '').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const candidates = await Requirement.find({
      user: { $ne: house.owner },
      ...(escapedCity ? { city: { $regex: escapedCity, $options: 'i' } } : {}),
    })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const scored = candidates
      .map((reqPost) => {
        let score = 45; // Same city match
        if (effectiveRent > 0 && reqPost.maxBudget >= effectiveRent) score += 35;
        else if (effectiveRent > 0 && reqPost.maxBudget >= effectiveRent * 0.85) score += 20;

        if (house.isShared && reqPost.type === 'need_room') score += 10;
        if (
          reqPost.gender === 'any' ||
          (house.isShared && house.sharedGender === reqPost.gender) ||
          (house.suitableFor === 'family' && reqPost.gender === 'family') ||
          (house.suitableFor !== 'family' && (reqPost.gender === 'boys' || reqPost.gender === 'girls'))
        ) {
          score += 10;
        }

        return {
          ...reqPost.toObject(),
          matchPercent: Math.min(score, 99),
        };
      })
      .filter((item) => item.matchPercent >= 65)
      .sort((a, b) => b.matchPercent - a.matchPercent)
      .slice(0, 10);

    res.status(200).json(scored);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. کسی Roommate / Need-a-Room پوسٹ کے لیے میچنگ گھر ڈھونڈنا
export const getMatchesForRequirement = async (req, res) => {
  try {
    const reqPost = await Requirement.findById(req.params.requirementId);
    if (!reqPost) return res.status(404).json({ message: 'Post not found!' });

    const escapedCity = (reqPost.city || '').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const houses = await House.find({
      isAvailable: true,
      ...(escapedCity ? { city: { $regex: escapedCity, $options: 'i' } } : {}),
    })
      .populate('owner', 'name phone')
      .sort({ createdAt: -1 });

    const scored = houses
      .map((h) => {
        const effectiveRent = h.isShared && h.pricePerPerson > 0 ? h.pricePerPerson : h.rentPrice;
        let score = 40;

        if (effectiveRent > 0 && effectiveRent <= reqPost.maxBudget) score += 40;
        else if (effectiveRent > 0 && effectiveRent <= reqPost.maxBudget * 1.15) score += 20;

        const areaText = `${h.address} ${h.title} ${h.nearLandmark}`.toLowerCase();
        if (reqPost.area && areaText.includes(reqPost.area.toLowerCase())) score += 10;

        if (
          (h.isShared && (h.sharedGender === reqPost.gender || h.sharedGender === 'any')) ||
          (reqPost.gender === 'family' && h.suitableFor !== 'bachelors') ||
          reqPost.gender === 'any'
        ) {
          score += 10;
        }

        return {
          ...h.toObject(),
          effectiveRent,
          matchPercent: Math.min(score, 99),
        };
      })
      .filter((item) => item.matchPercent >= 65)
      .sort((a, b) => b.matchPercent - a.matchPercent)
      .slice(0, 10);

    res.status(200).json(scored);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};