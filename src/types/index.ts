export interface Chapter {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_complex: string;
  name_arabic: string;
  name_simple: string;
  verses_count: number;
  pages: number[];
  translated_name: {
    language_name: string;
    name: string;
  };
}

export interface ChaptersResponse {
  chapters: Chapter[];
}

export interface Verse {
  id: number;
  verse_number: number;
  verse_key: string;
  hizb_number: number;
  rub_el_hizb_number: number;
  ruku_number: number;
  manzil_number: number;
  sajdah_number: number | null;
  text_uthmani?: string;
  text_uthmani_simple?: string;
  text_uthmani_tajweed?: string;
  text_imlaei?: string;
  text_imlaei_simple?: string;
  text_indopak?: string;
  juz_number: number;
  page_number: number;
  words?: Word[];
  translations: Translation[];
}

export interface Word {
  id: number;
  position: number;
  audio_url: string | null;
  char_type_name: string;
  text_uthmani: string;
  translation: {
    language_name: string;
    text: string;
  };
  transliteration: {
    language_name: string;
    text: string;
  };
}

export interface Translation {
  id: number;
  resource_id: number;
  text: string;
}

export interface VersesResponse {
  verses: Verse[];
  pagination: {
    per_page: number;
    current_page: number;
    next_page: number | null;
    total_pages: number;
    total_records: number;
  };
}

export interface Tafsir {
  id: number;
  resource_id: number;
  text: string;
}

export interface TafsirResponse {
  tafsir: Tafsir;
}

export interface AudioFile {
  id: number;
  chapter_id: number;
  file_size: number;
  format: string;
  audio_url: string;
}

export interface AudioResponse {
  audio_files: AudioFile[];
}

export interface SearchResult {
  verse_key: string;
  verse_id: number;
  text: string;
  translations: {
    text: string;
    resource_id: number;
    name: string;
    language_name: string;
  }[];
}

export interface SearchResponse {
  search: {
    query: string;
    total_results: number;
    current_page: number;
    total_pages: number;
    results: SearchResult[];
  };
}

export type SearchParams = { [key: string]: string | string[] | undefined };
