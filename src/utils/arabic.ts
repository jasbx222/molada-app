/** Normalize Arabic for search matching. */
export function normalizeArabic(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670]/g, '') // diacritics
    .replace(/\u0640/g, '') // tatweel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** Build searchable haystack for a subscriber (name, address words + numbers, cable). */
export function subscriberSearchText(s: {
  name: string;
  alley: string;
  house: string;
  cableNo: string;
  phone: string;
}): string {
  const parts = [
    s.name,
    s.alley,
    s.house,
    `زقاق ${s.alley}`,
    `دار ${s.house}`,
    s.cableNo,
    s.phone,
  ];
  return normalizeArabic(parts.join(' '));
}
