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

const THEMES: Record<ShareTheme, { bg: string[], primary: string, secondary: string, text: string, accent: string }> = {
  midnight: {
    bg: ["#0f172a", "#1e293b"],
    primary: "#10b981", // Emerald
    secondary: "#94a3b8",
    text: "#ffffff",
    accent: "rgba(16, 185, 129, 0.3)"
  },
  emerald: {
    bg: ["#064e3b", "#065f46"],
    primary: "#34d399",
    secondary: "#a7f3d0",
    text: "#ffffff",
    accent: "rgba(52, 211, 153, 0.3)"
  },
  sunset: {
    bg: ["#4c1d95", "#831843"],
    primary: "#fbbf24",
    secondary: "#fde68a",
    text: "#ffffff",
    accent: "rgba(251, 191, 36, 0.3)"
  },
  ocean: {
    bg: ["#1e3a8a", "#1e40af"],
    primary: "#38bdf8",
    secondary: "#bae6fd",
    text: "#ffffff",
    accent: "rgba(56, 189, 248, 0.3)"
  },
  rose: {
    bg: ["#881337", "#4c0519"],
    primary: "#fda4af",
    secondary: "#fecdd3",
    text: "#ffffff",
    accent: "rgba(253, 164, 175, 0.3)"
  },
  minimal: {
    bg: ["#ffffff", "#f8fafc"],
    primary: "#0f172a",
    secondary: "#64748b",
    text: "#0f172a",
    accent: "rgba(15, 23, 42, 0.1)"
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

    try {
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
      ctx.font = "80px 'Amiri', serif";
      arabicHeight = wrapText(textArabic, ctx, maxWidth, 130, false, 0, 0, true);
    }

    // Calculate Translation Height
    let translationHeight = 0;
    const cleanTrans = translation ? translation.replace(/<(?:.|\n)*?>/gm, "") : "";
    if (showTranslation && cleanTrans) {
      ctx.font = "italic 36px Inter, sans-serif";
      translationHeight = wrapText(cleanTrans, ctx, maxWidth, 55, false);
    }

    // Calculate Note Height
    let noteHeight = 0;
    if (includeNote && note) {
      ctx.font = "italic 32px Inter, sans-serif";
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
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, theme.bg[0]);
      gradient.addColorStop(1, theme.bg[1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Decor
      if (themeKey !== 'minimal') {
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = theme.primary;
        ctx.beginPath(); ctx.arc(canvas.width, 0, 800, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(0, canvas.height, 600, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    };
    drawBg();

    let cursorY = 120;

    // 2. Header
    ctx.font = "bold 45px Inter, sans-serif";
    ctx.fillStyle = theme.primary;
    ctx.textAlign = "center";
    ctx.fillText("Lumina Quran", canvas.width / 2, cursorY);

    cursorY += 70;
    ctx.font = "600 40px Inter, sans-serif";
    ctx.fillStyle = theme.secondary;
    ctx.fillText(`QS. ${chapterName} : ${ayahNumber}`, canvas.width / 2, cursorY);
    
    cursorY += 150;

    // 3. Arabic Text
    if (showArabic && textArabic) {
      ctx.font = "80px 'Amiri', serif";
      ctx.fillStyle = theme.text;
      const h = wrapText(textArabic, ctx, maxWidth, 130, true, canvas.width / 2, cursorY, true);
      cursorY += h + margins.arabic / 2;
    }

    // Separator
    if (showArabic && showTranslation && textArabic && cleanTrans) {
      cursorY += 20;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 120, cursorY);
      ctx.lineTo(canvas.width / 2 + 120, cursorY);
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 4;
      ctx.stroke();
      cursorY += 80;
    } else if (showArabic && textArabic) {
        cursorY += 40;
    }

    // 4. Translation
    if (showTranslation && cleanTrans) {
      ctx.font = "italic 36px Inter, sans-serif";
      ctx.fillStyle = theme.secondary;
      const h = wrapText(cleanTrans, ctx, maxWidth, 55, true, canvas.width / 2, cursorY, false);
      cursorY += h + margins.translation;
    }

    // 5. Note
    if (includeNote && note) {
      cursorY += 20;
      const boxWidth = maxWidth;
      const boxX = (canvas.width - boxWidth) / 2;
      
      // Calculate real note height again for the box
      ctx.font = "italic 32px Inter, sans-serif";
      const h = wrapText(note, ctx, boxWidth - 80, 45, false);
      const boxHeight = h + 120;

      // Draw Box
      ctx.fillStyle = theme.accent;
      if (themeKey === 'minimal') {
          ctx.strokeStyle = theme.secondary;
          ctx.lineWidth = 1;
          ctx.roundRect(boxX, cursorY, boxWidth, boxHeight, 24);
          ctx.stroke();
          ctx.fill();
      } else {
          ctx.beginPath();
          ctx.roundRect(boxX, cursorY, boxWidth, boxHeight, 24);
          ctx.fill();
      }
      
      ctx.fillStyle = theme.primary;
      ctx.font = "bold 26px Inter";
      ctx.textAlign = "left";
      ctx.fillText("Catatan Saya:", boxX + 40, cursorY + 60);
      
      ctx.fillStyle = theme.text;
      ctx.font = "italic 32px Inter";
      wrapText(note, ctx, boxWidth - 80, 45, true, boxX + 40, cursorY + 110, false);
      
      cursorY += boxHeight + margins.note;
    }

    // 6. Footer
    ctx.font = "300 28px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = theme.secondary;
    ctx.fillText("lumina-quran.vercel.app", canvas.width / 2, canvas.height - 100);

    const dataUrl = canvas.toDataURL("image/png");
    setPreviewUrl(dataUrl);
    setIsGenerating(false);
  }, []);

  return { previewUrl, isGenerating, generateImage };
}
