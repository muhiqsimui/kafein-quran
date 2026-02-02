"use client";

import { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  Star,
  Clock,
  Moon
} from "lucide-react";
import Link from "next/link";

interface HijriDate {
  day: string;
  month: {
    number: number;
    en: string;
    ar: string;
  };
  year: string;
  weekday: {
    en: string;
    ar: string;
  };
}

interface GregorianDate {
  date: string;
  format: string;
  day: string;
  month: {
    number: number;
    en: string;
  };
  year: string;
}

interface CalendarDay {
  date: string;
  hijri: HijriDate;
  gregorian: GregorianDate;
}

const HIJRI_MONTHS_ID = [
  "Muharram",
  "Safar",
  "Rabi'ul Awwal",
  "Rabi'ul Akhir",
  "Jumadil Ula",
  "Jumadil Akhira",
  "Rajab",
  "Sya'ban",
  "Ramadhan",
  "Syawwal",
  "Dzulqa'dah",
  "Dzulhijjah"
];

const IMPORTANT_DAYS = [
  { date: "2026-01-16", title: "Isra' Mi'raj", type: "holiday" },
  { date: "2026-02-19", title: "Awal Ramadhan 1447 H", type: "event" },
  { date: "2026-03-07", title: "Nuzulul Qur'an", type: "event" },
  { date: "2026-03-20", title: "Cuti Bersama Hari Raya Idul Fitri", type: "holiday" },
  { date: "2026-03-21", title: "Hari Raya Idul Fitri 1447 H", type: "holiday" },
  { date: "2026-05-26", title: "Puasa Arafah", type: "fasting" },
  { date: "2026-05-27", title: "Hari Raya Idul Adha 1447 H", type: "holiday" },
  { date: "2026-06-16", title: "Tahun Baru Islam 1448 H", type: "holiday" },
  { date: "2026-06-24", title: "Puasa Tasu'a", type: "fasting" },
  { date: "2026-06-25", title: "Puasa 'Asyura", type: "fasting" },
  { date: "2026-08-25", title: "Maulid Nabi Muhammad SAW", type: "holiday" },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewedMonth, setViewedMonth] = useState(new Date().getMonth() + 1);
  const [viewedYear, setViewedYear] = useState(new Date().getFullYear());
  const [todayHijri, setTodayHijri] = useState<CalendarDay | null>(null);

  useEffect(() => {
    // Fetch today's Hijri data once on mount
    const fetchToday = async () => {
      const today = new Date();
      try {
        const response = await fetch(
          `https://api.aladhan.com/v1/gToHCalendar/${today.getMonth() + 1}/${today.getFullYear()}`
        );
        const json = await response.json();
        if (json.code === 200 && Array.isArray(json.data)) {
          const found = json.data.find((d: CalendarDay) => {
            const [dd, mm, yy] = d.gregorian.date.split("-");
            return parseInt(dd) === today.getDate() && 
                   parseInt(mm) === today.getMonth() + 1 && 
                   parseInt(yy) === today.getFullYear();
          });
          if (found) setTodayHijri(found);
        }
      } catch (error) {
        console.error("Error fetching today hijri:", error);
      }
    };
    fetchToday();
  }, []);

  useEffect(() => {
    fetchCalendar(viewedMonth, viewedYear);
  }, [viewedMonth, viewedYear]);

  const fetchCalendar = async (month: number, year: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/gToHCalendar/${month}/${year}`
      );
      const json = await response.json();
      if (json.code === 200 && Array.isArray(json.data)) {
        setCalendarData(json.data);
      } else {
        setCalendarData([]);
      }
    } catch (error) {
      console.error("Error fetching calendar:", error);
      setCalendarData([]);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => {
    if (viewedMonth === 12) {
      setViewedMonth(1);
      setViewedYear(viewedYear + 1);
    } else {
      setViewedMonth(viewedMonth + 1);
    }
  };

  const prevMonth = () => {
    if (viewedMonth === 1) {
      setViewedMonth(12);
      setViewedYear(viewedYear - 1);
    } else {
      setViewedMonth(viewedMonth - 1);
    }
  };

  const getImportantDay = (dateStr: string) => {
    // format dateStr is "DD-MM-YYYY"
    const [d, m, y] = dateStr.split("-");
    const isoDate = `${y}-${m}-${d}`;
    return IMPORTANT_DAYS.find(day => day.date === isoDate);
  };

  const isToday = (dateStr: string) => {
    const [d, m, y] = dateStr.split("-");
    const today = new Date();
    return (
      parseInt(d) === today.getDate() &&
      parseInt(m) === today.getMonth() + 1 &&
      parseInt(y) === today.getFullYear()
    );
  };

  const getFastingInfo = (day: CalendarDay) => {
    const hijriDay = parseInt(day.hijri.day);
    const hijriMonth = day.hijri.month.number;
    
    // 1. Ramadan (Wajib)
    if (hijriMonth === 9) {
      return { 
        type: 'ramadhan', 
        label: 'Puasa Ramadhan', 
        className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/50' 
      };
    }

    // 4. Forbidden Days (Haram) - Eid and Tashriq
    // 1 Shawwal (Eid Al-Fitr)
    if (hijriMonth === 10 && hijriDay === 1) {
      return {
        type: 'forbidden',
        label: 'Haram Berpuasa (Idul Fitri)',
        className: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/50 dark:border-red-500/50 outline outline-1 outline-red-500/30'
      };
    }
    // 10 Dzulhijjah (Eid Al-Adha) + 11, 12, 13 (Tashriq)
    if (hijriMonth === 12 && [10, 11, 12, 13].includes(hijriDay)) {
      return {
        type: 'forbidden',
        label: hijriDay === 10 ? 'Haram Berpuasa (Idul Adha)' : 'Haram Berpuasa (Hari Tasyrik)',
        className: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/50 dark:border-red-500/50 outline outline-1 outline-red-500/30'
      };
    }

    // 2. Ayyamul Bidh (13, 14, 15)
    if ([13, 14, 15].includes(hijriDay)) {
      return { 
        type: 'ayyamul-bidh', 
        label: 'Puasa Ayyamul Bidh', 
        className: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/50' 
      };
    }

    // 3. Monday & Thursday
    const [d, m, y] = day.gregorian.date.split("-");
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon, 4 = Thu
    if (dayOfWeek === 1 || dayOfWeek === 4) {
      return { 
        type: 'mon-thu', 
        label: 'Puasa Senin & Kamis', 
        className: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/50' 
      };
    }

    // 4. Specific important fasting days (Arafah, Tasua, Ashura)
    const important = getImportantDay(day.gregorian.date);
    if (important && important.type === 'fasting') {
      return { 
        type: 'sunnah', 
        label: important.title, 
        className: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/50' 
      };
    }

    return null;
  };

  // Helper to get day of week for Gregorian calendar (0=Sunday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const daysInMonth = Array.isArray(calendarData) ? calendarData.length : 0;
  const firstDayOfWeek = getFirstDayOfMonth(viewedYear, viewedMonth);
  
  // Padding for the grid
  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-700">
      <header className="flex items-center gap-4">
        <Link
          href="/"
          className="p-2 hover:bg-accent rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Kalender Islam</h1>
          <p className="text-sm text-muted-foreground">
            Hari Penting Umat Islam & Jadwal Puasa Sunnah
          </p>
        </div>
      </header>

      {/* Hero Card - Current Date */}
      <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl">
        <div className="relative z-10 flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-100">
              <CalendarIcon className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-wider">Hari Ini</span>
            </div>
            {todayHijri ? (
              <>
                <h2 className="text-3xl font-bold">
                  {todayHijri.hijri.day}{" "}
                  {HIJRI_MONTHS_ID[(todayHijri.hijri.month.number || 1) - 1]}{" "}
                  {todayHijri.hijri.year} H
                </h2>
                <p className="text-emerald-100/80">
                  {currentDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </>
            ) : (
              <div className="space-y-2">
                <div className="h-8 w-48 bg-white/20 animate-pulse rounded" />
                <div className="h-4 w-32 bg-white/10 animate-pulse rounded" />
              </div>
            )}
          </div>
          <Moon className="w-12 h-12 text-emerald-100/20" />
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400/20 rounded-full -ml-12 -mb-12 blur-2xl" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl">
            <button 
              onClick={prevMonth}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg">
              {new Date(viewedYear, viewedMonth - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </h3>
            <button 
              onClick={nextMonth}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-7 border-b border-border bg-muted/30">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                <div key={day} className="py-2 text-center text-xs font-bold text-muted-foreground uppercase tracking-tighter">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 relative">
              {loading && (
                <div className="absolute inset-0 bg-card/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              
              {blanks.map((b) => (
                <div key={`blank-${b}`} className="aspect-square p-2 border-b border-r border-border last:border-r-0" />
              ))}
              
              {calendarData.map((day, idx) => {
                const important = getImportantDay(day.gregorian.date);
                const fastingInfo = getFastingInfo(day);
                const today = isToday(day.gregorian.date);
                
                return (
                  <div 
                    key={day.gregorian.date} 
                    className={`aspect-square p-1 md:p-2 border-b border-r border-border relative group transition-all ${
                      idx % 7 === 6 ? 'border-r-0' : ''
                    } ${fastingInfo ? `${fastingInfo.className} border` : 'hover:bg-accent/50'}`}
                  >
                    <div className="flex flex-col h-full justify-between relative z-10">
                      <div className="flex justify-between items-start">
                        <span className={`text-xs md:text-sm font-semibold flex items-center justify-center rounded-full ${
                          today 
                            ? 'bg-primary text-primary-foreground w-6 h-6' 
                            : fastingInfo 
                              ? 'w-6 h-6' 
                              : 'w-6 h-6 text-foreground'
                        }`}>
                          {day.gregorian.day}
                        </span>
                        <span className={`text-[10px] md:text-xs font-arabic ${
                          fastingInfo ? 'opacity-90 font-bold' : 'text-muted-foreground opacity-70'
                        }`}>
                          {day.hijri.day}
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-0.5 mt-auto">
                        {important && (
                          <div 
                            className={`w-full h-1 md:h-1.5 rounded-full ${important.type === 'holiday' ? 'bg-red-500' : 'bg-amber-500'}`}
                            title={important.title}
                          />
                        )}
                        {fastingInfo && (
                          <div className="hidden md:block text-[8px] leading-[1] font-medium truncate mt-0.5">
                            {fastingInfo.label}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Indicators */}
                    <div className="absolute top-0 right-0 p-0.5">
                      {important && (
                        <Star className={`w-2 h-2 fill-amber-400 text-amber-400`} />
                      )}
                      {!important && fastingInfo && fastingInfo.type !== 'forbidden' && (
                        <Moon className={`w-2 h-2 fill-current opacity-50`} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] md:text-xs text-muted-foreground px-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/30" />
              <span>Ramadhan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500/30" />
              <span>Ayyamul Bidh (13-15)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-blue-500/20 border border-blue-500/30" />
              <span>Senin & Kamis</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-purple-500/20 border border-purple-500/30" />
              <span>Sunnah Lainnya</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-red-500/20 border border-red-500/50 animate-pulse" />
              <span className="text-red-600 dark:text-red-400 font-bold">Haram Puasa</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-0.5 rounded-full bg-red-500" />
              <span>Libur Nasional</span>
            </div>
          </div>
        </div>

        {/* Sidebar Sections */}
        <div className="space-y-6">
          {/* Important Days List */}
          <section className="space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Hari Mendatang
            </h3>
            <div className="space-y-3">
              {IMPORTANT_DAYS.filter(d => new Date(d.date) >= new Date())
                .slice(0, 5)
                .map((day) => (
                  <div key={day.date} className="p-4 rounded-xl border border-border bg-card space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm leading-tight">{day.title}</h4>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold ${
                        day.type === 'holiday' ? 'bg-red-500/10 text-red-600' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {day.type === 'holiday' ? 'Libur' : 'Event'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(day.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                ))}
            </div>
          </section>

          {/* Info Card */}
          <section className="p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Info className="w-5 h-5" />
              <h3 className="font-bold">Keutamaan Puasa</h3>
            </div>
            <p className="text-sm text-muted-foreground italic leading-relaxed">
              "Kekasihku (Rasulullah ﷺ) berwasiat kepadaku dengan tiga perkara yang tidak akan aku tinggalkan hingga aku mati: Puasa tiga hari pada setiap bulan (Ayyamul Bidh), Shalat Dhuha, dan tidur setelah melakukan Shalat Witir." (HR. Bukhari)
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
