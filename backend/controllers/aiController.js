const formatPKR = (amount) => {
  const num = Number(amount) || 0;
  if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Crore`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)} Lac`;
  return num.toLocaleString();
};

// 1. قدرتی زبان (Roman Urdu / English) کو فلٹرز میں بدلنے والا اسمارٹ بیک اپ پارسر
const fallbackSmartParse = (rawQuery = '') => {
  const q = rawQuery.toLowerCase();
  const isBuyIntent = /(buy|purchase|sale|kharidna|kharid|plot|file|marla|kanal|crore|cr|commercial|villa)/i.test(q);
  const isRentIntent = /(rent|kiraya|kiraye|roommate|hostel|shared|daily|monthly|yearly|boys|girls)/i.test(q);

  const detectedPurpose = isBuyIntent && !isRentIntent ? 'sale' : isRentIntent ? 'rent' : 'current';

  const result = {
    purpose: detectedPurpose,
    propertyType: 'all',
    search: '',
    maxPrice: detectedPurpose === 'sale' ? 150000000 : 150000,
    bedrooms: 'all',
    rentType: 'all',
    suitableFor: 'all',
    isShared: false,
    sharedGender: 'all',
    utilities: {
      separateMeter: false,
      solarOrUps: false,
      suiGas: false,
      wifi: false,
    },
  };

  // بجٹ نکالنا (2 crore, 50 lac, 25k, 25 hazar, 40000)
  const croreMatch = q.match(/(\d+(?:\.\d+)?)\s*(crore|cr)\b/);
  const lakhMatch = q.match(/(\d+(?:\.\d+)?)\s*(lakh|lac)\b/);
  const kMatch = q.match(/(\d+)\s*k\b/);
  const hazarMatch = q.match(/(\d+)\s*(hazar|hazaar|thousand)/);
  const numMatch = q.match(/\b(\d{4,9})\b/);

  if (croreMatch) {
    result.maxPrice = Math.round(Number(croreMatch[1]) * 10000000);
    if (result.purpose === 'current') result.purpose = 'sale';
  } else if (lakhMatch) {
    result.maxPrice = Math.round(Number(lakhMatch[1]) * 100000);
  } else if (kMatch) {
    result.maxPrice = Number(kMatch[1]) * 1000;
  } else if (hazarMatch) {
    result.maxPrice = Number(hazarMatch[1]) * 1000;
  } else if (numMatch) {
    result.maxPrice = Number(numMatch[1]);
  }

  // پراپرٹی کی قسم
  if (/(plot|land|file)/i.test(q)) result.propertyType = 'plot';
  else if (/(flat|apartment|apt)/i.test(q)) result.propertyType = 'flat';
  else if (/(portion)/i.test(q)) result.propertyType = 'portion';
  else if (/(commercial|shop|office|plaza)/i.test(q)) result.propertyType = 'commercial';
  else if (/(house|home|villa|banglow)/i.test(q)) result.propertyType = 'house';

  // بیڈرومز
  const bedMatch = q.match(/(\d+)\s*(bed|bedroom|bedrooms|kamra|kamre|kamron)/);
  if (bedMatch) {
    const b = Number(bedMatch[1]);
    if (b >= 4) result.bedrooms = '4';
    else if (b >= 3) result.bedrooms = '3';
    else if (b === 2) result.bedrooms = '2';
    else if (b === 1) result.bedrooms = '1';
  }

  // کرایہ کی قسم
  if (/(daily|night|din|raat)/i.test(q)) result.rentType = 'daily';
  else if (/(monthly|month|mahina|mahine)/i.test(q)) result.rentType = 'monthly';
  else if (/(yearly|year|saal)/i.test(q)) result.rentType = 'yearly';

  // فیملی / بیچلر / روم میٹ
  if (/(family|families)/i.test(q)) result.suitableFor = 'family';
  else if (/(bachelor|bachelors|student|students|single)/i.test(q)) result.suitableFor = 'bachelors';

  if (/(shared|share|roommate|hostel|flatmate|bedspace)/i.test(q)) {
    result.isShared = true;
  }
  if (/(boys|boy|male|larke|larka)/i.test(q)) {
    result.sharedGender = 'boys';
    result.isShared = true;
  } else if (/(girls|girl|female|larkiyan|larki)/i.test(q)) {
    result.sharedGender = 'girls';
    result.isShared = true;
  }

  // یوٹیلیٹیز
  if (/(solar|ups|backup|inverter)/i.test(q)) result.utilities.solarOrUps = true;
  if (/(meter|separate meter|bijli)/i.test(q)) result.utilities.separateMeter = true;
  if (/(gas|sui gas)/i.test(q)) result.utilities.suiGas = true;
  if (/(wifi|wi-fi|internet|fiber)/i.test(q)) result.utilities.wifi = true;

  // شہر یا مشہور علاقے نکالنا
  const knownPlaces = [
    'johar town', 'bahria town', 'bahria', 'gulberg', 'model town', 'dha',
    'g-11', 'g-10', 'f-10', 'f-11', 'e-11', 'clifton', 'gulshan', 'saddar',
    'lahore', 'islamabad', 'karachi', 'rawalpindi', 'pindi', 'peshawar',
    'multan', 'faisalabad', 'quetta', 'sialkot', 'murree', 'nust', 'fast', 'lums', 'uet'
  ];
  const matchedPlaces = knownPlaces.filter((p) => q.includes(p));
  if (matchedPlaces.length > 0) {
    result.search = matchedPlaces.slice(0, 2).join(' ');
  } else {
    result.search = rawQuery
      .replace(/(\d+\s*k|\d+(?:\.\d+)?\s*(hazar|hazaar|lakh|lac|crore|cr)|\d{4,9}|mein|me|main|ka|ke|ki|tak|under|below|wala|wali|chahiye|need|buy|sale|kharidna|plot|marla|kanal|room|flat|house|ghar|shared|hostel|boys|girls|family|bachelors|solar|ups|meter|separate|gas|wifi|daily|monthly|yearly|bed|bedrooms?)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return result;
};

// 2. اسمارٹ سرچ API (Gemini AI + Fallback)
export const smartSearch = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ message: 'Please enter a search query!' });
    }

    let filters = null;
    let usedAi = false;

    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are a search parser for a Pakistani real estate platform (Rent + Buy/Sell).
Extract filters from this user query (English or Roman Urdu):
"${query}"

Return ONLY valid JSON matching this exact structure (no markdown, no explanation):
{
  "purpose": "rent" or "sale" or "current",
  "propertyType": "all" or "house" or "flat" or "plot" or "portion" or "commercial",
  "search": "city or area or university name only, empty string if none",
  "maxPrice": number (e.g. 25000 for 25k rent, 20000000 for 2 crore sale; if not specified use 150000 for rent or 150000000 for sale),
  "bedrooms": "all" or "1" or "2" or "3" or "4",
  "rentType": "all" or "daily" or "monthly" or "yearly",
  "suitableFor": "all" or "family" or "bachelors",
  "isShared": false,
  "sharedGender": "all" or "boys" or "girls",
  "utilities": {
    "separateMeter": false,
    "solarOrUps": false,
    "suiGas": false,
    "wifi": false
  }
}`;

        const aiRes = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': process.env.GEMINI_API_KEY,
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.1,
              },
            }),
          }
        );

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const rawText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            filters = JSON.parse(rawText);
            usedAi = true;
          }
        }
      } catch (err) {
        console.error('Gemini Smart Search fallback:', err.message);
      }
    }

    if (!filters) {
      filters = fallbackSmartParse(query);
    }

    const tags = [];
    if (filters.purpose === 'sale') tags.push('🏷️ For Sale');
    else if (filters.purpose === 'rent') tags.push('🏢 For Rent');
    if (filters.search) tags.push(`📍 ${filters.search}`);
    if (filters.maxPrice && Number(filters.maxPrice) < (filters.purpose === 'sale' ? 150000000 : 150000)) {
      tags.push(`💰 Max PKR ${formatPKR(filters.maxPrice)}`);
    }
    if (filters.isShared) tags.push(`🎓 Shared${filters.sharedGender !== 'all' ? ` (${filters.sharedGender})` : ''}`);
    if (filters.suitableFor && filters.suitableFor !== 'all') tags.push(`👤 ${filters.suitableFor}`);
    if (filters.bedrooms && filters.bedrooms !== 'all') tags.push(`🛏️ ${filters.bedrooms}+ Beds`);
    if (filters.utilities?.solarOrUps) tags.push('☀️ Solar/UPS');
    if (filters.utilities?.separateMeter) tags.push('⚡ Separate Meter');
    if (filters.utilities?.suiGas) tags.push('🔥 Sui Gas');
    if (filters.utilities?.wifi) tags.push('📶 WiFi');

    res.status(200).json({
      filters,
      usedAi,
      summary: tags.length > 0 ? tags.join(' • ') : `Searching for "${query}"`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. پراپرٹی تفصیلات (Description) AI سے لکھوانا (Rent اور Sale دونوں کے لیے)
export const generateDescription = async (req, res) => {
  try {
    const {
      purpose, propertyType,
      title, city, address, bedrooms, bathrooms,
      rentPrice, pricePerDay,
      salePrice, areaSize, areaUnit, possessionStatus, isNegotiable, installmentAvailable,
      suitableFor, isShared, totalBeds, sharedGender, nearLandmark, utilities
    } = req.body;

    const isSale = purpose === 'sale';
    const utilityList = [];
    if (utilities?.separateMeter) utilityList.push('Separate Electricity Meter');
    if (utilities?.solarOrUps) utilityList.push('Solar / UPS Backup');
    if (utilities?.suiGas) utilityList.push('Sui Gas');
    if (utilities?.water24x7) utilityList.push('24/7 Water Supply');
    if (utilities?.wifi) utilityList.push('High-Speed Fiber WiFi');
    if (utilities?.parking) utilityList.push('Dedicated Parking');

    let description = '';

    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = isSale
          ? `Write an attractive, trustworthy real estate FOR SALE listing description (around 70-90 words in English + 1 short welcoming Urdu line at the end) for a Pakistani property app "HouseRent PK".
Details:
- Title: ${title || 'Property'}
- Type: ${propertyType || 'house'}
- Area Size: ${areaSize || ''} ${areaUnit || 'Marla'}
- City: ${city || 'Pakistan'}, Address: ${address || ''}
- Bedrooms: ${bedrooms || 0}, Bathrooms: ${bathrooms || 0}
- Demand Price: PKR ${salePrice ? formatPKR(salePrice) : 'Negotiable'} (${isNegotiable ? 'Negotiable' : 'Fixed'})
- Possession: ${possessionStatus || 'ready'}
- Installments: ${installmentAvailable ? 'Available' : 'Cash payment'}
- Nearby Landmark: ${nearLandmark || 'Prime accessible location'}
- Confirmed Utilities: ${utilityList.length > 0 ? utilityList.join(', ') : 'Standard facilities'}

Highlight 0% dealer commission and secure Escrow Bayana deal. Do not use markdown asterisks.`
          : `Write an attractive, honest, well-structured rental listing description (around 70-90 words in clear English + 1 short welcoming Urdu line at the end) for a Pakistani rental app "HouseRent PK".
Details:
- Title: ${title || 'Property'}
- City: ${city || 'Pakistan'}, Address: ${address || ''}
- Bedrooms: ${bedrooms || 1}, Bathrooms: ${bathrooms || 1}
- Monthly Rent: PKR ${rentPrice || 'Negotiable'}, Daily: PKR ${pricePerDay || 0}
- Suitable for: ${suitableFor || 'both'}
- Shared Room: ${isShared ? `Yes (${totalBeds} roommates, ${sharedGender})` : 'No (Full space)'}
- Nearby Landmark: ${nearLandmark || 'Prime accessible location'}
- Confirmed Utilities: ${utilityList.length > 0 ? utilityList.join(', ') : 'Standard facilities'}

Highlight 0% dealer commission and secure Escrow booking. Do not use markdown asterisks.`;

        const aiRes = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': process.env.GEMINI_API_KEY,
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.7 },
            }),
          }
        );

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const generated = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generated) description = generated.trim();
        }
      } catch (err) {
        console.error('Gemini Description fallback:', err.message);
      }
    }

    // اسمارٹ بیک اپ ٹیکسٹ
    if (!description) {
      const utilPart =
        utilityList.length > 0
          ? ` Key verified utilities include: ${utilityList.join(', ')}.`
          : '';
      const landmarkPart = nearLandmark ? ` Conveniently located near ${nearLandmark}.` : '';

      if (isSale) {
        const sizePart = areaSize ? `${areaSize} ${areaUnit || 'Marla'} ` : '';
        const pricePart = salePrice ? ` Demand price is PKR ${formatPKR(salePrice)}${isNegotiable ? ' (Negotiable)' : ''}.` : '';
        const roomPart =
          propertyType !== 'plot' && Number(bedrooms) > 0
            ? ` Features ${bedrooms} bedrooms and ${bathrooms || 1} bathrooms.`
            : '';
        const instPart = installmentAvailable ? ' Easy installment plan is also available.' : '';

        description = `Prime ${sizePart}${propertyType || 'property'} available for sale in ${address ? `${address}, ` : ''}${city || 'prime area'}.${roomPart}${pricePart}${instPart}${utilPart}${landmarkPart} Deal directly with the owner with 0% dealer commission and Escrow Bayana protection on HouseRent PK.\n\nمالک سے براہِ راست محفوظ خریداری کریں — بغیر کسی ڈیلر کمیشن کے۔`;
      } else {
        const splitPart =
          isShared && Number(rentPrice) > 0 && Number(totalBeds) > 1
            ? ` Ideal for ${sharedGender === 'boys' ? 'boys/students' : sharedGender === 'girls' ? 'girls/students' : 'roommates'} with an affordable split rent of just PKR ${Math.round(Number(rentPrice) / Number(totalBeds)).toLocaleString()}/person.`
            : '';

        description = `Well-maintained ${bedrooms || 1}-bedroom, ${bathrooms || 1}-bathroom ${title || 'property'} available in ${address ? `${address}, ` : ''}${city || 'prime area'}.${splitPart}${utilPart}${landmarkPart} Book directly with 0% dealer commission and full Escrow payment protection on HouseRent PK.\n\nپرامن اور محفوظ رہائش، براہِ راست مالک مکان سے بغیر کسی ڈیلر کمیشن کے بُک کریں۔`;
      }
    }

    res.status(200).json({ description });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};