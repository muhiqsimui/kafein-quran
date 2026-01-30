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
  const [goldPrice, setGoldPrice] = useState<number>(1500000);
  const [ricePrice, setRicePrice] = useState<number>(15000);
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

  // Zakat Perdagangan State
  const [currentAssets, setCurrentAssets] = useState<number>(0);
  const [receivables, setReceivables] = useState<number>(0);
  const [shortTermDebt, setShortTermDebt] = useState<number>(0);

  // Zakat Emas State
  const [goldWeight, setGoldWeight] = useState<number>(0);
  const [silverWeight, setSilverWeight] = useState<number>(0);

  // Zakat Pertanian State
  const [harvestWeight, setHarvestWeight] = useState<number>(0);
  const [irrigationType, setIrrigationType] = useState<"rain" | "mechanical">("rain");

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
        const totalWeight = personCount * 2.5; // 2.5kg per person
        const totalMoney = personCount * 3.5 * ricePrice; // Or 3.5 Liters
        return { totalWeight, totalMoney, zakatAmount: totalMoney, reachedNisab: true, nisab: 0 };
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
        const rate = irrigationType === "rain" ? 0.1 : 0.05;
        const reachedNisab = harvestWeight >= nisabGrain;
        const zakatAmount = reachedNisab ? harvestWeight * rate : 0;
        return { harvestWeight, reachedNisab, zakatAmount, nisab: nisabGrain, label: "Hasil Panen" };
      }
      default:
        return { totalIncome: 0, reachedNisab: false, zakatAmount: 0, nisab: 0, label: "" };
    }
  }, [activeType, income, otherIncome, debt, savings, investments, property, personCount, currentAssets, receivables, shortTermDebt, goldWeight, silverWeight, harvestWeight, irrigationType, goldPrice, ricePrice]);

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
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Kalkulator Zakat</h1>
            <p className="text-sm text-muted-foreground">Hitung kewajiban zakat Anda dengan mudah</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="p-3 bg-primary/10 text-primary rounded-2xl font-bold text-xs flex items-center gap-2 hover:bg-primary/20 transition-all active:scale-95"
        >
          <Info className="w-4 h-4" />
          Syarat Zakat
        </button>
      </div>

      {/* Settings Summary */}
      <div className="grid grid-cols-2 gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
        <div>
          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Harga Emas (per gram)</p>
          <div className="flex items-center gap-2">
            <span className="font-bold">{formatCurrency(goldPrice).replace(",00", "")}</span>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Harga Beras (per kg)</p>
          <div className="flex items-center gap-2">
            <span className="font-bold">{formatCurrency(ricePrice).replace(",00", "")}</span>
          </div>
        </div>
      </div>

      {/* Type Selector */}
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
            Detail {menuItems.find(m => m.id === activeType)?.title}
          </h2>
          
          <div className="space-y-4">
            {activeType === "penghasilan" && (
              <>
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
                  <label className="text-sm font-medium">Hasil Panen (Kilogram / Gabah)</label>
                  <input 
                    type="number" 
                    value={harvestWeight || ""} 
                    onChange={(e) => setHarvestWeight(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-accent/50 border border-border outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Metode Pengairan</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setIrrigationType("rain")}
                      className={cn(
                        "p-3 rounded-xl border text-sm transition-all",
                        irrigationType === "rain" ? "bg-primary/20 border-primary text-primary font-bold" : "bg-accent/50 border-border"
                      )}
                    >
                      Alami (10%)
                    </button>
                    <button
                      onClick={() => setIrrigationType("mechanical")}
                      className={cn(
                        "p-3 rounded-xl border text-sm transition-all",
                        irrigationType === "mechanical" ? "bg-primary/20 border-primary text-primary font-bold" : "bg-accent/50 border-border"
                      )}
                    >
                      Bantuan (5%)
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
              <p className="text-4xl font-black tracking-tight">
                {activeType === "pertanian" 
                  ? `${results.zakatAmount.toFixed(1)} kg` 
                  : formatCurrency(results.zakatAmount).replace(",00", "")}
              </p>
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

          <div className="p-5 bg-primary/10 rounded-2xl border border-primary/20 space-y-3">
            <h4 className="text-sm font-bold flex items-center gap-2 text-primary">
              <Info className="w-4 h-4" />
              Catatan Fiqh
            </h4>
            <div className="text-[11px] leading-relaxed text-slate-800 dark:text-slate-200 space-y-2">
              {activeType === "penghasilan" && <p>Zakat penghasilan (profesi) dihitung dari pendapatan bersih bulanan. <b>Batas nisab disetarakan dengan nilai 85 gram emas per tahun</b> (atau dibagi 12 per bulan). Kadar zakat adalah 2.5%.</p>}
              {activeType === "maal" && <p>Zakat Mal meliputi tabungan, deposito, atau surat berharga yang mengendap 1 tahun (haul) dan mencapai nisab emas 85g.</p>}
              {activeType === "fitrah" && <p>Wajib bagi setiap jiwa Muslim, dikeluarkan sebelum shalat Idul Fitri. Standar 2.5kg beras atau uang senilai harga beras tersebut.</p>}
              {activeType === "perdagangan" && <p>Dihitung dari (Modal + Barang + Piutang) - Hutang Jatuh Tempo. Nisab emas 85g, kadar 2.5%.</p>}
              {activeType === "emas" && <p>Wajib zakat emas jika ≥ 85g, perak ≥ 595g. Dihitung dari nilai emas yang dimiliki dikali 2.5%.</p>}
              {activeType === "pertanian" && <p>Zakat hasil bumi dikeluarkan setiap panen jika mencapai nisab 653kg gabah. Tanpa perlu haul (1 tahun).</p>}
            </div>
          </div>
        </div>
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
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Estimasi Harga Beras / Kg</label>
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
        <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
           <p className="text-[10px] text-blue-600 dark:text-blue-400 italic flex items-start gap-2">
            <Info className="w-3 h-3 shrink-0 mt-0.5" />
            Sesuaikan harga di atas dengan harga pasar daerah Anda untuk akurasi perhitungan nisab yang lebih tepat.
          </p>
        </div>
      </div>
    </div>
  );
}
