export function average(arr: readonly number[]): number {
  let sum = 0;
  const size = arr.length;

  if (size === 0) return 0;

  for (let i = 0; i < size; i++) {
    sum += arr[i] ?? 0;
  }

  return sum / size;
}
