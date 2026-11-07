export type CancelableCallback<TArgs extends unknown[]> = ((...args: TArgs) => void) & {
  cancel: () => void;
  flush: () => void;
};

/** Delay execution until calls stop arriving for the configured interval. */
export function debounce<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delayMs: number,
): CancelableCallback<TArgs> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let latestArgs: TArgs | undefined;

  const debounced = ((...args: TArgs) => {
    latestArgs = args;
    if (timer) clearTimeout(timer);
    timer = setTimeout(
      () => {
        timer = undefined;
        const pending = latestArgs;
        latestArgs = undefined;
        if (pending) callback(...pending);
      },
      Math.max(0, delayMs),
    );
  }) as CancelableCallback<TArgs>;

  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    latestArgs = undefined;
  };

  debounced.flush = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    const pending = latestArgs;
    latestArgs = undefined;
    if (pending) callback(...pending);
  };

  return debounced;
}

/** Run at most once per interval, retaining the latest call as a trailing update. */
export function throttle<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  intervalMs: number,
): CancelableCallback<TArgs> {
  let lastRunAt = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let latestArgs: TArgs | undefined;

  const throttled = ((...args: TArgs) => {
    latestArgs = args;
    const now = Date.now();
    const remaining = Math.max(0, intervalMs) - (now - lastRunAt);

    if (remaining <= 0) {
      if (timer) clearTimeout(timer);
      timer = undefined;
      lastRunAt = now;
      const pending = latestArgs;
      latestArgs = undefined;
      if (pending) callback(...pending);
      return;
    }

    if (!timer) {
      timer = setTimeout(() => {
        timer = undefined;
        lastRunAt = Date.now();
        const pending = latestArgs;
        latestArgs = undefined;
        if (pending) callback(...pending);
      }, remaining);
    }
  }) as CancelableCallback<TArgs>;

  throttled.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    latestArgs = undefined;
  };

  throttled.flush = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    const pending = latestArgs;
    latestArgs = undefined;
    if (pending) {
      lastRunAt = Date.now();
      callback(...pending);
    }
  };

  return throttled;
}
