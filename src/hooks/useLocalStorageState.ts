import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

export function useLocalStorageState<T>(
  initialState: T,
  key: string,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue === null ? initialState : (JSON.parse(storedValue) as T);
    } catch {
      return initialState;
    }
  });

  useEffect(
    function () {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Storage can be disabled or full; keep the in-memory collection usable.
      }
    },
    [value, key],
  );

  return [value, setValue];
}
