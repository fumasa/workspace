export function random(max: number, min: number = 0): number {
  return Math.random() * (max - min) + min;
}

export function randint(max: number, min: number = 0): number {
  if (!max) return 0;
  return random(max + 1, min) | 0;
}