"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  MapPin, 
  Clock, 
  Search, 
  RefreshCw, 
  ChevronRight,
  Loader2,
  CalendarDays
} from "lucide-react";
import { 
  fetchUserLocation,
  fetchPrayerTimes, 
  PrayerData, 
  PRAYER_NAMES, 
  MAIN_PRAYERS,
  fetchCitiesForSuggestion,
  searchCitiesWorldwide,
  City
} from "@/lib/prayer-times";
import { cn } from "@/lib/utils";

export default function PrayerTimesPage() {
  const [location, setLocation] = useState<{ city: string; country: string } | null>(null);
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

  const saveToLocal = (city: string, country: string, lat?: string, lon?: string) => {
    localStorage.setItem("user-location", JSON.stringify({ city, country, lat, lon }));
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
        loc.lon || loc.country
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
    const cityName = typeof cityObj === 'string' ? cityObj : cityObj.name;
    const countryName = typeof cityObj === 'string' ? country : (cityObj.country || "");
    
    if (!cityName.trim()) return;
    setLoading(true);
    setError(null);
    setShowSuggestions(false);
    setSearchQuery(cityName);
    setIsManualLocation(true);
    try {
      // Use lat/lon if available for worldwide accuracy
      const lat = (typeof cityObj !== 'string' && cityObj.lat) ? cityObj.lat : undefined;
      const lon = (typeof cityObj !== 'string' && cityObj.lon) ? cityObj.lon : undefined;
      
      const cityParam = lat || cityName;
      const countryParam = lon || countryName;

      const data = await fetchPrayerTimes(cityParam, countryParam);
      setPrayerData(data);
      setLocation({ city: cityName, country: countryName || data.meta.timezone });
      
      // Save to local storage
      saveToLocal(cityName, countryName || data.meta.timezone, lat, lon);
      
      setError(null);
    } catch (err) {
      setError(`Gagal mengambil jadwal untuk "${cityName}". Coba nama kota yang berbeda.`);
    } finally {
      setLoading(false);
    }
  };

  const onInputChange = async (val: string) => {
    setSearchQuery(val);
    if (val.length > 2) {
      // First check local/initial list
      const filtered = allCities.filter(c => 
        c.name.toLowerCase().includes(val.toLowerCase())
      );
      
      if (filtered.length > 0) {
        setSuggestions(filtered.slice(0, 5));
        setShowSuggestions(true);
      }
      
      // Then fetch from worldwide search
      const worldwide = await searchCitiesWorldwide(val);
      if (worldwide.length > 0) {
        setSuggestions(prev => {
          const ids = new Set(prev.map(p => p.id));
          const combined = [...prev, ...worldwide.filter(w => !ids.has(w.id))];
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
      const formatter = new Intl.DateTimeFormat('id-ID', {
        timeZone: prayerData.meta.timezone,
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
      });
      const parts = formatter.formatToParts(currentTime);
      const mapped = parts.reduce((acc, part) => {
        if (part.type !== 'literal') acc[part.type] = part.value;
        return acc;
      }, {} as any);
      
      const date = new Date(
        parseInt(mapped.year),
        parseInt(mapped.month) - 1,
        parseInt(mapped.day),
        parseInt(mapped.hour),
        parseInt(mapped.minute),
        parseInt(mapped.second)
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
    
    const prayerTimes = MAIN_PRAYERS.map(key => {
      const [hours, minutes] = timings[key].split(':').map(Number);
      const prayerDate = new Date(now);
      prayerDate.setHours(hours, minutes, 0, 0);
      return { key, time: prayerDate };
    });

    // Find the next prayer today
    let next = prayerTimes.find(p => p.time > now);

    // If no more prayers today, next is first prayer tomorrow (usually Imsak/Fajr)
    if (!next) {
      next = { ...prayerTimes[0], time: new Date(prayerTimes[0].time.getTime() + 24 * 60 * 60 * 1000) };
    }

    const diff = next.time.getTime() - now.getTime();
    const minutesRemaining = Math.floor(diff / (1000 * 60));
    const hoursRemaining = Math.floor(minutesRemaining / 60);
    const minsOnly = minutesRemaining % 60;

    return {
      name: PRAYER_NAMES[next.key],
      time: timings[next.key],
      countdown: hoursRemaining > 0 
        ? `${hoursRemaining} jam ${minsOnly} menit` 
        : `${minsOnly} menit`,
      isUrgent: minutesRemaining < 15
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
    <div className="max-w-4xl mx-auto space-y-6 pb-20 px-4 pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-3xl border border-primary/20 shadow-sm overflow-hidden relative">
        <div className="z-10 space-y-2">
          <div className="flex items-center gap-2 text-primary font-medium">
            <MapPin className="w-4 h-4" />
            <span>{location?.city}, {location?.country}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            {!mounted ? "--:--:--" : localTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <CalendarDays className="w-4 h-4" />
            <span>{prayerData?.date.readable}</span>
            <span className="mx-1">•</span>
            <span>{prayerData?.date.hijri.day} {prayerData?.date.hijri.month.en} {prayerData?.date.hijri.year} H</span>
          </div>
        </div>

        {nextPrayer && (
          <div className="z-10 bg-background/60 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl min-w-[200px]">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Selanjutnya: {nextPrayer.name}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{nextPrayer.time}</span>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                nextPrayer.isUrgent ? "bg-red-500/20 text-red-600 font-bold" : "bg-primary/20 text-primary"
              )}>
                -{nextPrayer.countdown}
              </span>
            </div>
          </div>
        )}
        
        {/* Decorative elements */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -right-5 top-0 w-20 h-20 bg-primary/20 rounded-full blur-2xl" />
      </div>

      <div className="relative group">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchQuery);
          }} 
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          <button 
            type="submit"
            className="h-11 px-6 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-all flex items-center justify-center disabled:opacity-50"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cari"}
          </button>
        </form>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {suggestions.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => handleSearch(city)}
                className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors flex flex-col gap-0.5 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-primary" />
                  <span className="font-bold">{city.name}</span>
                </div>
                {city.country && (
                  <span className="text-[10px] text-muted-foreground ml-5 uppercase tracking-wider">
                    {city.country}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && !prayerData ? (
          Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-20 bg-card/50 rounded-2xl animate-pulse" />
          ))
        ) : (
          prayerData && MAIN_PRAYERS.map((key) => {
            const isNext = nextPrayer?.name === PRAYER_NAMES[key];
            return (
              <div 
                key={key}
                className={cn(
                  "p-5 rounded-2xl border transition-all flex items-center justify-between group",
                  isNext 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.02]" 
                    : "bg-card border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                    isNext ? "bg-white/20" : "bg-primary/10 text-primary group-hover:bg-primary/20"
                  )}>
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-none mb-1">{PRAYER_NAMES[key]}</h3>
                    <p className={cn(
                      "text-xs",
                      isNext ? "text-white/80" : "text-muted-foreground"
                    )}>Setiap Hari</p>
                  </div>
                </div>
                <div className="text-2xl font-black tracking-tight font-mono">
                  {prayerData.timings[key]}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="text-center pt-4">
        <button 
          onClick={() => {
            localStorage.removeItem("user-location");
            initData();
          }}
          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mx-auto"
        >
          <RefreshCw className="w-3 h-3" />
          Deteksi Ulang Lokasi
        </button>
      </div>
    </div>
  );
}
