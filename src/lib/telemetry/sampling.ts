export function shouldSample(sampleRate: number): boolean {
  return Math.random() < sampleRate;
}
