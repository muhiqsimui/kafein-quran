import fs from 'fs/promises';
import path from 'path';

export interface Hadith {
  number: number;
  arab: string;
  id: string; // Translation
}

export interface Narrator {
  name: string;
  slug: string;
  total: number;
}

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'data-hadist');

// In-memory cache for hadiths
const hadithCache = new Map<string, Hadith[]>();

export async function getNarrators(): Promise<Narrator[]> {
  const content = await fs.readFile(path.join(DATA_PATH, 'list.json'), 'utf-8');
  return JSON.parse(content);
}

export async function getHadithsByNarrator(slug: string): Promise<Hadith[]> {
  if (hadithCache.has(slug)) {
    return hadithCache.get(slug)!;
  }

  try {
    const content = await fs.readFile(path.join(DATA_PATH, `${slug}.json`), 'utf-8');
    const data = JSON.parse(content);
    hadithCache.set(slug, data);
    return data;
  } catch (error) {
    console.error(`Error reading hadith file for ${slug}:`, error);
    return [];
  }
}

export async function getPaginatedHadiths(
  slug: string,
  page: number = 1,
  limit: number = 20,
  searchQuery: string = ''
) {
  let hadiths = await getHadithsByNarrator(slug);

  if (searchQuery) {
    const queryLower = searchQuery.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 0);

    hadiths = hadiths.filter((h) => {
      const trans = h.id.toLowerCase();
      const arab = h.arab;
      const num = h.number.toString();

      // For exact number match
      if (queryWords.length === 1 && num === queryWords[0]) {
        return true;
      }

      // Intersection search: all words must be found in either translation, arab, or number
      return queryWords.every(
        (word) =>
          trans.includes(word) || arab.includes(word) || num.includes(word)
      );
    });
  }

  const totalResults = hadiths.length;
  const totalPages = Math.ceil(totalResults / limit);
  const offset = (page - 1) * limit;
  const paginatedHadiths = hadiths.slice(offset, offset + limit);

  return {
    hadiths: paginatedHadiths,
    pagination: {
      currentPage: page,
      totalPages,
      totalResults,
      limit,
    },
  };
}
