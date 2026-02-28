export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function getFirstLetter(surname: string): string {
  if (!surname) return '';
  const upper = normalizeText(surname).toUpperCase();
  if (upper.startsWith('CH')) return 'CH';
  return upper.substring(0, 1);
}

export function generateCzechAlphabet(): string[] {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  letters.push('CH');
  return letters.sort((a, b) => {
    if (a === 'CH' && b === 'I') return -1;
    if (a === 'I' && b === 'CH') return 1;
    if (a === 'CH' && b > 'H' && b < 'I') return 1;
    if (b === 'CH' && a > 'H' && a < 'I') return -1;
    return a.localeCompare(b, 'cs');
  });
}
