import fs from 'fs/promises';
import path from 'path';
import { ChaptersResponse, VersesResponse, Verse, SearchResponse, SearchResult } from '@/types';
import { API_BASE_URL, DEFAULT_LANGUAGE, DEFAULT_TRANSLATION_ID } from './constants';

// Helper to read JSON
async function readJson(relativePath: string) {
  // Turbopack warning mitigation: Obfuscate path to prevent static globbing
  const segments = ['data', 'quran-json', 'dist'];
  const filePath = path.resolve(process.cwd(), ...segments, relativePath);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}`, error);
    return null;
  }
}

export async function getChaptersLocal(): Promise<ChaptersResponse> {
  const data = await readJson('quran_id.json');
  if (!data) return { chapters: [] };

  return {
    chapters: data.map((c: any) => ({
      id: c.id,
      name_simple: c.transliteration,
      name_complex: c.transliteration,
      name_arabic: c.name,
      verses_count: c.total_verses,
      revelation_place: c.type,
      revelation_order: 0,
      bismillah_pre: false,
      pages: [],
      translated_name: {
        language_name: 'indonesian',
        name: c.translation
      }
    }))
  };
}

export async function getVersesLocal(chapterId: number | string): Promise<VersesResponse> {
  const idStr = String(chapterId);
  const data = await readJson(`chapters/id/${idStr}.json`);
  
  if (!data) throw new Error('Chapter not found locally');

  const verses: Verse[] = data.verses.map((v: any) => ({
    id: parseInt(`${idStr}${v.id}`), 
    verse_number: v.id,
    verse_key: `${idStr}:${v.id}`,
    text_uthmani: v.text, 
    hizb_number: 0,
    rub_el_hizb_number: 0,
    ruku_number: 0,
    manzil_number: 0,
    sajdah_number: null,
    juz_number: 0,
    page_number: 0,
    translations: [{
      id: DEFAULT_TRANSLATION_ID,
      resource_id: DEFAULT_TRANSLATION_ID,
      text: v.translation
    }],
    words: []
  }));

  return { verses, pagination: { per_page: verses.length, current_page: 1, next_page: null, total_pages: 1, total_records: verses.length } };
}

export async function getVersesByPageLocal(pageNumber: number | string): Promise<VersesResponse> {
  const res = await fetch(
    `${API_BASE_URL}/verses/by_page/${pageNumber}?language=${DEFAULT_LANGUAGE}&words=false&translations=${DEFAULT_TRANSLATION_ID}`
  );
  if (!res.ok) throw new Error("Failed to fetch page structure");
  const data = await res.json();
  
  return await hydrateVerses(data.verses);
}

const JUZ_STARTS: Record<number, { c: number, v: number }> = {
  1: { c: 1, v: 1 },
  2: { c: 2, v: 142 },
  3: { c: 2, v: 253 },
  4: { c: 3, v: 93 },
  5: { c: 4, v: 24 },
  6: { c: 4, v: 148 },
  7: { c: 5, v: 82 },
  8: { c: 6, v: 111 },
  9: { c: 7, v: 88 },
  10: { c: 8, v: 41 },
  11: { c: 9, v: 93 },
  12: { c: 11, v: 6 },
  13: { c: 12, v: 53 },
  14: { c: 15, v: 1 },
  15: { c: 17, v: 1 },
  16: { c: 18, v: 75 },
  17: { c: 21, v: 1 },
  18: { c: 23, v: 1 },
  19: { c: 25, v: 21 },
  20: { c: 27, v: 56 },
  21: { c: 29, v: 46 },
  22: { c: 33, v: 31 },
  23: { c: 35, v: 28 },
  24: { c: 38, v: 32 },
  25: { c: 41, v: 47 },
  26: { c: 46, v: 1 },
  27: { c: 51, v: 31 },
  28: { c: 58, v: 1 },
  29: { c: 67, v: 1 },
  30: { c: 78, v: 1 },
};

export async function getVersesByJuzLocal(juzNumber: number | string): Promise<VersesResponse> {
  const juz = typeof juzNumber === 'string' ? parseInt(juzNumber) : juzNumber;
  
  const start = JUZ_STARTS[juz];
  if (!start) throw new Error(`Invalid Juz: ${juzNumber}`);

  const nextStart = JUZ_STARTS[juz + 1] || { c: 115, v: 1 };

  const { chapters } = await getChaptersLocal();
  const chapterCounts = Object.fromEntries(chapters.map(c => [c.id, c.verses_count]));

  const structuralVerses: any[] = [];
  let currentC = start.c;
  let currentV = start.v;

  while (currentC < nextStart.c || (currentC === nextStart.c && currentV < nextStart.v)) {
    structuralVerses.push({
      id: parseInt(`${currentC}${currentV}`),
      verse_number: currentV,
      verse_key: `${currentC}:${currentV}`,
      juz_number: juz,
      page_number: Math.min(604, Math.max(1, Math.ceil(juz * 20.13))) // Approximate page number
    });

    currentV++;
    if (currentV > (chapterCounts[currentC] || 0)) {
      currentV = 1;
      currentC++;
      if (currentC > 114) break;
    }
  }
  
  return await hydrateVerses(structuralVerses);
}


async function hydrateVerses(structuralVerses: any[]): Promise<VersesResponse> {
  const chapterIds = new Set<number>();
  structuralVerses.forEach((v: any) => {
    const cid = parseInt(v.verse_key.split(':')[0]);
    chapterIds.add(cid);
  });

  const chapterCache: Record<number, any> = {};
  await Promise.all(Array.from(chapterIds).map(async (cid) => {
     const cData = await readJson(`chapters/id/${cid}.json`);
     if(cData) chapterCache[cid] = cData;
  }));

  const verses: Verse[] = structuralVerses.map((v: any) => {
    const [cidStr, vidStr] = v.verse_key.split(':');
    const cid = parseInt(cidStr);
    const vid = parseInt(vidStr);
    
    const localVerse = chapterCache[cid]?.verses.find((lv: any) => lv.id === vid);
    
    if (localVerse) {
       return {
         ...v,
         text_uthmani: localVerse.text,
         translations: [{
            id: DEFAULT_TRANSLATION_ID,
            resource_id: DEFAULT_TRANSLATION_ID,
            text: localVerse.translation
         }],
         words: []
       };
    }
    return v;
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

export async function searchVersesLocal(query: string): Promise<SearchResponse> {
  const queryLower = query.toLowerCase();
  const validChapterIds = Array.from({length: 114}, (_, i) => i + 1);
  
  const allResults = await Promise.all(validChapterIds.map(async (cid) => {
     const cData = await readJson(`chapters/id/${cid}.json`);
     if(!cData) return [];
     
     const matches = cData.verses.filter((v: any) => {
         const trans = (v.translation || '').toLowerCase();
         const text = (v.text || ''); 
         const translit = (v.transliteration || '').toLowerCase();
         return trans.includes(queryLower) || text.includes(query) || translit.includes(queryLower);
     }).map((v: any) => ({
         verse_key: `${cid}:${v.id}`,
         verse_id: parseInt(`${cid}${v.id}`),
         text: v.text, 
         translations: [{ 
            text: v.translation,
            resource_id: DEFAULT_TRANSLATION_ID,
            name: "Indonesian",
            language_name: "indonesian"
         }]
     }));
     return matches;
  }));
  
  const results = allResults.flat();
  
  return {
    search: {
      query,
      total_results: results.length,
      current_page: 1,
      total_pages: Math.ceil(results.length / 20),
      results: results.slice(0, 20)
    }
  };
}
