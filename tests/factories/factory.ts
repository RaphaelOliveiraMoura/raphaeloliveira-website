export function factory<T>(defaults: () => T) {
  return {
    build(overrides: Partial<T> = {}): T {
      return { ...defaults(), ...overrides };
    },
    buildList(count: number, overrides: Partial<T> = {}): T[] {
      return Array.from({ length: count }, () => this.build(overrides));
    },
  };
}
