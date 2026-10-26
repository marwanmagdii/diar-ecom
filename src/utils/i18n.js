// Shared bilingual helpers for product options / attribute values.
// Handles three storage formats: "English / عربي", plain English, plain Arabic.

const PAIRS = [
  ['color', 'اللون'], ['size', 'المقاس'], ['material', 'الخامة'], ['weight', 'الوزن'], ['style', 'النمط'],
  ['white', 'أبيض'], ['black', 'أسود'], ['red', 'أحمر'], ['blue', 'أزرق'], ['green', 'أخضر'], ['yellow', 'أصفر'],
  ['gray', 'رمادي'], ['grey', 'رمادي'], ['silver', 'فضي'], ['gold', 'ذهبي'], ['pink', 'وردي'], ['purple', 'بنفسجي'],
  ['brown', 'بني'], ['navy', 'كحلي'], ['beige', 'بيج'], ['orange', 'برتقالي'], ['maroon', 'كستنائي'], ['teal', 'فيروزي'],
  ['olive', 'زيتوني'], ['cyan', 'سماوي'], ['magenta', 'قرمزي'],
  ['cotton', 'قطن'], ['polyester', 'بوليستر'], ['leather', 'جلد'], ['plastic', 'بلاستيك'], ['metal', 'معدن'],
  ['wood', 'خشب'], ['glass', 'زجاج'],
  ['classic', 'كلاسيكي'], ['modern', 'حديث'], ['vintage', 'عتيق'], ['sporty', 'رياضي'], ['sport', 'رياضي'],
  ['casual', 'كاجوال'], ['formal', 'رسمي'],
];

const EN_TO_AR = Object.fromEntries(PAIRS);
const AR_TO_EN = Object.fromEntries(PAIRS.filter(([en]) => en !== 'grey' && en !== 'sport').map(([en, ar]) => [ar, en]));
// Common Arabic synonyms stored by admins
Object.assign(AR_TO_EN, { 'لون': 'color', 'الستايل': 'style', 'عنابي': 'maroon', 'تركواز': 'teal' });

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function localize(text, language) {
  if (text === null || text === undefined || text === '') return text;
  const str = String(text).trim();
  if (str.includes('/')) {
    const [en, ar] = str.split('/').map((s) => s.trim());
    if (language === 'ar') return ar || localize(en, 'ar');
    return en || localize(ar, 'en');
  }
  const lower = str.toLowerCase();
  if (language === 'ar') return EN_TO_AR[lower] || str;
  return AR_TO_EN[str] ? capitalize(AR_TO_EN[str]) : str;
}

// Canonical English key for an option name ("Color / اللون" -> "color")
export function optionKey(name) {
  if (!name) return '';
  const first = String(name).split('/')[0].trim().toLowerCase();
  return AR_TO_EN[first] || first;
}

export const isColorOption = (name) => optionKey(name) === 'color';

// Look up an attribute value regardless of whether its key is "Color", "اللون" or "Color / اللون"
export function getAttr(attributes, key) {
  if (!attributes) return undefined;
  const k = Object.keys(attributes).find((a) => optionKey(a) === key);
  return k ? attributes[k] : undefined;
}
