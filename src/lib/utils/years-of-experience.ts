export function calculateYearsOfExperience(): number {
  const start = new Date(2019, 2, 1); // mar/2019
  const now = new Date();
  return Math.ceil(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25),
  );
}
