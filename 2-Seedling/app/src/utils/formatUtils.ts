export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units: string[] = ['B', 'KB', 'MB', 'GB'];
  const i: number = Math.floor(Math.log(bytes) / Math.log(1024));
  const size: number = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
