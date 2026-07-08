export function average(arr) {
  let sum = 0;
  const size = arr.length;

  if (size === 0) return 0;

  for (let i = 0; i < size; i++) {
    sum += arr[i];
  }

  return sum / size;
}
