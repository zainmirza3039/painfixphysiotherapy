import { useEffect, useState } from "react";

/** Keep controlled inputs responsive while deferring expensive derived filtering. */
export function useDebouncedValue<T>(value: T, delayMs = 250): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), Math.max(0, delayMs));
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
