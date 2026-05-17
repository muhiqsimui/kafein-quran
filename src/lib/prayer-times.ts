export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
  Firstthird: string;
  Lastthird: string;
}

export interface PrayerData {
  timings: PrayerTimings;
  date: {
    readable: string;
    timestamp: string;
    gregorian: {
      date: string;
      format: string;
      day: string;
      weekday: { en: string };
      month: { number: number; en: string };
      year: string;
    };
    hijri: {
      date: string;
      format: string;
      day: string;
      weekday: { en: string; ar: string };
      month: { number: number; en: string; ar: string };
      year: string;
    };
  };
  meta: {
    latitude: number;
    longitude: number;
    timezone: string;
    method: {
      id: number;
      name: string;
    };
  };
}

export interface City {
  id: string;
  name: string;
  country?: string;
  fullName?: string;
  lat?: string;
  lon?: string;
}

export async function fetchUserLocation() {
  try {
    // Priority 1: User's actual IP-based location (More accurate than guessing by GMT)
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) throw new Error("Failed to fetch location from ipapi");
    const data = await response.json();

    return {
      city: data.city || "Jakarta",
      country: data.country_name || "Indonesia",
      timezone: data.timezone || "Asia/Jakarta",
      lat: data.latitude?.toString(),
      lon: data.longitude?.toString(),
    };
  } catch (error) {
    console.warn("ipapi failed, trying fallback detection:", error);

    // Priority 2: Guess by Timezone (JS native)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let city = "Jakarta";

    if (timezone.includes("Makassar")) city = "Makassar";
    if (timezone.includes("Jayapura")) city = "Jayapura";

    return {
      city,
      country: "Indonesia",
      timezone: timezone || "Asia/Jakarta",
    };
  }
}

export async function searchCitiesWorldwide(query: string) {
  try {
    if (query.length < 3) return [];

    // We use Nominatim but with careful headers and a try-catch for CORS/Network issues
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=8&featuretype=city&accept-language=id`,
      { headers: {} },
    ).catch((err) => {
      // If CORS or network fails, we return empty instead of crashing
      console.warn(
        "Nominatim fetch failed, possibly CORS or Network issue:",
        err,
      );
      return null;
    });

    if (!response || !response.ok) return [];
    const data = await response.json();

    return data.map((item: any) => ({
      id: item.place_id.toString(),
      name: item.name || item.display_name.split(",")[0],
      fullName: item.display_name,
      country: item.address.country || "",
      lat: item.lat,
      lon: item.lon,
    })) as City[];
  } catch (error) {
    console.error("Error searching cities worldwide:", error);
    return [];
  }
}

// Memory cache for Indonesian cities to avoid multiple fetches
let cachedIndonesianCities: City[] | null = null;

export async function fetchCitiesForSuggestion() {
  if (cachedIndonesianCities) return cachedIndonesianCities;

  try {
    // Using Kemenag-based API for Indonesian cities (myQuran API v2/v3 is a popular public one)
    const response = await fetch(
      "https://api.myquran.com/v2/sholat/kota/semua",
    );
    if (response.ok) {
      const data = await response.json();
      if (data.status) {
        const cities = data.data.map((item: any) => ({
          id: `mq-${item.id}`,
          name: item.lokasi, // Already cleaned/correct name from Kemenag
          fullName: `${item.lokasi}, Indonesia`,
          country: "Indonesia",
        })) as City[];

        cachedIndonesianCities = cities;
        return cities;
      }
    }
  } catch (error) {
    console.error("Error fetching Indonesian cities from myQuran API:", error);
  }

  try {
    // Fallback to our existing GitHub source if myQuran fails
    const response = await fetch(
      "https://raw.githubusercontent.com/kodemuji/wilayah-indonesia-json/master/kabupaten.json",
    );
    if (response.ok) {
      const data = await response.json();
      const cities = data.map((item: any) => ({
        id: `id-${item.id}`,
        name: item.nama.replace(/\b(KABUPATEN|KOTA)\b/gi, "").trim(),
        fullName: item.nama,
        country: "Indonesia",
      })) as City[];

      cachedIndonesianCities = cities;
      return cities;
    }
  } catch (error) {
    console.error(
      "Error fetching Indonesian cities from GitHub fallback:",
      error,
    );
  }

  // Fallback if API fails - A decent list to start with
  const fallback = [
    { name: "Jakarta", country: "Indonesia" },
    { name: "Surabaya", country: "Indonesia" },
    { name: "Bandung", country: "Indonesia" },
    { name: "Medan", country: "Indonesia" },
    { name: "Makassar", country: "Indonesia" },
    { name: "Semarang", country: "Indonesia" },
    { name: "Palembang", country: "Indonesia" },
    { name: "Batam", country: "Indonesia" },
    { name: "Bogor", country: "Indonesia" },
    { name: "Denpasar", country: "Indonesia" },
    { name: "Yogyakarta", country: "Indonesia" },
    { name: "Banda Aceh", country: "Indonesia" },
    { name: "Jayapura", country: "Indonesia" },
    { name: "London", country: "UK" },
    { name: "New York", country: "USA" },
    { name: "Paris", country: "France" },
    { name: "Dubai", country: "UAE" },
    { name: "Makkah", country: "Saudi Arabia" },
    { name: "Tokyo", country: "Japan" },
  ].map((item, index) => ({
    id: `fallback-${index}`,
    name: item.name,
    country: item.country,
    fullName: `${item.name}, ${item.country}`,
  })) as City[];

  return fallback;
}

export async function fetchPrayerTimes(
  cityOrLat: string,
  countryOrLon: string = "Indonesia",
) {
  try {
    let url = "";

    // Check if we have coordinates (from Nominatim result)
    const isCoords =
      !isNaN(parseFloat(cityOrLat)) &&
      !isNaN(parseFloat(countryOrLon)) &&
      countryOrLon !== "Indonesia";

    if (isCoords) {
      url = `https://api.aladhan.com/v1/timings?latitude=${cityOrLat}&longitude=${countryOrLon}&method=20`;
    } else {
      // Basic cleaning for Aladhan API matching as fallback
      const cleanCity = cityOrLat.replace(/KOTA|KABUPATEN/gi, "").trim();
      url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(cleanCity)}&country=${encodeURIComponent(countryOrLon)}&method=20`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch prayer times");

    const json = await response.json();
    return json.data as PrayerData;
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    throw error;
  }
}

export const PRAYER_NAMES: Record<keyof PrayerTimings, string> = {
  Fajr: "Subuh",
  Sunrise: "Terbit",
  Dhuhr: "Dzuhur",
  Asr: "Ashar",
  Maghrib: "Maghrib",
  Isha: "Isya",
  Imsak: "Imsak",
  Midnight: "Tengah Malam",
  Firstthird: "Sepertiga Malam Pertama",
  Lastthird: "Sepertiga Malam Terakhir",
};

export const MAIN_PRAYERS: (keyof PrayerTimings)[] = [
  "Imsak",
  "Fajr",
  "Sunrise",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
];
