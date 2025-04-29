export function e(str: unknown): HTMLElement | null {
  if (!str || !document?.getElementById) {
    return null;
  }
  return document.getElementById(String(str));
}
