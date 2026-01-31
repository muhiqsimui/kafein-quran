import { useState, useCallback } from "react";

export type ShareTheme = 'midnight' | 'emerald' | 'sunset' | 'ocean' | 'minimal' | 'rose';

interface GenerateImageProps {
  chapterName: string;
  ayahNumber: number;
  textArabic?: string;
  translation?: string;
  note?: string;
  includeNote: boolean;
  showArabic: boolean;
  showTranslation: boolean;
  theme: ShareTheme;
}

const THEMES: Record<ShareTheme, { bg: string[], primary: string, secondary: string, text: string, accent: string, pattern: boolean }> = {
  midnight: {
    bg: ["#020617", "#0f172a", "#1e293b"],
    primary: "#10b981", // Emerald
    secondary: "#94a3b8",
    text: "#ffffff",
    accent: "rgba(16, 185, 129, 0.25)",
    pattern: true
  },
  emerald: {
    bg: ["#064e3b", "#065f46", "#047857"],
    primary: "#34d399",
    secondary: "#a7f3d0",
    text: "#ffffff",
    accent: "rgba(52, 211, 153, 0.25)",
    pattern: true
  },
  sunset: {
    bg: ["#4c1d95", "#701a75", "#831843"],
    primary: "#fbbf24",
    secondary: "#fde68a",
    text: "#ffffff",
    accent: "rgba(251, 191, 36, 0.25)",
    pattern: true
  },
  ocean: {
    bg: ["#1e3a8a", "#1d4ed8", "#1e40af"],
    primary: "#38bdf8",
    secondary: "#bae6fd",
    text: "#ffffff",
    accent: "rgba(56, 189, 248, 0.25)",
    pattern: true
  },
  rose: {
    bg: ["#881337", "#9f1239", "#4c0519"],
    primary: "#fda4af",
    secondary: "#fecdd3",
    text: "#ffffff",
    accent: "rgba(253, 164, 175, 0.25)",
    pattern: true
  },
  minimal: {
    bg: ["#ffffff", "#f8fafc", "#f1f5f9"],
    primary: "#0f172a",
    secondary: "#64748b",
    text: "#0f172a",
    accent: "rgba(15, 23, 42, 0.05)",
    pattern: false
  }
};

export function useAyahCanvas() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = useCallback(async (data: GenerateImageProps) => {
    const { 
      chapterName, 
      ayahNumber, 
      textArabic, 
      translation, 
      note, 
      includeNote, 
      showArabic, 
      showTranslation,
      theme: themeKey
    } = data;
    
    setIsGenerating(true);

    const arabicFont = "'LPMQ Isep Misbah', serif";
    const sansFont = "'Outfit', 'Inter', sans-serif";

    try {
      // Ensure font is loaded
      await document.fonts.load("12px 'LPMQ Isep Misbah'");
      await document.fonts.ready;
    } catch (e) {
      console.warn("Font loading skipped", e);
    }

    const theme = THEMES[themeKey] || THEMES.midnight;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 1080;
    const padding = 80;
    const maxWidth = width - (padding * 2);
    
    // Virtual drawing to calculate height
    let currentHeight = 0;
    const margins = {
      header: 100,
      arabic: 120,
      separator: 80,
      translation: 60,
      note: 80,
      footer: 150
    };

    // 1. Header space
    currentHeight += 250; // Logo + QS Name space

    const wrapText = (
      text: string, 
      ctx: CanvasRenderingContext2D, 
      maxWidth: number, 
      lineHeight: number, 
      draw: boolean = false, 
      x: number = 0, 
      y: number = 0, 
      rtl: boolean = false
    ) => {
      if (!text) return 0;
      ctx.direction = rtl ? "rtl" : "ltr";
      
      const words = text.split(" ");
      let line = "";
      let linesCount = 0;
      let currentY = y;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          if (draw) {
            ctx.fillText(line.trim(), x, currentY);
          }
          line = words[n] + " ";
          currentY += lineHeight;
          linesCount++;
        } else {
          line = testLine;
        }
      }
      
      if (draw) {
        ctx.fillText(line.trim(), x, currentY);
      }
      linesCount++;
      return linesCount * lineHeight;
    };

    // Calculate Arabic Height
    let arabicHeight = 0;
    if (showArabic && textArabic) {
      ctx.font = `80px ${arabicFont}`;
      arabicHeight = wrapText(textArabic, ctx, maxWidth, 140, false, 0, 0, true);
    }

    // Calculate Translation Height
    let translationHeight = 0;
    const cleanTrans = translation ? translation.replace(/<(?:.|\n)*?>/gm, "") : "";
    if (showTranslation && cleanTrans) {
      ctx.font = `italic 36px ${sansFont}`;
      translationHeight = wrapText(cleanTrans, ctx, maxWidth, 55, false);
    }

    // Calculate Note Height
    let noteHeight = 0;
    if (includeNote && note) {
      ctx.font = `italic 32px ${sansFont}`;
      noteHeight = wrapText(note, ctx, maxWidth - 80, 45, false) + 120; // +120 for box padding and title
    }

    // Sum up heights
    let totalHeight = currentHeight;
    if (showArabic && textArabic) totalHeight += arabicHeight + margins.arabic;
    if (showArabic && showTranslation && textArabic && cleanTrans) totalHeight += margins.separator;
    if (showTranslation && cleanTrans) totalHeight += translationHeight + margins.translation;
    if (includeNote && note) totalHeight += noteHeight + margins.note;
    totalHeight += margins.footer;

    // Minimum height for 9:16 aspect ratio
    canvas.width = width;
    canvas.height = Math.max(1920, totalHeight);

    // --- Start Drawing ---
    
    // 1. Background
    const drawBg = () => {
      // Main Gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, theme.bg[0]);
      gradient.addColorStop(0.5, theme.bg[1]);
      gradient.addColorStop(1, theme.bg[2] || theme.bg[1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Noise/Grain
      ctx.globalAlpha = 0.05;
      for (let i = 0; i < 50000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.fillStyle = theme.text;
        ctx.fillRect(x, y, 1, 1);
      }
      ctx.globalAlpha = 1.0;

      // Islamic Pattern / Ornaments
      if (theme.pattern) {
        ctx.save();
        ctx.globalAlpha = 0.07;
        ctx.strokeStyle = theme.primary;
        ctx.lineWidth = 1;
        
        const patternSize = 120;
        for (let x = 0; x < canvas.width + patternSize; x += patternSize) {
          for (let y = 0; y < canvas.height + patternSize; y += patternSize) {
            ctx.beginPath();
            ctx.moveTo(x, y - 20);
            ctx.lineTo(x + 20, y);
            ctx.lineTo(x, y + 20);
            ctx.lineTo(x - 20, y);
            ctx.closePath();
            ctx.stroke();
            
            // Octagon
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
              const angle = (i * Math.PI) / 4;
              const px = x + 30 * Math.cos(angle);
              const py = y + 30 * Math.sin(angle);
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
          }
        }
        ctx.restore();

        // Decorative Blurs
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = theme.primary;
        ctx.filter = "blur(120px)";
        ctx.beginPath(); ctx.arc(canvas.width, 0, 800, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(0, canvas.height, 600, 0, Math.PI * 2); ctx.fill();
        ctx.filter = "none";
        ctx.globalAlpha = 1.0;
      }
    };
    drawBg();

    let cursorY = 150;

    // 2. Header
    // Logo Icon Placeholder (Star of David / Rub el Hizb style)
    if (themeKey !== 'minimal') {
      ctx.save();
      ctx.translate(canvas.width / 2, cursorY - 30);
      ctx.fillStyle = theme.primary;
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-25, -25, 50, 50);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-25, -25, 50, 50);
      ctx.restore();
      cursorY += 60;
    }

    ctx.font = `700 48px ${sansFont}`;
    ctx.fillStyle = theme.text;
    ctx.textAlign = "center";
    ctx.fillText("Kafein Quran", canvas.width / 2, cursorY);

    cursorY += 75;
    ctx.font = `600 42px ${sansFont}`;
    ctx.fillStyle = theme.secondary;
    ctx.fillText(`QS. ${chapterName} : ${ayahNumber}`, canvas.width / 2, cursorY);
    
    cursorY += 180;

    // 3. Arabic Text
    if (showArabic && textArabic) {
      ctx.font = `80px ${arabicFont}`;
      ctx.fillStyle = theme.text;
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 10;
      const h = wrapText(textArabic, ctx, maxWidth, 140, true, canvas.width / 2, cursorY, true);
      ctx.shadowBlur = 0;
      cursorY += h + margins.arabic / 2;
    }

    // Separator
    if (showArabic && showTranslation && textArabic && cleanTrans) {
      cursorY += 20;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 150, cursorY);
      ctx.lineTo(canvas.width / 2 + 150, cursorY);
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.stroke();
      
      // Dot in middle
      ctx.beginPath();
      ctx.arc(canvas.width / 2, cursorY, 6, 0, Math.PI * 2);
      ctx.fillStyle = theme.primary;
      ctx.fill();
      
      cursorY += 100;
    } else if (showArabic && textArabic) {
        cursorY += 40;
    }

    // 4. Translation
    if (showTranslation && cleanTrans) {
      ctx.font = `italic 38px ${sansFont}`;
      ctx.fillStyle = theme.secondary;
      const h = wrapText(cleanTrans, ctx, maxWidth, 60, true, canvas.width / 2, cursorY, false);
      cursorY += h + margins.translation;
    }

    // 5. Note
    if (includeNote && note) {
      cursorY += 40;
      const boxWidth = maxWidth;
      const boxX = (canvas.width - boxWidth) / 2;
      
      // Calculate real note height again for the box
      ctx.font = `italic 32px ${sansFont}`;
      const h = wrapText(note, ctx, boxWidth - 80, 50, false);
      const boxHeight = h + 150;

      // Draw Box with Shadow
      ctx.shadowColor = "rgba(0,0,0,0.2)";
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 10;
      
      ctx.fillStyle = theme.accent;
      if (themeKey === 'minimal') {
          ctx.strokeStyle = theme.secondary;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(boxX, cursorY, boxWidth, boxHeight, 32);
          ctx.stroke();
          ctx.fill();
      } else {
          ctx.beginPath();
          ctx.roundRect(boxX, cursorY, boxWidth, boxHeight, 32);
          ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      
      ctx.fillStyle = theme.primary;
      ctx.font = `bold 28px ${sansFont}`;
      ctx.textAlign = "left";
      ctx.fillText("Catatan Saya", boxX + 45, cursorY + 70);
      
      ctx.fillStyle = theme.text;
      ctx.font = `italic 32px ${sansFont}`;
      wrapText(note, ctx, boxWidth - 90, 50, true, boxX + 45, cursorY + 130, false);
      
      cursorY += boxHeight + margins.note;
    }

    // 6. Footer
    ctx.save();
    const footerY = canvas.height - 120;
    ctx.font = `300 32px ${sansFont}`;
    ctx.textAlign = "center";
    ctx.fillStyle = theme.secondary;
    
    // Glassy footer pill
    if (themeKey !== 'minimal') {
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.beginPath();
      ctx.roundRect(canvas.width/2 - 200, footerY - 45, 400, 70, 35);
      ctx.fill();
    }
    
    ctx.fillStyle = theme.secondary;
    const domain = typeof window !== "undefined" ? window.location.hostname : "quran.kafein.web.id";
    ctx.fillText(domain, canvas.width / 2, footerY);
    ctx.restore();

    const dataUrl = canvas.toDataURL("image/png");
    setPreviewUrl(dataUrl);
    setIsGenerating(false);
  }, []);

  return { previewUrl, isGenerating, generateImage };
}
