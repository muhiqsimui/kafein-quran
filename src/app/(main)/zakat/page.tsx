"use client";

import { useState, useMemo } from "react";
import { 
  Wallet, 
  ChevronLeft, 
  Info, 
  Calculator, 
  Coins, 
  Briefcase, 
  LandPlot, 
  UserRound,
  ArrowRight,
  RefreshCcw,
  CheckCircle2,
  LucideIcon,
  ChevronDown,
  X
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ZakatType = "penghasilan" | "maal" | "fitrah" | "perdagangan" | "emas" | "pertanian";

export default function ZakatPage() {
  const [activeType, setActiveType] = useState<ZakatType>("maal");
  const [goldPrice, setGoldPrice] = useState<number>(1382500);
  const [ricePrice, setRicePrice] = useState<number>(16300);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Zakat Penghasilan State
  const [income, setIncome] = useState<number>(0);
  const [otherIncome, setOtherIncome] = useState<number>(0);
  const [debt, setDebt] = useState<number>(0);

  // Zakat Maal State
  const [savings, setSavings] = useState<number>(0);
  const [investments, setInvestments] = useState<number>(0);
  const [property, setProperty] = useState<number>(0);

  // Zakat Fitrah State
  const [personCount, setPersonCount] = useState<number>(1);
  const [fitrahType, setFitrahType] = useState<string>("beras");

  const fitrahCommodities = [
    { id: "beras", name: "Beras", weight: 2.5, label: "Beras (2.5 kg)" },
    { id: "gandum", name: "Gandum", weight: 2.5, label: "Gandum (2.5 kg)" },
    { id: "kurma", name: "Kurma", weight: 2.5, label: "Kurma (2.5 kg)" },
    { id: "kismis", name: "Kismis", weight: 2.5, label: "Kismis (2.5 kg)" },
    { id: "susu", name: "Keju / Susu Kering", weight: 2.5, label: "Susu Kering (2.5 kg)" },
  ];

  // Zakat Perdagangan State
  const [currentAssets, setCurrentAssets] = useState<number>(0);
  const [receivables, setReceivables] = useState<number>(0);
  const [shortTermDebt, setShortTermDebt] = useState<number>(0);

  // Zakat Emas State
  const [goldWeight, setGoldWeight] = useState<number>(0);
  const [silverWeight, setSilverWeight] = useState<number>(0);

  // Zakat Pertanian State
  const [harvestWeight, setHarvestWeight] = useState<number>(0);
  const [irrigationType, setIrrigationType] = useState<"rain" | "mechanical" | "mixed">("rain");
  const [agricultureType, setAgricultureType] = useState<string>("padi");

  const agricultureCommodities = [
    { id: "padi", name: "Padi / Beras", nisab: 653, unit: "kg" },
    { id: "jagung", name: "Jagung", nisab: 653, unit: "kg" },
    { id: "gandum", name: "Gandum", nisab: 653, unit: "kg" },
    { id: "kurma", name: "Kurma / Anggur", nisab: 653, unit: "kg" },
    { id: "bijian", name: "Biji-bijian", nisab: 653, unit: "kg" },
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const results = useMemo(() => {
    const nisabGoldYearly = 85 * goldPrice;
    const nisabGoldMonthly = nisabGoldYearly / 12;
    const nisabSilver = 595 * goldPrice * 0.015; // Rough estimate for silver if not provided
    const nisabGrain = 653; // kg grain

    switch (activeType) {
      case "penghasilan": {
        const totalIncome = income + otherIncome - debt;
        const reachedNisab = totalIncome >= nisabGoldMonthly; 
        const zakatAmount = reachedNisab ? totalIncome * 0.025 : 0;
        return { totalIncome, reachedNisab, zakatAmount, nisab: nisabGoldMonthly, label: "Pendapatan Bersih" };
      }
      case "maal": {
        const totalMaal = savings + investments + property;
        const reachedNisab = totalMaal >= nisabGoldYearly;
        const zakatAmount = reachedNisab ? totalMaal * 0.025 : 0;
        return { totalMaal, reachedNisab, zakatAmount, nisab: nisabGoldYearly, label: "Total Harta" };
      }
      case "fitrah": {
        const selectedCommodity = fitrahCommodities.find(c => c.id === fitrahType) || fitrahCommodities[0];
        const totalWeight = personCount * selectedCommodity.weight;
        const totalMoney = personCount * selectedCommodity.weight * ricePrice; 
        return { totalWeight, totalMoney, zakatAmount: totalMoney, reachedNisab: true, nisab: 0, weightUnit: "kg" };
      }
      case "perdagangan": {
        const totalTrade = currentAssets + receivables - shortTermDebt;
        const reachedNisab = totalTrade >= nisabGoldYearly;
        const zakatAmount = reachedNisab ? totalTrade * 0.025 : 0;
        return { totalTrade, reachedNisab, zakatAmount, nisab: nisabGoldYearly, label: "Aset Dagang Bersih" };
      }
      case "emas": {
        const goldZakat = goldWeight >= 85 ? goldWeight * goldPrice * 0.025 : 0;
        const silverZakat = silverWeight >= 595 ? silverWeight * (goldPrice * 0.015) * 0.025 : 0; // rough silver price
        return { goldZakat, silverZakat, zakatAmount: goldZakat + silverZakat, reachedNisab: goldWeight >= 85 || silverWeight >= 595, nisab: 0 };
      }
      case "pertanian": {
        const rate = irrigationType === "rain" ? 0.1 : irrigationType === "mixed" ? 0.075 : 0.05;
        const selectedAgri = agricultureCommodities.find(a => a.id === agricultureType) || agricultureCommodities[0];
        const reachedNisab = harvestWeight >= selectedAgri.nisab;
        const zakatAmount = reachedNisab ? harvestWeight * rate : 0;
        return { harvestWeight, reachedNisab, zakatAmount, nisab: selectedAgri.nisab, label: "Hasil Panen" };
      }
      default:
        return { totalIncome: 0, reachedNisab: false, zakatAmount: 0, nisab: 0, label: "" };
    }
  }, [activeType, income, otherIncome, debt, savings, investments, property, personCount, fitrahType, currentAssets, receivables, shortTermDebt, goldWeight, silverWeight, harvestWeight, irrigationType, agricultureType, goldPrice, ricePrice]);

  const menuItems: { id: ZakatType; title: string; icon: LucideIcon; description?: string }[] = [
    { id: "maal", title: "Maal (Harta)", icon: Wallet },
    { id: "fitrah", title: "Fitrah", icon: UserRound },
    { id: "perdagangan", title: "Perdagangan", icon: Coins },
    { id: "emas", title: "Emas & Perak", icon: Calculator },
    { id: "pertanian", title: "Pertanian", icon: LandPlot },
    { id: "penghasilan", title: "Penghasilan", icon: Briefcase, description: "Zakat Profesi" },
  ];

  const visibleMenuItems = menuItems.slice(0, 5);
  const hiddenMenuItems = menuItems.slice(5);

  const formatWithDots = (num: number) => {
    if (num === 0) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseDots = (val: string) => {
    const clean = val.replace(/\./g, "");
    const parsed = parseInt(clean, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 px-4 pt-4 animate-in fade-in duration-700">
      {/* Mandatory Conditions Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-border flex justify-between items-center bg-primary/5">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Syarat Wajib Zakat
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-accent rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {[
                { title: "Beragama Islam", desc: "Zakat hanya diwajibkan bagi setiap Muslim." },
                { title: "Merdeka", desc: "Bukan merupakan budak atau hamba sahaya." },
                { title: "Milik Sempurna", desc: "Harta dimiliki sepenuhnya dan ada dalam kendali pemilik." },
                { title: "Mencapai Nisab", desc: "Harta mencapai batas minimum kewajiban zakat." },
                { title: "Mencapai Haul", desc: "Harta telah dimiliki selama satu tahun Hijriah (kecuali hasil bumi/pertanian)." },
                { title: "Lebihan Keperluan Asasi", desc: "Harta setelah dikurangi kebutuhan pokok pemenuhan hidup." },
                { title: "Bebas dari Hutang", desc: "Pemilik tidak memiliki hutang yang harus dilunasi segera." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-accent/30 border-t border-border">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                Paham
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
{/* Header */}
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  {/* Left section */}
  <div className="flex items-center gap-3">
    <Link
      href="/"
      aria-label="Kembali"
      className="p-2 rounded-full hover:bg-accent transition-colors"
    >
      <ChevronLeft className="w-5 h-5" />
    </Link>

    <div className="leading-tight">
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
        Kalkulator Zakat
      </h1>
      <p className="text-sm text-muted-foreground">
        Hitung kewajiban zakat Anda dengan mudah
      </p>
    </div>
  </div>

  {/* Right section */}
  <button
    onClick={() => setIsModalOpen(true)}
    className="inline-flex items-center justify-center gap-2
               rounded-xl border border-primary/20
               px-4 py-2 text-xs font-semibold text-primary
               hover:bg-primary/10 transition-all active:scale-95"
  >
    <Info className="w-4 h-4" />
    Syarat Zakat
  </button>
</div>


      {/* Market Prices Configuration */}
      <div className="bg-card p-6 rounded-3xl border border-border space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <RefreshCcw className="w-4 h-4 text-primary" />
            Harga Pasar Terkini
          </h3>
          <span className="text-[10px] text-muted-foreground bg-accent px-2 py-1 rounded-full">Konfigurasi Manual</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Estimasi Harga Emas / Gram</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">Rp</span>
              <input 
                type="text" 
                value={formatWithDots(goldPrice)} 
                onChange={(e) => setGoldPrice(parseDots(e.target.value))}
                className="w-full pl-10 p-3 rounded-xl bg-accent/30 border border-border outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Estimasi Harga {fitrahCommodities.find(c => c.id === fitrahType)?.name || "Beras"} / Kg</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">Rp</span>
              <input 
                type="text" 
                value={formatWithDots(ricePrice)} 
                onChange={(e) => setRicePrice(parseDots(e.target.value))}
                className="w-full pl-10 p-3 rounded-xl bg-accent/30 border border-border outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold"
              />
            </div>
          </div>
        </div>
<div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
  <p className="flex items-start gap-2 text-xs leading-relaxed text-foreground/80">
    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
    <span>
      Sesuaikan harga emas dengan harga emas hari ini di daerah Anda untuk
      akurasi perhitungan nisab yang lebih tepat.  
      Untuk harga beras, sesuaikan dengan harga beras yang Anda konsumsi
      sehari-hari.
    </span>
  </p>
</div>

      </div>

      {/* Type Selector */}
      <h2 className="text-lg font-bold text-center" >Pilih Zakat</h2>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        
        {visibleMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveType(item.id);
              setShowDropdown(false);
            }}
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center",
              activeType === item.id 
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-card border-border hover:border-primary/50"
            )}
          >
            <item.icon className={cn("w-5 h-5", activeType === item.id ? "text-white" : "text-primary")} />
            <span className="text-[10px] md:text-xs font-medium">{item.title}</span>
          </button>
        ))}
        
        {/* Dropdown for other zakat types */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={cn(
              "w-full h-full flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center",
              hiddenMenuItems.some(m => m.id === activeType)
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-card border-border hover:border-primary/50"
            )}
          >
            <ChevronDown className={cn("w-5 h-5", hiddenMenuItems.some(m => m.id === activeType) ? "text-white" : "text-primary")} />
            <span className="text-[10px] md:text-xs font-medium">Lainnya</span>
          </button>

          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-xl z-10 overflow-hidden animate-in fade-in slide-in-from-top-2">
              {hiddenMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveType(item.id);
                    setShowDropdown(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 text-left hover:bg-accent transition-colors",
                    activeType === item.id ? "text-primary font-bold bg-primary/5" : ""
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <div className="flex flex-col">
                    <span className="text-xs">{item.title}</span>
                    {item.description && <span className="text-[9px] text-muted-foreground">{item.description}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="space-y-4 bg-card p-6 rounded-2xl border border-border">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Zakat {menuItems.find(m => m.id === activeType)?.title}
          </h2>
          
          <div className="space-y-4">
            {activeType === "penghasilan" && (
              <>
              <p className="text-xs leading-relaxed text-muted-foreground">Note: Sebagian ulama berpendapat penghasilan yg kena zakat apabila penghasilan tersebut telah mengendap selama satu tahun</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
“Tidak ada zakat pada harta hingga berlalu satu tahun.”
(HR. Abu Dawud)
                </p>  
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pendapatan Bulanan (Gaji, dsb)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                    <input 
                      type="text" 
                      value={formatWithDots(income)} 
                      onChange={(e) => setIncome(parseDots(e.target.value))}
                      className="w-full pl-10 p-3 rounded-xl bg-accent/50 border border-border outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bonus / Pendapatan Lainnya</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                    <input 
                      type="text" 
                      value={formatWithDots(otherIncome)} 
                      onChange={(e) => setOtherIncome(parseDots(e.target.value))}
                      className="w-full pl-10 p-3 rounded-xl bg-accent/50 border border-border outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cicilan / Hutang Jatuh Tempo</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                    <input 
                      type="text" 
                      value={formatWithDots(debt)} 
                      onChange={(e) => setDebt(parseDots(e.target.value))}
                      className="w-full pl-10 p-3 rounded-xl bg-accent/50 border border-border outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="0"
                    />
                  </div>
                </div>
              </>
            )}

            {activeType === "maal" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Uang Tunai / Tabungan / Deposito</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                    <input 
                      type="text" 
                      value={formatWithDots(savings)} 
                      onChange={(e) => setSavings(parseDots(e.target.value))}
                      className="w-full pl-10 p-3 rounded-xl bg-accent/50 border border-border outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Saham / Reksadana / Investasi</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                    <input 
                      type="text" 
                      value={formatWithDots(investments)} 
                      onChange={(e) => setInvestments(parseDots(e.target.value))}
                      className="w-full pl-10 p-3 rounded-xl bg-accent/50 border border-border outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Properti / Aset (Lainnya)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                    <input 
                      type="text" 
                      value={formatWithDots(property)} 
                      onChange={(e) => setProperty(parseDots(e.target.value))}
                      className="w-full pl-10 p-3 rounded-xl bg-accent/50 border border-border outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </>
            )}

            {activeType === "fitrah" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Jenis Bahan Makanan</label>
                  <div className="relative">
                    <select 
                      value={fitrahType}
                      onChange={(e) => setFitrahType(e.target.value)}
                      className="w-full p-3 pr-10 rounded-xl bg-accent/50 border border-border outline-none focus:ring-2 focus:ring-primary/20 text-sm appearance-none cursor-pointer"
                    >
                      {fitrahCommodities.map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Jumlah Anggota Keluarga (Orang)</label>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setPersonCount(Math.max(1, personCount - 1))}
                      className="w-12 h-12 rounded-xl border border-border flex items-center justify-center hover:bg-accent"
                    >- </button>
                    <span className="text-2xl font-bold flex-1 text-center">{personCount}</span>
                    <button 
                      onClick={() => setPersonCount(personCount + 1)}
                      className="w-12 h-12 rounded-xl border border-border flex items-center justify-center hover:bg-accent"
                    >+</button>
                  </div>
                </div>
              </div>
            )}

            {activeType === "perdagangan" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Modal + Barang Dagangan</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                    <input 
                      type="text" 
                      value={formatWithDots(currentAssets)} 
                      onChange={(e) => setCurrentAssets(parseDots(e.target.value))}
                      className="w-full pl-10 p-3 rounded-xl bg-accent/50 border border-border outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Piutang Lancar</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                    <input 
                      type="text" 
                      value={formatWithDots(receivables)} 
                      onChange={(e) => setReceivables(parseDots(e.target.value))}
                      className="w-full pl-10 p-3 rounded-xl bg-accent/50 border border-border outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hutang Jatuh Tempo</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                    <input 
                      type="text" 
                      value={formatWithDots(shortTermDebt)} 
                      onChange={(e) => setShortTermDebt(parseDots(e.target.value))}
                      className="w-full pl-10 p-3 rounded-xl bg-accent/50 border border-border outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </>
            )}

            {activeType === "emas" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Berat Emas (Gram)</label>
                  <input 
                    type="number" 
                    value={goldWeight || ""} 
                    onChange={(e) => setGoldWeight(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-accent/50 border border-border outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="0"
                  />
                  <p className="text-[10px] text-muted-foreground italic">*Nisab Emas 85gr</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Berat Perak (Gram)</label>
                  <input 
                    type="number" 
                    value={silverWeight || ""} 
                    onChange={(e) => setSilverWeight(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-accent/50 border border-border outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="0"
                  />
                  <p className="text-[10px] text-muted-foreground italic">*Nisab Perak 595gr</p>
                </div>
              </>
            )}

            {activeType === "pertanian" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Jenis Hasil Pertanian</label>
                  <div className="relative">
                    <select 
                      value={agricultureType}
                      onChange={(e) => setAgricultureType(e.target.value)}
                      className="w-full p-3 pr-10 rounded-xl bg-accent/50 border border-border outline-none focus:ring-2 focus:ring-primary/20 text-sm appearance-none cursor-pointer"
                    >
                      {agricultureCommodities.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hasil Panen (Kilogram)</label>
                  <input 
                    type="number" 
                    value={harvestWeight || ""} 
                    onChange={(e) => setHarvestWeight(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-accent/50 border border-border outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="0"
                  />
                  <p className="text-[10px] text-muted-foreground italic">*Nisab {agricultureCommodities.find(a => a.id === agricultureType)?.name} adalah {agricultureCommodities.find(a => a.id === agricultureType)?.nisab} kg</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Metode Pengairan</label>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => setIrrigationType("rain")}
                      className={cn(
                        "p-3 rounded-xl border text-sm transition-all text-left flex flex-col gap-1",
                        irrigationType === "rain" ? "bg-primary/20 border-primary shadow-sm" : "bg-accent/50 border-border hover:bg-accent"
                      )}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className={cn("font-bold", irrigationType === "rain" ? "text-primary" : "")}>Alami (10%)</span>
                        {irrigationType === "rain" && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </div>
                      <span className="text-[10px] text-muted-foreground">Menggunakan air hujan, sungai, atau mata air tanpa biaya tambahan.</span>
                    </button>
                    
                    <button
                      onClick={() => setIrrigationType("mechanical")}
                      className={cn(
                        "p-3 rounded-xl border text-sm transition-all text-left flex flex-col gap-1",
                        irrigationType === "mechanical" ? "bg-primary/20 border-primary shadow-sm" : "bg-accent/50 border-border hover:bg-accent"
                      )}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className={cn("font-bold", irrigationType === "mechanical" ? "text-primary" : "")}>Bantuan / Berbiaya (5%)</span>
                        {irrigationType === "mechanical" && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </div>
                      <span className="text-[10px] text-muted-foreground">Menggunakan alat bantu (pompa, air beli, dsb) yang mengeluarkan biaya.</span>
                    </button>

                    <button
                      onClick={() => setIrrigationType("mixed")}
                      className={cn(
                        "p-3 rounded-xl border text-sm transition-all text-left flex flex-col gap-1",
                        irrigationType === "mixed" ? "bg-primary/20 border-primary shadow-sm" : "bg-accent/50 border-border hover:bg-accent"
                      )}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className={cn("font-bold", irrigationType === "mixed" ? "text-primary" : "")}>Campuran (7.5%)</span>
                        {irrigationType === "mixed" && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </div>
                      <span className="text-[10px] text-muted-foreground">Perpaduan antara pengairan alami dan bantuan yang mengeluarkan biaya.</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="flex flex-col gap-4">
          <div className={cn(
            "p-6 rounded-2xl border transition-all flex flex-col items-center text-center justify-center gap-4 h-full min-h-[300px]",
            results.zakatAmount > 0 
              ? "bg-emerald-500/10 border-emerald-500/20 shadow-inner" 
              : "bg-orange-500/10 border-orange-500/20 shadow-inner"
          )}>
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mb-2",
              results.zakatAmount > 0 ? "bg-emerald-500 text-white" : "bg-orange-500 text-white"
            )}>
              {results.zakatAmount > 0 ? <CheckCircle2 className="w-8 h-8" /> : <Info className="w-8 h-8" />}
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Wajib Zakat</h3>
              <div className="flex flex-col items-center">
                <p className="text-4xl font-black tracking-tight">
                  {activeType === "pertanian" 
                    ? `${results.zakatAmount.toFixed(1)} kg` 
                    : activeType === "fitrah"
                      ? `${results.totalWeight} kg`
                      : formatCurrency(results.zakatAmount).replace(",00", "")}
                </p>
                {(activeType === "fitrah" || activeType === "pertanian") && (
                  <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">
                    {activeType === "fitrah" 
                      ? fitrahCommodities.find(c => c.id === fitrahType)?.name
                      : agricultureCommodities.find(a => a.id === agricultureType)?.name}
                  </p>
                )}
              </div>

              {activeType === "fitrah" && (
                <p className="text-sm font-bold text-primary bg-primary/10 px-4 py-2 rounded-2xl mt-2 flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  Setara {formatCurrency(results.zakatAmount).replace(",00", "")}
                </p>
              )}
            </div>

            <div className="w-full pt-4 border-t border-border/50">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-muted-foreground">Status:</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                  results.reachedNisab ? "bg-emerald-500/20 text-emerald-600" : "bg-orange-500/20 text-orange-600"
                )}>
                  {results.reachedNisab ? "Wajib Zakat" : "Belum Wajib"}
                </span>
              </div>
              {results.nisab > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Batas Nisab:</span>
                  <span className="font-medium text-xs">
                    {activeType === "pertanian" ? `${results.nisab} kg` : formatCurrency(results.nisab || 0).replace(",00", "")}
                  </span>
                </div>
              )}
            </div>

            {!results.reachedNisab && (
              <p className="text-[10px] text-muted-foreground italic mt-2 leading-relaxed">
                *Harta belum mencapai nisab. Anda tetap disarankan untuk berinfaq agar harta lebih berkah.
              </p>
            )}
          </div>
{/* Catatan Fiqh */}
<div className="p-4 rounded-xl border bg-muted/50 space-y-2">
  <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
    <Info className="w-4 h-4 text-muted-foreground" />
    Catatan Fiqh
  </h4>

  {activeType === "penghasilan" && (
    <p className="text-xs leading-relaxed text-muted-foreground">
      Zakat penghasilan dihitung dari pendapatan bersih bulanan. Nisab setara nilai
      85 gram emas per tahun (dibagi 12). Kadar zakat
      <span className="font-medium text-foreground"> 2,5%</span>.
    </p>
  )}

  {activeType === "maal" && (
    <p className="text-xs leading-relaxed text-muted-foreground">
      Zakat mal mencakup <span className="font-medium text-foreground">tabungan, deposito, atau surat berharga</span> yang mengendap
      <span className="font-medium text-foreground"> selama 1 tahun (haul)</span> dan mencapai nisab
      <span className="font-medium text-foreground"> 85 gram emas</span>.
    </p>
  )}

  {activeType === "fitrah" && (
    <p className="text-xs leading-relaxed text-muted-foreground">
      Zakat fitrah wajib bagi setiap jiwa Muslim dan ditunaikan sebelum shalat
      Idul Fitri. Standarnya
      <span className="font-medium text-foreground"> 2,5 kg makanan pokok </span>
      (seperti beras, gandum, atau kurma) atau nilai setara.
    </p>
  )}

  {activeType === "perdagangan" && (
    <p className="text-xs leading-relaxed text-muted-foreground">
      Zakat perdagangan dihitung dari (Modal + Barang + Piutang) dikurangi
      hutang jatuh tempo. Nisab setara
      <span className="font-medium text-foreground"> 85 gram emas</span>
      , kadar zakat
      <span className="font-medium text-foreground"> 2,5%</span>.
    </p>
  )}

  {activeType === "emas" && (
    <p className="text-xs leading-relaxed text-muted-foreground">
      Zakat emas wajib jika kepemilikan mencapai
      <span className="font-medium text-foreground"> emas ≥ 85 gram </span>
      dan 
      <span className="font-medium text-foreground"> perak ≥ 595 gram</span>.
      Kadar zakat 2,5% dari nilai kepemilikan.
    </p>
  )}

  {activeType === "pertanian" && (
    <p className="text-xs leading-relaxed text-muted-foreground">
      Zakat pertanian dikeluarkan setiap panen apabila hasil mencapai nisab
      <span className="font-medium text-foreground"> 653 kg gabah/makanan pokok</span>. 
      Kadar zakat: <span className="font-medium text-foreground">10%</span> (alami), 
      <span className="font-medium text-foreground"> 5%</span> (berbiaya), atau 
      <span className="font-medium text-foreground"> 7,5%</span> (campuran).
    </p>
  )}
</div>

{/* Penutup Catatan */}

        </div>
      </div>


    </div>
  );
}
