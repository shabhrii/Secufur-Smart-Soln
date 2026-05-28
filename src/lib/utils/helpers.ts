export function generatePlaceholderId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}
