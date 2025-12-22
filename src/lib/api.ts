import { API_BASE_URL, DEFAULT_LANGUAGE, DEFAULT_TRANSLATION_ID, DEFAULT_TAFSIR_ID } from './constants';
import { ChaptersResponse, VersesResponse, TafsirResponse, Verse, SearchResponse } from '@/types';

const RIOASTAMAL_URL = 'https://raw.githubusercontent.com/rioastamal/quran-json/master';

export async function searchVerses(query: string, page: number = 1): Promise<SearchResponse> {
  const res = await fetch(
    `${API_BASE_URL}/search?q=${encodeURIComponent(query)}&language=${DEFAULT_LANGUAGE}&size=20&page=${page}`
  );
  if (!res.ok) throw new Error('Failed to search verses');
  return res.json();
}

export async function getChapters(): Promise<ChaptersResponse> {
  const res = await fetch(`${API_BASE_URL}/chapters?language=${DEFAULT_LANGUAGE}`);
  if (!res.ok) throw new Error('Failed to fetch chapters');
  return res.json();
}

export async function getChapter(id: number | string) {
  const res = await fetch(`${API_BASE_URL}/chapters/${id}?language=${DEFAULT_LANGUAGE}`);
  if (!res.ok) throw new Error('Failed to fetch chapter');
  return res.json();
}

export async function getVerses(chapterId: number | string): Promise<VersesResponse> {
  // Fetch from rioastamal as requested by user to fix rendering issues
  const res = await fetch(`${RIOASTAMAL_URL}/surah/${chapterId}.json`);
  if (!res.ok) throw new Error('Failed to fetch verses from rioastamal');
  
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
          text: surahData.translations.id.text[key]
        }
      ],
      words: [] // Rioastamal does not provide word-by-word data
    };
  });

  return {
    verses,
    pagination: {
      per_page: verses.length,
      current_page: 1,
      next_page: null,
      total_pages: 1,
      total_records: verses.length
    }
  };
}

export async function getVersesByPage(pageNumber: number | string): Promise<VersesResponse> {
  // Rioastamal doesn't provide page-based data easily. 
  // For now, we fallback to quran.com but this might still have the rendering issues the user complained about.
  const res = await fetch(
    `${API_BASE_URL}/verses/by_page/${pageNumber}?language=${DEFAULT_LANGUAGE}&words=true&translations=${DEFAULT_TRANSLATION_ID}&fields=text_uthmani`
  );
  if (!res.ok) throw new Error('Failed to fetch verses by page');
  return res.json();
}

export async function getVersesByJuz(juzNumber: number | string): Promise<VersesResponse> {
  const res = await fetch(
    `${API_BASE_URL}/verses/by_juz/${juzNumber}?language=${DEFAULT_LANGUAGE}&words=true&translations=${DEFAULT_TRANSLATION_ID}&fields=text_uthmani`
  );
  if (!res.ok) throw new Error('Failed to fetch verses by juz');
  return res.json();
}

export async function getTafsir(ayahKey: string): Promise<TafsirResponse> {
  try {
    const [surahId, verseNum] = ayahKey.split(':');
    
    // Fetch full surah data from Rioastamal (reliable source)
    const res = await fetch(`${RIOASTAMAL_URL}/surah/${surahId}.json`);
    if (!res.ok) throw new Error('Failed to fetch tafsir source');
    
    const data = await res.json();
    const surahData = data[surahId];
    
    // Rioastamal structure: surahData.tafsir.id.kemenag.text[verseNum]
    // Use optional chaining carefully
    const tafsirText = surahData?.tafsir?.id?.kemenag?.text?.[verseNum];

    if (!tafsirText) {
       throw new Error('Tafsir not found for this verse');
    }

    // Return in the format expected by the UI (TafsirResponse)
    return {
      tafsir: {
        id: 33, // Kemenag ID
        resource_id: 33,
        text: tafsirText,
      }
    } as unknown as TafsirResponse;
  } catch (error) {
    console.error("Tafsir fetch error:", error);
    throw new Error('Gagal memuat tafsir.');
  }
}
