export function NanoSecondsFormatter(nanoSeconds: number): string {
  if (nanoSeconds === 0) {
    return "0ns";
  }
  const units = ["ns", "μs", "ms", "s"];

  let unitIndex = 0;
  let current = nanoSeconds;
  while (current >= 1000 && unitIndex < units.length - 1) {
    current /= 1000;
    unitIndex++;
  }

  return `${current.toFixed(3)}${units[unitIndex]}`;
}
