"use client";

import { useEffect, useState, useMemo } from "react";
import {
  MapPin,
  Clock,
  Search,
  RefreshCw,
  Loader2,
  CalendarDays,
} from "lucide-react";
import {
  fetchUserLocation,
  fetchPrayerTimes,
  PrayerData,
  PRAYER_NAMES,
  MAIN_PRAYERS,
  fetchCitiesForSuggestion,
  searchCitiesWorldwide,
  City,
} from "@/lib/prayer-times";
import { cn } from "@/lib/utils";

export default function PrayerTimesPage() {
  const [location, setLocation] = useState<{
    city: string;
    country: string;
  } | null>(null);
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const [allCities, setAllCities] = useState<City[]>([]);
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [isManualLocation, setIsManualLocation] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const saveToLocal = (
    city: string,
    country: string,
    lat?: string,
    lon?: string,
  ) => {
    localStorage.setItem(
      "user-location",
      JSON.stringify({ city, country, lat, lon }),
    );
  };

  const getFromLocal = () => {
    const saved = localStorage.getItem("user-location");
    return saved ? JSON.parse(saved) : null;
  };

  const initData = async () => {
    setLoading(true);
    setError(null);
    setIsManualLocation(false);
    try {
      // Fetch initial cities for suggestions
      fetchCitiesForSuggestion().then(setAllCities);

      // Check local storage first
      const savedLoc = getFromLocal();
      let loc;

      if (savedLoc) {
        loc = savedLoc;
        setIsManualLocation(true);
      } else {
        loc = await fetchUserLocation();
      }

      setLocation({ city: loc.city, country: loc.country });

      // Use lat/lon if available for better accuracy, otherwise city/country
      const data = await fetchPrayerTimes(
        loc.lat || loc.city,
        loc.lon || loc.country,
      );

      setPrayerData(data);
    } catch (err) {
      setError("Gagal mengambil jadwal sholat. Silakan cari lokasi manual.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  const handleSearch = async (cityObj: City | string, country: string = "") => {
    const cityName = typeof cityObj === "string" ? cityObj : cityObj.name;
    const countryName =
      typeof cityObj === "string" ? country : cityObj.country || "";

    if (!cityName.trim()) return;
    setLoading(true);
    setError(null);
    setShowSuggestions(false);
    setSearchQuery(cityName);
    setIsManualLocation(true);
    try {
      // Use lat/lon if available for worldwide accuracy
      const lat =
        typeof cityObj !== "string" && cityObj.lat ? cityObj.lat : undefined;
      const lon =
        typeof cityObj !== "string" && cityObj.lon ? cityObj.lon : undefined;

      const cityParam = lat || cityName;
      const countryParam = lon || countryName;

      const data = await fetchPrayerTimes(cityParam, countryParam);
      setPrayerData(data);
      setLocation({
        city: cityName,
        country: countryName || data.meta.timezone,
      });

      // Save to local storage
      saveToLocal(cityName, countryName || data.meta.timezone, lat, lon);

      setError(null);
    } catch (err) {
      setError(
        `Gagal mengambil jadwal untuk "${cityName}". Coba nama kota yang berbeda.`,
      );
    } finally {
      setLoading(false);
    }
  };

  const onInputChange = async (val: string) => {
    setSearchQuery(val);
    if (val.length > 2) {
      // First check local/initial list
      const filtered = allCities.filter((c) =>
        c.name.toLowerCase().includes(val.toLowerCase()),
      );

      if (filtered.length > 0) {
        setSuggestions(filtered.slice(0, 5));
        setShowSuggestions(true);
      }

      // Then fetch from worldwide search
      const worldwide = await searchCitiesWorldwide(val);
      if (worldwide.length > 0) {
        setSuggestions((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          const combined = [
            ...prev,
            ...worldwide.filter((w) => !ids.has(w.id)),
          ];
          return combined.slice(0, 8);
        });
        setShowSuggestions(true);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const localTime = useMemo(() => {
    // Priority: If manual location, use adjusted time. If not, use device time.
    if (!isManualLocation || !prayerData?.meta.timezone) return currentTime;

    // Adjust currentTime to the location's timezone
    try {
      const formatter = new Intl.DateTimeFormat("id-ID", {
        timeZone: prayerData.meta.timezone,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      });
      const parts = formatter.formatToParts(currentTime);
      const mapped = parts.reduce((acc, part) => {
        if (part.type !== "literal") acc[part.type] = part.value;
        return acc;
      }, {} as any);

      const date = new Date(
        parseInt(mapped.year),
        parseInt(mapped.month) - 1,
        parseInt(mapped.day),
        parseInt(mapped.hour),
        parseInt(mapped.minute),
        parseInt(mapped.second),
      );
      return date;
    } catch (e) {
      return currentTime;
    }
  }, [currentTime, prayerData?.meta.timezone]);

  const nextPrayer = useMemo(() => {
    if (!prayerData) return null;

    const timings = prayerData.timings;
    const now = localTime;

    const prayerTimes = MAIN_PRAYERS.map((key) => {
      const [hours, minutes] = timings[key].split(":").map(Number);
      const prayerDate = new Date(now);
      prayerDate.setHours(hours, minutes, 0, 0);
      return { key, time: prayerDate };
    });

    // Find the next prayer today
    let next = prayerTimes.find((p) => p.time > now);

    // If no more prayers today, next is first prayer tomorrow (usually Imsak/Fajr)
    if (!next) {
      next = {
        ...prayerTimes[0],
        time: new Date(prayerTimes[0].time.getTime() + 24 * 60 * 60 * 1000),
      };
    }

    const diff = next.time.getTime() - now.getTime();
    const minutesRemaining = Math.floor(diff / (1000 * 60));
    const hoursRemaining = Math.floor(minutesRemaining / 60);
    const minsOnly = minutesRemaining % 60;

    return {
      name: PRAYER_NAMES[next.key],
      time: timings[next.key],
      countdown:
        hoursRemaining > 0
          ? `${hoursRemaining} jam ${minsOnly} menit`
          : `${minsOnly} menit`,
      isUrgent: minutesRemaining < 15,
    };
  }, [prayerData, localTime]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 px-4 pt-4 w-full box-border">
      {/* Hero Card / Banner */}
      <div className="grid grid-cols-1 md:flex md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 dark:from-emerald-950 dark:via-emerald-900 dark:to-teal-950 text-white p-6 sm:p-8 rounded-[2rem] shadow-xl shadow-emerald-500/10 overflow-hidden relative border border-emerald-500/20 dark:border-emerald-500/10 w-full box-border">
        <div className="z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/15 dark:bg-white/5 backdrop-blur-md px-3 py-1 rounded-full text-xs sm:text-sm font-medium border border-white/10 max-w-full container-snap text-white">
            <MapPin className="w-3.5 h-3.5 shrink-0 opacity-90" />
            <span className="truncate">
              {location?.city}, {location?.country}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight tabular-nums drop-shadow-sm select-none text-white">
            {!mounted
              ? "--:--:--"
              : localTime.toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
          </h1>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-emerald-100/85 dark:text-emerald-200/70 text-xs sm:text-sm font-medium">
            <CalendarDays className="w-4 h-4 shrink-0 opacity-80" />
            <span className="whitespace-nowrap">
              {prayerData?.date.readable}
            </span>
            <span className="mx-0.5 opacity-50">•</span>
            <span className="whitespace-nowrap">
              {prayerData?.date.hijri.day} {prayerData?.date.hijri.month.en}{" "}
              {prayerData?.date.hijri.year} H
            </span>
          </div>
        </div>

        {nextPrayer && (
          <div className="z-10 bg-white/15 dark:bg-white/5 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/20 dark:border-white/10 shadow-lg w-full md:w-auto md:min-w-[240px] box-border flex flex-col justify-between gap-2 transition-colors duration-300">
            <p className="text-[11px] sm:text-xs font-bold text-emerald-100/90 dark:text-emerald-200/80 uppercase tracking-widest">
              Selanjutnya: {nextPrayer.name}
            </p>
            <div className="flex items-baseline justify-between md:justify-start md:gap-4 w-full">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-white">
                {nextPrayer.time}
              </span>
              <span
                className={cn(
                  "text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full inline-block font-bold shadow-sm backdrop-blur-sm shrink-0",
                  nextPrayer.isUrgent
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-white/20 dark:bg-white/10 text-white border border-white/10",
                )}
              >
                -{nextPrayer.countdown}
              </span>
            </div>
          </div>
        )}

        {/* Decorative elements */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none hidden sm:block" />
        <div className="absolute right-1/4 -top-12 w-32 h-32 bg-white/10 dark:bg-teal-500/5 rounded-full blur-2xl pointer-events-none hidden sm:block" />
      </div>

      {/* Search Input and Suggestions */}
      <div className="relative group max-w-2xl mx-auto w-full z-50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchQuery);
          }}
          className="flex items-center gap-2 bg-card border border-border/80 rounded-2xl p-1.5 shadow-sm hover:shadow-md focus-within:border-emerald-500/50 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all duration-300 w-full"
        >
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground/70 pointer-events-none transition-colors group-focus-within/form:text-emerald-500" />
            <input
              type="text"
              placeholder="Cari Kota (Contoh: Surabaya, Bandung, Medan...)"
              value={searchQuery}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onInputChange(e.target.value)}
              onFocus={(e) => {
                e.stopPropagation();
                if (searchQuery.length > 1) setShowSuggestions(true);
              }}
              className="w-full h-11 pl-10 pr-3 bg-transparent border-0 outline-none focus:ring-0 text-sm sm:text-base text-foreground font-medium placeholder:text-muted-foreground/50"
            />
          </div>
          <button
            type="submit"
            className="h-11 px-5 sm:px-6 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-xl font-semibold active:scale-[0.97] transition-all flex items-center justify-center disabled:opacity-50 text-sm sm:text-base shrink-0 shadow-sm shadow-emerald-600/10"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cari"}
          </button>
        </form>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-[calc(100%+0.5rem)] left-0 right-0 bg-card border border-border/60 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-64 overflow-y-auto container-snap">
            {suggestions.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => handleSearch(city)}
                className="w-full px-5 py-3.5 text-left hover:bg-emerald-500/10 dark:hover:bg-emerald-500/5 transition-all flex flex-col gap-1 border-b border-border/40 last:border-0 group/item"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <MapPin className="w-4 h-4 text-muted-foreground/60 group-hover/item:text-emerald-500 transition-colors shrink-0" />
                  <span className="font-semibold text-sm sm:text-base text-foreground truncate group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors">
                    {city.name}
                  </span>
                </div>
                {city.country && (
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground/70 ml-6 uppercase tracking-wider truncate">
                    {city.country}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm break-words">
          {error}
        </div>
      )}

      {/* Grid List Jadwal Sholat */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {loading && !prayerData
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[76px] sm:h-[88px] bg-card/50 rounded-2xl animate-pulse border border-border/50"
              />
            ))
          : prayerData &&
            MAIN_PRAYERS.map((key) => {
              const isNext = nextPrayer?.name === PRAYER_NAMES[key];
              return (
                <div
                  key={key}
                  className={cn(
                    "p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between group w-full box-border",
                    /* KONDISI ADAPTIF: Jika aktif pakai Emerald murni, jika biasa kembali ikuti variabel asli Shadcn */
                    isNext
                      ? "bg-emerald-600 dark:bg-emerald-700 text-white border-transparent shadow-lg shadow-emerald-600/10 sm:scale-[1.02]"
                      : "bg-card border-border hover:border-emerald-500/40 text-foreground",
                  )}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div
                      className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all shrink-0",
                        isNext
                          ? "bg-white/20 text-white"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20",
                      )}
                    >
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base sm:text-lg leading-none mb-1.5 truncate">
                        {PRAYER_NAMES[key]}
                      </h3>
                      <p
                        className={cn(
                          "text-[11px] sm:text-xs truncate font-medium",
                          /* Teks 'Setiap Hari' dikunci warnanya berdasarkan status kartu */
                          isNext ? "text-emerald-100" : "text-muted-foreground",
                        )}
                      >
                        Setiap Hari
                      </p>
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black tracking-tight font-mono ml-2 shrink-0 tabular-nums">
                    {prayerData.timings[key]}
                  </div>
                </div>
              );
            })}
      </div>

      {/* Re-detect Location Button */}
      <div className="text-center pt-2">
        <button
          onClick={() => {
            localStorage.removeItem("user-location");
            initData();
          }}
          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 mx-auto py-2 px-3 rounded-lg hover:bg-muted/50"
        >
          <RefreshCw className="w-3 h-3" />
          Deteksi Ulang Lokasi
        </button>
      </div>
    </div>
  );
}
