import {
  API_BASE_URL,
  DEFAULT_LANGUAGE,
  DEFAULT_TRANSLATION_ID,
  DEFAULT_TAFSIR_ID,
} from "./constants";
import {
  ChaptersResponse,
  VersesResponse,
  TafsirResponse,
  Verse,
  SearchResponse,
} from "@/types";

const RIOASTAMAL_URL =
  "https://raw.githubusercontent.com/rioastamal/quran-json/master";

/**
 * Generate audio URL for a specific verse from a specific qari using EveryAyah API
 * @param reciterId - The reciter ID from EveryAyah (e.g., 'Alafasy_64kbps')
 * @param surahId - The surah number
 * @param verseNumber - The verse number
 * @returns Full audio URL
 */
export function getAudioUrl(
  reciterId: string,
  surahId: number,
  verseNumber: number
): string {
  const surahPadded = String(surahId).padStart(3, "0");
  const versePadded = String(verseNumber).padStart(3, "0");
  return `https://everyayah.com/data/${reciterId}/${surahPadded}${versePadded}.mp3`;
}

export async function searchVerses(
  query: string,
  page: number = 1
): Promise<SearchResponse> {
  const res = await fetch(
    `/api/search?q=${encodeURIComponent(query)}&page=${page}`
  );
  if (!res.ok) throw new Error("Failed to search verses");
  return res.json();
}

export async function getChapters(): Promise<ChaptersResponse> {
  const res = await fetch(
    `${API_BASE_URL}/chapters?language=${DEFAULT_LANGUAGE}`
  );
  if (!res.ok) throw new Error("Failed to fetch chapters");
  return res.json();
}

export async function getChapter(id: number | string) {
  const res = await fetch(
    `${API_BASE_URL}/chapters/${id}?language=${DEFAULT_LANGUAGE}`
  );
  if (!res.ok) throw new Error("Failed to fetch chapter");
  return res.json();
}

export async function getVerses(
  chapterId: number | string
): Promise<VersesResponse> {
  // Fetch from rioastamal as requested by user to fix rendering issues
  const res = await fetch(`${RIOASTAMAL_URL}/surah/${chapterId}.json`);
  if (!res.ok) throw new Error("Failed to fetch verses from rioastamal");

  const data = await res.json();
  const surahData = data[Object.keys(data)[0]]; // The JSON is keyed by surah number string

  const verses: Verse[] = Object.keys(surahData.text).map((key) => {
    const verseNumber = parseInt(key);
    return {
      id: parseInt(`${chapterId}${verseNumber}`),
      verse_number: verseNumber,
      verse_key: `${chapterId}:${verseNumber}`,
      text_uthmani: surahData.text[key],
      juz_number: 0, // Placeholder
      page_number: 0, // Placeholder
      hizb_number: 0, // Placeholder
      rub_el_hizb_number: 0, // Placeholder
      ruku_number: 0, // Placeholder
      manzil_number: 0, // Placeholder
      sajdah_number: null,
      translations: [
        {
          id: DEFAULT_TRANSLATION_ID,
          resource_id: DEFAULT_TRANSLATION_ID,
          text: surahData.translations.id.text[key],
        },
      ],
      words: [], // Rioastamal does not provide word-by-word data
    };
  });

  return {
    verses,
    pagination: {
      per_page: verses.length,
      current_page: 1,
      next_page: null,
      total_pages: 1,
      total_records: verses.length,
    },
  };
}

export async function getVersesByPage(
  pageNumber: number | string
): Promise<VersesResponse> {
  // 1. Fetch the structure (verses list) from Quran.com to know which verses are on this page
  const res = await fetch(
    `${API_BASE_URL}/verses/by_page/${pageNumber}?language=${DEFAULT_LANGUAGE}&words=true&translations=${DEFAULT_TRANSLATION_ID}`
  );
  if (!res.ok) throw new Error("Failed to fetch verses by page");
  const data = await res.json();

  // 2. Identify unique chapters on this page
  const chapterIds = new Set<number>();
  data.verses.forEach((v: any) => {
    const chapterId = parseInt(v.verse_key.split(":")[0]);
    chapterIds.add(chapterId);
  });

  // 3. Fetch text from Rioastamal for these chapters (to ensure consistency with Surah view)
  const chapterTexts: Record<number, Record<string, string>> = {};
  
  await Promise.all(
    Array.from(chapterIds).map(async (chapterId) => {
      try {
        const rRes = await fetch(`${RIOASTAMAL_URL}/surah/${chapterId}.json`);
        if (rRes.ok) {
          const rData = await rRes.json();
          const surahData = rData[String(chapterId)];
          chapterTexts[chapterId] = surahData.text;
        }
      } catch (e) {
        console.error(`Failed to fetch Rioastamal text for chapter ${chapterId}`, e);
      }
    })
  );

  // 4. Map the Rioastamal text to the Quran.com verse objects
  data.verses = data.verses.map((v: any) => {
    const [chapterIdStr, verseNumStr] = v.verse_key.split(":");
    const chapterId = parseInt(chapterIdStr);
    
    // Retrieve text from Rioastamal if available, otherwise fallback to existing
    const rioastamalText = chapterTexts[chapterId]?.[verseNumStr];
    
    return {
      ...v,
      text_uthmani: rioastamalText || v.text_uthmani
    };
  });
  
  return data;
}

export async function getVersesByJuz(
  juzNumber: number | string
): Promise<VersesResponse> {
  // 1. Fetch structure from Quran.com
  const res = await fetch(
    `${API_BASE_URL}/verses/by_juz/${juzNumber}?language=${DEFAULT_LANGUAGE}&words=true&translations=${DEFAULT_TRANSLATION_ID}`
  );
  if (!res.ok) throw new Error("Failed to fetch verses by juz");
  const data = await res.json();

  // 2. Identify unique chapters
  const chapterIds = new Set<number>();
  data.verses.forEach((v: any) => {
    const chapterId = parseInt(v.verse_key.split(":")[0]);
    chapterIds.add(chapterId);
  });

  // 3. Fetch Rioastamal text
  const chapterTexts: Record<number, Record<string, string>> = {};
  await Promise.all(
    Array.from(chapterIds).map(async (chapterId) => {
      try {
        const rRes = await fetch(`${RIOASTAMAL_URL}/surah/${chapterId}.json`);
        if (rRes.ok) {
          const rData = await rRes.json();
          chapterTexts[chapterId] = rData[String(chapterId)].text;
        }
      } catch (e) {
        console.error(`Failed to fetch Rioastamal text for chapter ${chapterId}`, e);
      }
    })
  );

  // 4. Map text
  data.verses = data.verses.map((v: any) => {
    const [chapterIdStr, verseNumStr] = v.verse_key.split(":");
    const chapterId = parseInt(chapterIdStr);
    const rioastamalText = chapterTexts[chapterId]?.[verseNumStr];
    
    return {
      ...v,
      text_uthmani: rioastamalText || v.text_uthmani
    };
  });

  return data;
}

export async function getTafsir(ayahKey: string): Promise<TafsirResponse> {
  try {
    const [surahId, verseNum] = ayahKey.split(":");

    // Fetch full surah data from Rioastamal (reliable source)
    const res = await fetch(`${RIOASTAMAL_URL}/surah/${surahId}.json`);
    if (!res.ok) throw new Error("Failed to fetch tafsir source");

    const data = await res.json();
    const surahData = data[surahId];

    // Rioastamal structure: surahData.tafsir.id.kemenag.text[verseNum]
    const tafsirText = surahData?.tafsir?.id?.kemenag?.text?.[verseNum];

    if (!tafsirText) {
      throw new Error("Tafsir not found for this verse");
    }

    return {
      tafsir: {
        id: 33,
        resource_id: 33,
        text: tafsirText,
      },
    } as unknown as TafsirResponse;
  } catch (error) {
    console.error("Tafsir fetch error:", error);
    throw new Error("Gagal memuat tafsir.");
  }
}

export async function getVerseByKey(ayahKey: string): Promise<Verse | null> {
  try {
    const [chapterId, verseNumber] = ayahKey.split(":");
    const data = await getVerses(parseInt(chapterId));
    return (
      data.verses.find((v) => v.verse_number === parseInt(verseNumber)) || null
    );
  } catch (error) {
    console.error("Failed to fetch verse by key", error);
    return null;
  }
}

