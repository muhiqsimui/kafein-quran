import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeQuranText(text: string): string {
  if (!text) return text;

  // 1. Remove Fatha (U+064E) before Small Alif (U+0670) 
  // This is a common issue in some data sources where both are present
  // resulting in overlapping marks (tertimpa).
  let normalized = text.replace(/\u064E\u0670/g, '\u0670');

  // 2. Fix the "redundant" marks in other combinations if any
  // Some fonts also struggle with Shadda + other vowel orders
  
  return normalized;
}
