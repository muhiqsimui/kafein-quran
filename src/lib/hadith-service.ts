export const API_BASE = 'https://api.myquran.com/v3';

// ========== Types ==========

export interface HadisEncMeta {
  name: string;
  desc: string;
  lang: string;
  ver: string;
  last_update: string;
  source: string;
}

export interface HadisEncText {
  ar: string;
  id: string;
}

export interface HadisEncDetail {
  id: number;
  text: HadisEncText;
  grade: string | null;
  takhrij: string | null;
  hikmah: string | null;
  prev: number | null;
  next: number | null;
}

export interface HadisEncEntry {
  id: number;
  text: HadisEncText;
  grade: string | null;
  takhrij: string | null;
  hikmah: string | null;
}

export interface HadisEncPaging {
  current: number;
  per_page: number;
  total_data: number;
  total_pages: number;
  has_prev: boolean;
  has_next: boolean;
  next_page: number | null;
  prev_page: number | null;
  first_page: number | null;
  last_page: number | null;
}

export interface HadisEncSearchHit {
  id: number;
  text: string;
  focus: string[];
}

export interface PerawiSummary {
  total: number;
  last_update: string;
  sumber: string;
}

export interface PerawiDetail {
  id: number;
  name: string | null;
  grade: string | null;
  parents: string | null;
  spouse: string | null;
  siblings: string | null;
  children: string | null;
  birth_date_place: string | null;
  places_of_stay: string | null;
  death_date_place: string | null;
  teachers: string | null;
  students: string | null;
  area_of_interest: string | null;
  tags: string | null;
  books: string | null;
  birth_place: string | null;
  birth_date: string | null;
  birth_date_hijri: string | null;
  birth_date_gregorian: string | null;
  death_date_hijri: string | null;
  death_date_gregorian: string | null;
  death_place: string | null;
  death_reason: string | null;
}

export interface PerawiBrowseEntry extends PerawiDetail {}

// ========== API Functions ==========

async function apiFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (json.status === false) {
    throw new Error(json.message || 'API returned error');
  }

  return json;
}

// Client-side fetch (no Next.js cache options)
async function clientFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (json.status === false) {
    throw new Error(json.message || 'API returned error');
  }

  return json;
}

// --- Ensiklopedia Hadis ---

export async function getHadisMetadata(): Promise<HadisEncMeta> {
  const res = await apiFetch<{ status: boolean; message: string; data: HadisEncMeta }>('/hadis/enc');
  return res.data;
}

export async function getHadisById(id: number): Promise<HadisEncDetail> {
  const res = await apiFetch<{ status: boolean; message: string; data: HadisEncDetail }>(`/hadis/enc/show/${id}`);
  return res.data;
}

export async function getNextHadis(id: number): Promise<HadisEncDetail> {
  const res = await apiFetch<{ status: boolean; message: string; data: HadisEncDetail }>(`/hadis/enc/next/${id}`);
  return res.data;
}

export async function getPrevHadis(id: number): Promise<HadisEncDetail> {
  const res = await apiFetch<{ status: boolean; message: string; data: HadisEncDetail }>(`/hadis/enc/prev/${id}`);
  return res.data;
}

export async function getRandomHadis(): Promise<HadisEncDetail> {
  const res = await clientFetch<{ status: boolean; message: string; data: HadisEncDetail }>('/hadis/enc/random');
  return res.data;
}

export async function exploreHadis(page: number = 1, limit: number = 10): Promise<{
  paging: HadisEncPaging;
  hadis: HadisEncEntry[];
}> {
  const res = await apiFetch<{
    status: boolean;
    message: string;
    data: { paging: HadisEncPaging; hadis: HadisEncEntry[] };
  }>(`/hadis/enc/explore?page=${page}&limit=${limit}`);
  return res.data;
}

export async function searchHadis(keyword: string, page: number = 1, limit: number = 10): Promise<{
  keyword: string;
  paging: HadisEncPaging;
  hadis: HadisEncSearchHit[];
}> {
  const res = await apiFetch<{
    status: boolean;
    message: string;
    data: { keyword: string; paging: HadisEncPaging; hadis: HadisEncSearchHit[] };
  }>(`/hadis/enc/cari/${encodeURIComponent(keyword)}?page=${page}&limit=${limit}`);
  return res.data;
}

// --- Perawi ---

export async function getPerawiSummary(): Promise<PerawiSummary> {
  const res = await apiFetch<{ status: boolean; message: string; data: PerawiSummary }>('/hadis/perawi');
  return res.data;
}

export async function getPerawiById(id: number): Promise<PerawiDetail> {
  const res = await apiFetch<{ status: boolean; message: string; data: PerawiDetail }>(`/hadist/perawi/id/${id}`);
  return res.data;
}

export async function browsePerawi(page: number = 1, limit: number = 10): Promise<{
  paging: HadisEncPaging;
  rawi: PerawiBrowseEntry[];
}> {
  const res = await apiFetch<{
    status: boolean;
    message: string;
    data: { paging: HadisEncPaging; rawi: PerawiBrowseEntry[] };
  }>(`/hadist/perawi/browse?page=${page}&limit=${limit}`);
  return res.data;
}
