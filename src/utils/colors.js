export const colorHexMap = {
  'white': '#FFFFFF',
  'black': '#000000',
  'blue': '#3B82F6',
  'red': '#EF4444',
  'green': '#22C55E',
  'yellow': '#EAB308',
  'pink': '#EC4899',
  'purple': '#A855F7',
  'gray': '#6B7280',
  'orange': '#F97316',
  'brown': '#92400E',
  'navy': '#1E3A8A',
  'teal': '#14B8A6',
  'olive': '#4D7C0F',
  'maroon': '#831843',
  'silver': '#D1D5DB',
  'gold': '#CA8A04',
  'cyan': '#06B6D4',
  'magenta': '#D946EF',
  'beige': '#F5F5DC'
};

export function getColorHex(colorName) {
  if (!colorName || typeof colorName !== 'string') return '#e2e8f0';
  let normalized = colorName.toLowerCase().trim();
  
  // If bilingual format like "White / أبيض", extract the first part
  if (normalized.includes('/')) {
    normalized = normalized.split('/')[0].trim();
  }
  
  if (colorHexMap[normalized]) return colorHexMap[normalized];
  
  // Validate if it's a valid native CSS color
  const s = new Option().style;
  s.color = normalized;
  if (s.color !== '') {
    return normalized; // It's a valid CSS color (like 'crimson', 'lightblue', or a hex code)
  }
  
  return '#e2e8f0'; // Fallback gray
}
