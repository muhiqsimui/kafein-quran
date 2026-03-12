import { useState, useCallback } from "react";

export type ShareTheme = 'midnight' | 'emerald' | 'sunset' | 'ocean' | 'minimal' | 'rose' | 'custom';

interface GenerateImageProps {
  id: number;
  textArabic?: string;
  translation?: string;
  takhrij?: string;
  grade?: string;
  theme: ShareTheme;
  showArabic: boolean;
  showTranslation: boolean;
  showGrade: boolean;
  customBg?: string; // Data URL
  customTextColor?: string;
}

// Helper for older browsers that don't support roundRect
const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
  if (ctx.roundRect) {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
};

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
  },
  custom: {
    bg: ["#334155", "#1e293b", "#0f172a"],
    primary: "#10b981",
    secondary: "#94a3b8",
    text: "#ffffff",
    accent: "rgba(16, 185, 129, 0.25)",
    pattern: false
  }
};

export function useHadithCanvas() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = useCallback(async (data: GenerateImageProps) => {
    const { 
      id, 
      textArabic, 
      translation, 
      takhrij,
      grade,
      theme: themeKey,
      showArabic,
      showTranslation,
      showGrade,
      customBg,
      customTextColor
    } = data;
    
    setIsGenerating(true);

    const arabicFont = "'LPMQ Isep Misbah', serif";
    const sansFont = "'Outfit', 'Inter', sans-serif";

    try {
      if (showArabic) {
        await document.fonts.load("12px 'LPMQ Isep Misbah'");
        await document.fonts.ready;
      }
    } catch (e) {
      console.warn("Font loading skipped", e);
    }

    const theme = { ...(THEMES[themeKey] || THEMES.midnight) };
    
    if (customTextColor) {
      theme.text = customTextColor;
      theme.secondary = `${customTextColor}CC`;
      theme.accent = `${customTextColor}26`;
      theme.primary = customTextColor;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsGenerating(false);
      return;
    }

    const width = 1080;
    const padding = 80;
    const maxWidth = width - (padding * 2);
    
    let currentHeight = 0;
    const margins = {
      header: 100,
      arabic: 120,
      separator: 80,
      translation: 60,
      grade: 60,
      footer: 150
    };

    currentHeight += 250; 

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

    let arabicHeight = 0;
    if (showArabic && textArabic) {
      ctx.font = `80px ${arabicFont}`;
      arabicHeight = wrapText(textArabic, ctx, maxWidth, 140, false, 0, 0, true);
    }

    let translationHeight = 0;
    if (showTranslation && translation) {
      ctx.font = `italic 36px ${sansFont}`;
      translationHeight = wrapText(translation, ctx, maxWidth, 55, false);
    }

    let midHeight = 0;
    if (showGrade && (grade || takhrij)) {
      midHeight = 120;
    }

    let totalHeight = currentHeight;
    if (showArabic && textArabic) totalHeight += arabicHeight + margins.arabic;
    if (showArabic && showTranslation && textArabic && translation) totalHeight += margins.separator;
    if (showTranslation && translation) totalHeight += translationHeight + margins.translation;
    totalHeight += midHeight + margins.footer;

    canvas.width = width;
    canvas.height = Math.max(1920, totalHeight);

    const drawBg = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, theme.bg[0]);
      gradient.addColorStop(0.5, theme.bg[1]);
      gradient.addColorStop(1, theme.bg[2] || theme.bg[1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (theme.pattern && themeKey !== 'custom') {
        ctx.save();
        ctx.globalAlpha = 0.07;
        ctx.strokeStyle = theme.primary;
        ctx.lineWidth = 1;
        const patternSize = 120;
        for (let x = 0; x < canvas.width + patternSize; x += patternSize) {
          for (let y = 0; y < canvas.height + patternSize; y += patternSize) {
            ctx.beginPath();
            ctx.moveTo(x, y - 20); ctx.lineTo(x + 20, y); ctx.lineTo(x, y + 20); ctx.lineTo(x - 20, y); ctx.closePath();
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      if (themeKey !== 'minimal' && themeKey !== 'custom') {
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = theme.primary;
        ctx.filter = "blur(120px)";
        ctx.beginPath(); ctx.arc(canvas.width, 0, 800, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(0, canvas.height, 600, 0, Math.PI * 2); ctx.fill();
        ctx.filter = "none";
        ctx.restore();
      }
    };

    const drawCustomBg = async () => {
      if (customBg) {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
            const x = (canvas.width - img.width * scale) / 2;
            const y = (canvas.height - img.height * scale) / 2;
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            resolve();
          };
          img.onerror = () => {
            drawBg();
            resolve();
          };
          img.src = customBg;
        });
      } else {
        drawBg();
      }
    };

    if (themeKey === 'custom' && customBg) {
      await drawCustomBg();
    } else {
      drawBg();
    }

    let cursorY = 150;
    ctx.font = `700 48px ${sansFont}`;
    ctx.fillStyle = theme.text;
    ctx.textAlign = "center";
    ctx.fillText("Kafein Quran", canvas.width / 2, cursorY);

    cursorY += 75;
    ctx.font = `600 42px ${sansFont}`;
    ctx.fillStyle = theme.secondary;
    ctx.fillText(`Hadis #${id}`, canvas.width / 2, cursorY);
    
    cursorY += 180;

    if (showArabic && textArabic) {
      ctx.font = `80px ${arabicFont}`;
      ctx.fillStyle = theme.text;
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 10;
      const h = wrapText(textArabic, ctx, maxWidth, 140, true, canvas.width / 2, cursorY, true);
      ctx.shadowBlur = 0;
      cursorY += h + margins.arabic / 2;
    }

    if (showArabic && showTranslation && textArabic && translation) {
      cursorY += 20;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 150, cursorY);
      ctx.lineTo(canvas.width / 2 + 150, cursorY);
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.stroke();
      cursorY += 100;
    }

    if (showTranslation && translation) {
      ctx.font = `italic 38px ${sansFont}`;
      ctx.fillStyle = theme.secondary;
      const h = wrapText(translation, ctx, maxWidth, 60, true, canvas.width / 2, cursorY, false);
      cursorY += h + margins.translation;
    }

    if (showGrade && (grade || takhrij)) {
      ctx.font = `bold 32px ${sansFont}`;
      ctx.fillStyle = theme.primary;
      const info = [grade, takhrij].filter(Boolean).join(" • ");
      ctx.fillText(info, canvas.width / 2, cursorY);
    }

    ctx.save();
    const footerY = canvas.height - 120;
    ctx.font = `300 32px ${sansFont}`;
    ctx.textAlign = "center";
    
    if (themeKey !== 'minimal') {
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.beginPath();
      drawRoundedRect(ctx, canvas.width/2 - 200, footerY - 45, 400, 70, 35);
      ctx.fill();
    }
    
    ctx.fillStyle = theme.secondary;
    const domain = typeof window !== "undefined" ? window.location.hostname : "quran.kafein.web.id";
    ctx.fillText(domain, canvas.width / 2, footerY);
    ctx.restore();

    setPreviewUrl(canvas.toDataURL("image/png"));
    setIsGenerating(false);
  }, []);

  return { previewUrl, isGenerating, generateImage };
}
