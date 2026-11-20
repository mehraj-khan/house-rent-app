export const getLiveLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Aapka browser Live Location support nahi karta.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en`
          );

          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};

            let city =
              addr.city ||
              addr.town ||
              addr.village ||
              addr.state_district ||
              addr.county ||
              '';

            city = city.replace(/\s+(District|Division|Tehsil)$/i, '').trim();

            const areaParts = [
              addr.road,
              addr.neighbourhood || addr.suburb || addr.quarter || addr.city_district,
            ].filter(Boolean);

            const area =
              areaParts.length > 0
                ? areaParts.join(', ')
                : (data.display_name || '').split(',').slice(0, 2).join(',').trim();

            if (city || area) {
              resolve({ lat, lng, city, area });
              return;
            }
          }
        } catch {
          // Fallback API chalegi
        }

        try {
          const fallbackRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
          );
          const fbData = await fallbackRes.json();
          const city = (fbData.city || fbData.principalSubdivision || '').trim();
          const area = (fbData.locality || city).trim();
          resolve({ lat, lng, city, area });
        } catch {
          reject(new Error('Location ka naam nikalne mein masla aaya.'));
        }
      },
      (error) => {
        if (error.code === 1) {
          reject(new Error('Location permission allow karein (browser ke address bar mein location icon check karein).'));
        } else {
          reject(new Error('Live location detect nahi ho saki, dubara try karein.'));
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
};